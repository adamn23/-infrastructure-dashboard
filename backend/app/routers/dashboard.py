from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

from ..database import get_db
from ..models import Asset, Inspection, ConditionEnum, StatusEnum
from ..schemas import DashboardStats, ConditionBreakdown, StatusBreakdown, TypeBreakdown, InspectionOut, AssetOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _count(db, model, **filters):
    q = db.query(func.count(model.id))
    for attr, val in filters.items():
        q = q.filter(getattr(model, attr) == val)
    return q.scalar() or 0


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total = _count(db, Asset)

    condition_breakdown = ConditionBreakdown(
        good=_count(db, Asset, condition=ConditionEnum.good),
        fair=_count(db, Asset, condition=ConditionEnum.fair),
        poor=_count(db, Asset, condition=ConditionEnum.poor),
        critical=_count(db, Asset, condition=ConditionEnum.critical),
    )

    status_breakdown = StatusBreakdown(
        active=_count(db, Asset, status=StatusEnum.active),
        inactive=_count(db, Asset, status=StatusEnum.inactive),
        under_maintenance=_count(db, Asset, status=StatusEnum.under_maintenance),
        decommissioned=_count(db, Asset, status=StatusEnum.decommissioned),
    )

    type_rows = (
        db.query(Asset.asset_type, func.count(Asset.id))
        .group_by(Asset.asset_type)
        .all()
    )
    type_breakdown = [TypeBreakdown(type=t.value, count=c) for t, c in type_rows]

    recent_inspections_raw = (
        db.query(Inspection)
        .order_by(desc(Inspection.inspection_date))
        .limit(5)
        .all()
    )

    critical_assets_raw = (
        db.query(Asset)
        .filter(Asset.condition == ConditionEnum.critical)
        .limit(10)
        .all()
    )

    def enrich_asset(a):
        count = db.query(func.count(Inspection.id)).filter(Inspection.asset_id == a.id).scalar() or 0
        d = {c.name: getattr(a, c.name) for c in a.__table__.columns}
        d["inspection_count"] = count
        return d

    return DashboardStats(
        total_assets=total,
        condition_breakdown=condition_breakdown,
        status_breakdown=status_breakdown,
        type_breakdown=type_breakdown,
        recent_inspections=[InspectionOut.model_validate(i) for i in recent_inspections_raw],
        critical_assets=[AssetOut.model_validate(enrich_asset(a)) for a in critical_assets_raw],
    )
