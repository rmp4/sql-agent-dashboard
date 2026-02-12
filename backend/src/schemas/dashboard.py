from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SavedChartBase(BaseModel):
    title: str
    sql: str
    visualization: dict
    refresh_interval: Optional[int] = None


class SavedChartCreate(SavedChartBase):
    dashboard_id: str


class SavedChartResponse(SavedChartBase):
    id: str
    dashboard_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout: Optional[dict] = None


class DashboardCreate(DashboardBase):
    pass


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[dict] = None


class DashboardResponse(DashboardBase):
    id: str
    created_at: datetime
    updated_at: datetime
    charts: List[SavedChartResponse] = []

    class Config:
        from_attributes = True
