from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DataSourceConnectionBase(BaseModel):
    name: str
    type: str  # postgresql, mysql, sqlite
    host: str
    port: int
    database: str
    username: str
    password: str


class DataSourceConnectionCreate(DataSourceConnectionBase):
    pass


class DataSourceConnectionUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None


class DataSourceConnectionResponse(BaseModel):
    id: str
    name: str
    type: str
    host: str
    port: int
    database: str
    username: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestConnectionRequest(BaseModel):
    type: str
    host: str
    port: int
    database: str
    username: str
    password: str


class TestConnectionResponse(BaseModel):
    success: bool
    message: str


class DatabaseSchemaResponse(BaseModel):
    tables: dict
