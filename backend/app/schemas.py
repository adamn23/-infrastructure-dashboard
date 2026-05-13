from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .models import AssetType, ConditionEnum, StatusEnum


# ── Inspection Schemas ────────────────────────────────────────────────────────

class InspectionBase(BaseModel):
    inspector_name: str
    condition: ConditionEnum
    notes: Optional[str] = None
    inspection_date: datetime


class InspectionCreate(InspectionBase):
    pass


class InspectionOut(InspectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    asset_id: int
    created_at: datetime


# ── Asset Schemas ─────────────────────────────────────────────────────────────

class AssetBase(BaseModel):
    name: str
    asset_type: AssetType
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: ConditionEnum = ConditionEnum.good
    status: StatusEnum = StatusEnum.active
    installation_date: Optional[datetime] = None
    notes: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AssetType] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: Optional[ConditionEnum] = None
    status: Optional[StatusEnum] = None
    installation_date: Optional[datetime] = None
    notes: Optional[str] = None


class AssetOut(AssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    last_inspection_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    inspection_count: int = 0


class AssetDetail(AssetOut):
    inspections: List[InspectionOut] = []


# ── Dashboard Schemas ─────────────────────────────────────────────────────────

class ConditionBreakdown(BaseModel):
    good: int
    fair: int
    poor: int
    critical: int


class StatusBreakdown(BaseModel):
    active: int
    inactive: int
    under_maintenance: int
    decommissioned: int


class TypeBreakdown(BaseModel):
    type: str
    count: int


class DashboardStats(BaseModel):
    total_assets: int
    condition_breakdown: ConditionBreakdown
    status_breakdown: StatusBreakdown
    type_breakdown: List[TypeBreakdown]
    recent_inspections: List[InspectionOut]
    critical_assets: List[AssetOut]
