from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/api/interactions",
    tags=["interactions"]
)

@router.post("", response_model=schemas.InteractionResponse)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = models.Interaction(**interaction.dict())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.get("", response_model=List[schemas.InteractionResponse])
def get_interactions(skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Interaction)
    if search:
        query = query.filter(
            (models.Interaction.doctor_name.ilike(f"%{search}%")) |
            (models.Interaction.hospital_name.ilike(f"%{search}%"))
        )
    interactions = query.order_by(models.Interaction.created_at.desc()).offset(skip).limit(limit).all()
    return interactions

@router.get("/{id}", response_model=schemas.InteractionResponse)
def get_interaction(id: int, db: Session = Depends(get_db)):
    interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction

@router.put("/{id}", response_model=schemas.InteractionResponse)
def update_interaction(id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if db_interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
        
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.delete("/{id}")
def delete_interaction(id: int, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if db_interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    db.delete(db_interaction)
    db.commit()
    return {"detail": "Interaction deleted"}
