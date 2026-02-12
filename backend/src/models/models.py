from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    Integer,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models import Base


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(String, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    layout = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    charts = relationship(
        "SavedChart", back_populates="dashboard", cascade="all, delete-orphan"
    )


class SavedChart(Base):
    __tablename__ = "saved_charts"

    id = Column(String, primary_key=True)
    dashboard_id = Column(
        String, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False)
    sql = Column(Text, nullable=False)
    visualization = Column(JSON, nullable=False)
    refresh_interval = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dashboard = relationship("Dashboard", back_populates="charts")


class DataSourceConnection(Base):
    __tablename__ = "data_source_connections"

    id = Column(String, primary_key=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    database = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    password = Column(Text, nullable=False)
    status = Column(String(20), default="disconnected")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Rule(Base):
    __tablename__ = "rules"

    id = Column(String, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    scope = Column(String(50), nullable=False)
    prompt = Column(Text, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
