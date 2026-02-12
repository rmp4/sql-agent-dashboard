from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine
from typing import Optional, List, Dict, Any
import os


class DatabaseService:
    def __init__(self, database_url: Optional[str] = None):
        self.database_url = database_url or os.getenv("DATABASE_URL")
        self.engine: Optional[Engine] = None

        if self.database_url:
            try:
                self.engine = create_engine(self.database_url)
            except Exception as e:
                print(f"Failed to connect to database: {e}")

    def get_schema(self) -> Dict[str, List[Dict[str, Any]]]:
        if not self.engine:
            return {}

        inspector = inspect(self.engine)
        schema = {}

        for table_name in inspector.get_table_names():
            columns = []
            for column in inspector.get_columns(table_name):
                columns.append(
                    {
                        "name": column["name"],
                        "type": str(column["type"]),
                        "nullable": column.get("nullable", True),
                        "default": column.get("default"),
                    }
                )
            schema[table_name] = columns

        return schema

    def execute_query(self, sql: str) -> Dict[str, Any]:
        if not self.engine:
            raise Exception("Database not connected")

        with self.engine.connect() as connection:
            result = connection.execute(text(sql))

            if result.returns_rows:
                rows = result.fetchall()
                columns = list(result.keys())
                return {
                    "columns": columns,
                    "rows": [dict(zip(columns, row)) for row in rows],
                    "row_count": len(rows),
                }
            else:
                return {
                    "columns": [],
                    "rows": [],
                    "row_count": result.rowcount,
                }

    def test_connection(self) -> bool:
        if not self.engine:
            return False

        try:
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True
        except Exception:
            return False
