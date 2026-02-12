from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os

from src.models import get_db
from src.models.models import Dashboard, SavedChart, DataSourceConnection
from src.schemas.dashboard import (
    DashboardCreate,
    DashboardUpdate,
    DashboardResponse,
    SavedChartCreate,
    SavedChartResponse,
)
from src.services.database import DatabaseService

router = APIRouter(tags=["dashboards"])


@router.post("/dashboards", response_model=DashboardResponse)
async def create_dashboard(dashboard: DashboardCreate, db: Session = Depends(get_db)):
    db_dashboard = Dashboard(id=str(uuid.uuid4()), **dashboard.model_dump())
    db.add(db_dashboard)
    db.commit()
    db.refresh(db_dashboard)
    return db_dashboard


@router.get("/dashboards", response_model=List[DashboardResponse])
async def list_dashboards(db: Session = Depends(get_db)):
    return db.query(Dashboard).all()


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(dashboard_id: str, db: Session = Depends(get_db)):
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dashboard


@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: str, dashboard: DashboardUpdate, db: Session = Depends(get_db)
):
    db_dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not db_dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    update_data = dashboard.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dashboard, key, value)

    db.commit()
    db.refresh(db_dashboard)
    return db_dashboard


@router.delete("/dashboards/{dashboard_id}", status_code=204)
async def delete_dashboard(dashboard_id: str, db: Session = Depends(get_db)):
    db_dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not db_dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    db.delete(db_dashboard)
    db.commit()


@router.post("/dashboards/{dashboard_id}/charts", response_model=SavedChartResponse)
async def create_chart(
    dashboard_id: str, chart: SavedChartCreate, db: Session = Depends(get_db)
):
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    db_chart = SavedChart(id=str(uuid.uuid4()), **chart.model_dump())
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    return db_chart


@router.delete("/charts/{chart_id}", status_code=204)
async def delete_chart(chart_id: str, db: Session = Depends(get_db)):
    db_chart = db.query(SavedChart).filter(SavedChart.id == chart_id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Chart not found")

    db.delete(db_chart)
    db.commit()


@router.post("/charts/{chart_id}/execute")
async def execute_chart(
    chart_id: str, data_source_id: Optional[str] = None, db: Session = Depends(get_db)
):
    """Execute a saved chart's query and return the results"""
    db_chart = db.query(SavedChart).filter(SavedChart.id == chart_id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Chart not found")

    # Get database connection
    db_service = None

    if data_source_id:
        # Use specified data source
        data_source = (
            db.query(DataSourceConnection)
            .filter(DataSourceConnection.id == data_source_id)
            .first()
        )

        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")

        if str(data_source.status) != "connected":
            raise HTTPException(status_code=400, detail="Data source not connected")

        connection_string = f"postgresql://{data_source.username}:{data_source.password}@{data_source.host}:{data_source.port}/{data_source.database}"
        db_service = DatabaseService(database_url=connection_string)
    else:
        # Use default database
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise HTTPException(status_code=500, detail="No database configured")
        db_service = DatabaseService(database_url=database_url)

    # Execute the query
    try:
        result = db_service.execute_query(str(db_chart.sql))
        return {"chart_id": chart_id, "query_result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query execution failed: {str(e)}")
