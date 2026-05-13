from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Asset, Inspection
from ..schemas import InspectionCreate, InspectionOut

router = APIRouter(prefix="/assets/{asset_id}/inspections", tags=["inspections"])


@router.get("/", response_model=List[InspectionOut])
def list_inspections(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset.inspections


@router.post("/", response_model=InspectionOut, status_code=201)
def create_inspection(
    asset_id: int,
    payload: InspectionCreate,
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    inspection = Inspection(asset_id=asset_id, **payload.model_dump())
    db.add(inspection)

    # Update last_inspection_date and condition on the asset
    asset.last_inspection_date = payload.inspection_date
    asset.condition = payload.condition

    db.commit()
    db.refresh(inspection)
    return inspection
