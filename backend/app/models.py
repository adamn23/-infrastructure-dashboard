from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


class AssetType(str, enum.Enum):
    bridge = "bridge"
    road = "road"
    building = "building"
    pipeline = "pipeline"
    electrical = "electrical"
    water = "water"
    other = "other"


class ConditionEnum(str, enum.Enum):
    good = "good"
    fair = "fair"
    poor = "poor"
    critical = "critical"


class StatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    under_maintenance = "under_maintenance"
    decommissioned = "decommissioned"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    asset_type = Column(SAEnum(AssetType), nullable=False)
    location = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    condition = Column(SAEnum(ConditionEnum), nullable=False, default=ConditionEnum.good)
    status = Column(SAEnum(StatusEnum), nullable=False, default=StatusEnum.active)
    installation_date = Column(DateTime(timezone=True), nullable=True)
    last_inspection_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    inspections = relationship("Inspection", back_populates="asset", cascade="all, delete-orphan")


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    inspector_name = Column(String(255), nullable=False)
    condition = Column(SAEnum(ConditionEnum), nullable=False)
    notes = Column(Text, nullable=True)
    inspection_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    asset = relationship("Asset", back_populates="inspections")
