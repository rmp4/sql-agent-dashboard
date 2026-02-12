from fastapi import APIRouter, HTTPException
from src.services.database import DatabaseService
from pydantic import BaseModel
from typing import Dict, List, Any

router = APIRouter(tags=["data-sources"])


class TestConnectionRequest(BaseModel):
    database_url: str


class ExecuteQueryRequest(BaseModel):
    sql: str
    database_url: str


@router.post("/data-sources/test")
async def test_connection(request: TestConnectionRequest):
    try:
        db_service = DatabaseService(database_url=request.database_url)
        is_connected = db_service.test_connection()

        return {
            "success": is_connected,
            "message": "Connection successful" if is_connected else "Connection failed",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/data-sources/schema")
async def get_schema(request: TestConnectionRequest):
    try:
        db_service = DatabaseService(database_url=request.database_url)
        schema = db_service.get_schema()

        return {"schema": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/data-sources/execute")
async def execute_query(request: ExecuteQueryRequest):
    try:
        db_service = DatabaseService(database_url=request.database_url)
        result = db_service.execute_query(request.sql)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
