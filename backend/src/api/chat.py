from fastapi import APIRouter, HTTPException
from src.schemas.chat import ChatRequest, ChatResponse, QueryResult, VisualizationConfig
from src.services.llm import LLMService
from src.services.database import DatabaseService
from datetime import datetime
import uuid
import re
import os

router = APIRouter(tags=["chat"])

llm_service = LLMService()


def extract_sql_from_response(text: str) -> str | None:
    sql_pattern = r"```sql\s*(.*?)\s*```"
    match = re.search(sql_pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def infer_visualization(
    query_result: QueryResult, sql_lower: str
) -> VisualizationConfig:
    columns = query_result.columns

    if len(columns) < 2:
        return VisualizationConfig(type="table")

    time_keywords = ["date", "time", "month", "year", "day"]
    has_time_column = any(
        keyword in col.lower() for col in columns for keyword in time_keywords
    )

    category_keywords = ["group by", "category", "name", "region", "type"]
    has_category = any(keyword in sql_lower for keyword in category_keywords)

    numeric_cols = [col for col in columns if col not in [columns[0]]]

    if has_time_column and numeric_cols:
        return VisualizationConfig(
            type="line",
            xKey=columns[0],
            yKeys=numeric_cols,
            title=f"{' + '.join(numeric_cols)} over time",
        )
    elif has_category and numeric_cols:
        return VisualizationConfig(
            type="bar",
            xKey=columns[0],
            yKeys=numeric_cols,
            title=f"{' + '.join(numeric_cols)} by {columns[0]}",
        )
    else:
        return VisualizationConfig(type="table")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())

        schema_context = None
        db_service = None

        database_url = os.getenv("DATABASE_URL")
        if database_url:
            try:
                db_service = DatabaseService(database_url=database_url)
                schema_context = db_service.get_schema()
            except Exception as e:
                print(f"Failed to get schema: {e}")

        response_text, visualization_config_dict = await llm_service.generate_response(
            message=request.message,
            conversation_id=conversation_id,
            schema_context=schema_context,
            rules=request.rules,
        )

        sql_query = extract_sql_from_response(response_text)
        query_result = None
        visualization_config = None

        if sql_query and db_service:
            try:
                result_dict = db_service.execute_query(sql_query)
                query_result = QueryResult(**result_dict)

                if visualization_config_dict:
                    visualization_config = VisualizationConfig(
                        **visualization_config_dict
                    )
                elif query_result and len(query_result.columns) >= 2:
                    visualization_config = infer_visualization(
                        query_result, sql_query.lower()
                    )
                else:
                    visualization_config = VisualizationConfig(type="table")
            except Exception as e:
                print(f"Failed to execute query: {e}")

        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            sql=sql_query,
            query_result=query_result,
            visualization=visualization_config,
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "model": "gpt-4",
                "has_schema": schema_context is not None,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
