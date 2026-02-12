from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from src.models import get_db
from src.models.models import DataSourceConnection
from src.schemas.data_source import (
    DataSourceConnectionCreate,
    DataSourceConnectionUpdate,
    DataSourceConnectionResponse,
    TestConnectionResponse,
    DatabaseSchemaResponse,
)
from src.services.database import DatabaseService

router = APIRouter(tags=["data-sources"])


@router.post("/data-sources", response_model=DataSourceConnectionResponse)
async def create_data_source(
    data_source: DataSourceConnectionCreate, db: Session = Depends(get_db)
):
    db_data_source = DataSourceConnection(
        id=str(uuid.uuid4()), status="disconnected", **data_source.model_dump()
    )
    db.add(db_data_source)
    db.commit()
    db.refresh(db_data_source)
    return db_data_source


@router.get("/data-sources", response_model=List[DataSourceConnectionResponse])
async def list_data_sources(db: Session = Depends(get_db)):
    return db.query(DataSourceConnection).all()


@router.get(
    "/data-sources/{data_source_id}", response_model=DataSourceConnectionResponse
)
async def get_data_source(data_source_id: str, db: Session = Depends(get_db)):
    data_source = (
        db.query(DataSourceConnection)
        .filter(DataSourceConnection.id == data_source_id)
        .first()
    )
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")
    return data_source


@router.put(
    "/data-sources/{data_source_id}", response_model=DataSourceConnectionResponse
)
async def update_data_source(
    data_source_id: str,
    data_source: DataSourceConnectionUpdate,
    db: Session = Depends(get_db),
):
    db_data_source = (
        db.query(DataSourceConnection)
        .filter(DataSourceConnection.id == data_source_id)
        .first()
    )
    if not db_data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    update_data = data_source.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_data_source, key, value)

    db.commit()
    db.refresh(db_data_source)
    return db_data_source


@router.delete("/data-sources/{data_source_id}", status_code=204)
async def delete_data_source(data_source_id: str, db: Session = Depends(get_db)):
    db_data_source = (
        db.query(DataSourceConnection)
        .filter(DataSourceConnection.id == data_source_id)
        .first()
    )
    if not db_data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    db.delete(db_data_source)
    db.commit()


@router.post(
    "/data-sources/{data_source_id}/test", response_model=TestConnectionResponse
)
async def test_data_source_connection(
    data_source_id: str, db: Session = Depends(get_db)
):
    data_source = (
        db.query(DataSourceConnection)
        .filter(DataSourceConnection.id == data_source_id)
        .first()
    )
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    database_url = f"{data_source.type}://{data_source.username}:{data_source.password}@{data_source.host}:{data_source.port}/{data_source.database}"

    try:
        db_service = DatabaseService(database_url=database_url)
        is_connected = db_service.test_connection()

        data_source.status = "connected" if is_connected else "disconnected"
        db.commit()

        return TestConnectionResponse(
            success=is_connected,
            message="Connection successful" if is_connected else "Connection failed",
        )
    except Exception as e:
        data_source.status = "disconnected"
        db.commit()
        return TestConnectionResponse(success=False, message=str(e))


@router.get(
    "/data-sources/{data_source_id}/schema", response_model=DatabaseSchemaResponse
)
async def get_data_source_schema(data_source_id: str, db: Session = Depends(get_db)):
    data_source = (
        db.query(DataSourceConnection)
        .filter(DataSourceConnection.id == data_source_id)
        .first()
    )
    if not data_source:
        raise HTTPException(status_code=404, detail="Data source not found")

    database_url = f"{data_source.type}://{data_source.username}:{data_source.password}@{data_source.host}:{data_source.port}/{data_source.database}"

    try:
        db_service = DatabaseService(database_url=database_url)
        schema = db_service.get_schema()
        return DatabaseSchemaResponse(tables=schema)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
