from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from src.models import get_db
from src.models.models import Rule
from src.schemas.rule import RuleCreate, RuleUpdate, RuleResponse

router = APIRouter(tags=["rules"])


@router.post("/rules", response_model=RuleResponse)
async def create_rule(rule: RuleCreate, db: Session = Depends(get_db)):
    db_rule = Rule(id=str(uuid.uuid4()), **rule.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.get("/rules", response_model=List[RuleResponse])
async def list_rules(db: Session = Depends(get_db)):
    return db.query(Rule).all()


@router.get("/rules/{rule_id}", response_model=RuleResponse)
async def get_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


@router.patch("/rules/{rule_id}", response_model=RuleResponse)
async def update_rule(rule_id: str, rule: RuleUpdate, db: Session = Depends(get_db)):
    db_rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    update_data = rule.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rule, key, value)

    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.delete("/rules/{rule_id}", status_code=204)
async def delete_rule(rule_id: str, db: Session = Depends(get_db)):
    db_rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    db.delete(db_rule)
    db.commit()
