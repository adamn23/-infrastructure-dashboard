from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

from .database import engine, Base
from .models import Asset, Inspection, AssetType, ConditionEnum, StatusEnum
from .database import SessionLocal
from .routers import assets, inspections, dashboard

app = FastAPI(
    title="Infrastructure Monitoring API",
    description="Track and manage infrastructure assets with inspection history",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router)
app.include_router(inspections.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    _seed_if_empty()


def _seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(Asset).count() > 0:
            return

        seed_assets = [
            Asset(name="Gardiner Expressway Span 12", asset_type=AssetType.bridge,
                  location="Toronto, ON", latitude=43.638, longitude=-79.400,
                  condition=ConditionEnum.fair, status=StatusEnum.active,
                  installation_date=datetime(1964, 6, 1),
                  notes="Ongoing deck rehabilitation required"),
            Asset(name="King Street Water Main", asset_type=AssetType.water,
                  location="King St W, Toronto, ON", latitude=43.644, longitude=-79.398,
                  condition=ConditionEnum.poor, status=StatusEnum.under_maintenance,
                  installation_date=datetime(1978, 3, 15),
                  notes="Corrosion detected in segment 7-9"),
            Asset(name="Bay Street Electrical Substation", asset_type=AssetType.electrical,
                  location="Bay St, Toronto, ON", latitude=43.650, longitude=-79.380,
                  condition=ConditionEnum.good, status=StatusEnum.active,
                  installation_date=datetime(2005, 11, 20)),
            Asset(name="Don Valley Pipeline Segment A", asset_type=AssetType.pipeline,
                  location="Don Valley, Toronto, ON", latitude=43.693, longitude=-79.354,
                  condition=ConditionEnum.critical, status=StatusEnum.inactive,
                  installation_date=datetime(1989, 7, 4),
                  notes="URGENT: Leak detected. Shutdown pending repair"),
            Asset(name="Bloor-Yorkville Parking Structure", asset_type=AssetType.building,
                  location="Yorkville, Toronto, ON", latitude=43.670, longitude=-79.393,
                  condition=ConditionEnum.good, status=StatusEnum.active,
                  installation_date=datetime(2012, 4, 1)),
            Asset(name="Lakeshore Blvd West Corridor", asset_type=AssetType.road,
                  location="Lakeshore Blvd W, Toronto, ON", latitude=43.634, longitude=-79.448,
                  condition=ConditionEnum.fair, status=StatusEnum.active,
                  installation_date=datetime(1995, 9, 10),
                  notes="Resurfacing planned for Q3"),
            Asset(name="Scarborough Bluffs Retaining Wall", asset_type=AssetType.bridge,
                  location="Scarborough Bluffs, Toronto, ON", latitude=43.712, longitude=-79.232,
                  condition=ConditionEnum.poor, status=StatusEnum.active,
                  installation_date=datetime(1983, 5, 22)),
            Asset(name="Toronto Hydro Line 44", asset_type=AssetType.electrical,
                  location="North York, Toronto, ON", latitude=43.762, longitude=-79.411,
                  condition=ConditionEnum.good, status=StatusEnum.active,
                  installation_date=datetime(2018, 1, 15)),
            Asset(name="Yonge Street Gas Main", asset_type=AssetType.pipeline,
                  location="Yonge St, Toronto, ON", latitude=43.665, longitude=-79.385,
                  condition=ConditionEnum.fair, status=StatusEnum.active,
                  installation_date=datetime(2001, 8, 3)),
            Asset(name="Etobicoke Water Tower", asset_type=AssetType.water,
                  location="Etobicoke, Toronto, ON", latitude=43.619, longitude=-79.531,
                  condition=ConditionEnum.good, status=StatusEnum.active,
                  installation_date=datetime(2009, 3, 30)),
        ]

        db.add_all(seed_assets)
        db.flush()

        inspectors = ["J. Kowalski", "M. Chen", "R. Okafor", "S. Patel", "L. Nguyen"]
        for asset in seed_assets:
            num_inspections = random.randint(1, 4)
            for i in range(num_inspections):
                days_ago = random.randint(30, 730)
                insp = Inspection(
                    asset_id=asset.id,
                    inspector_name=random.choice(inspectors),
                    condition=asset.condition,
                    notes=f"Routine inspection #{i + 1}. No anomalies beyond noted condition.",
                    inspection_date=datetime.utcnow() - timedelta(days=days_ago),
                )
                db.add(insp)
                if i == num_inspections - 1:
                    asset.last_inspection_date = insp.inspection_date

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
