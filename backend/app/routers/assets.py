from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from typing import Optional, List
from datetime import datetime

from ..database import get_db
from ..models import Asset, Inspection, ConditionEnum, StatusEnum, AssetType
from ..schemas import AssetCreate, AssetUpdate, AssetOut, AssetDetail

router = APIRouter(prefix="/assets", tags=["assets"])


def _enrich(asset: Asset, db: Session) -> dict:
    """Add computed fields to asset dict."""
    data = {c.name: getattr(asset, c.name) for c in asset.__table__.columns}
    data["inspection_count"] = db.query(func.count(Inspection.id)).filter(
        Inspection.asset_id == asset.id
    ).scalar() or 0
    return data


@router.get("/", response_model=List[AssetOut])
def list_assets(
    search: Optional[str] = Query(None, description="Search name or location"),
    condition: Optional[ConditionEnum] = None,
    status: Optional[StatusEnum] = None,
    asset_type: Optional[AssetType] = None,
    sort_by: str = Query("created_at", enum=["name", "condition", "status", "created_at", "last_inspection_date"]),
    order: str = Query("desc", enum=["asc", "desc"]),
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(Asset)

    if search:
        pattern = f"%{search}%"
        q = q.filter((Asset.name.ilike(pattern)) | (Asset.location.ilike(pattern)))
    if condition:
        q = q.filter(Asset.condition == condition)
    if status:
        q = q.filter(Asset.status == status)
    if asset_type:
        q = q.filter(Asset.asset_type == asset_type)

    sort_col = getattr(Asset, sort_by)
    q = q.order_by(desc(sort_col) if order == "desc" else asc(sort_col))
    assets = q.offset(offset).limit(limit).all()

    return [_enrich(a, db) for a in assets]


@router.post("/", response_model=AssetOut, status_code=201)
def create_asset(payload: AssetCreate, db: Session = Depends(get_db)):
    asset = Asset(**payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _enrich(asset, db)


@router.get("/{asset_id}", response_model=AssetDetail)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    data = _enrich(asset, db)
    data["inspections"] = asset.inspections
    return data


@router.put("/{asset_id}", response_model=AssetOut)
def update_asset(asset_id: int, payload: AssetUpdate, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    asset.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(asset)
    return _enrich(asset, db)


@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
