from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RuleBase(BaseModel):
    name: str
    description: str
    scope: str
    prompt: str
    active: bool = True


class RuleCreate(RuleBase):
    pass


class RuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scope: Optional[str] = None
    prompt: Optional[str] = None
    active: Optional[bool] = None


class RuleResponse(RuleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
