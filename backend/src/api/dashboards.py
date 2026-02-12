from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from src.models import get_db
from src.models.models import Dashboard, SavedChart
from src.schemas.dashboard import (
    DashboardCreate,
    DashboardUpdate,
    DashboardResponse,
    SavedChartCreate,
    SavedChartResponse,
)

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
