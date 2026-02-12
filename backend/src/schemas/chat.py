from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    rules: Optional[List[Dict[str, Any]]] = None
    data_source_id: Optional[str] = None


class QueryResult(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int


class VisualizationConfig(BaseModel):
    type: str
    xKey: Optional[str] = None
    yKeys: Optional[List[str]] = None
    title: Optional[str] = None
    barKeys: Optional[List[str]] = None
    lineKeys: Optional[List[str]] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sql: Optional[str] = None
    query_result: Optional[QueryResult] = None
    visualization: Optional[VisualizationConfig] = None
    metadata: Optional[Dict[str, Any]] = None


class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class Message(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None


class DataSourceCreate(BaseModel):
    name: str
    type: str
    config: Dict[str, Any]


class DataSource(BaseModel):
    id: str
    name: str
    type: str
    enabled: bool


class TableInfo(BaseModel):
    name: str
    schema_name: Optional[str] = None
    columns: List[Dict[str, str]]
    enabled: bool
