# InfraWatch — Infrastructure Monitoring Dashboard

A full-stack web application for tracking and visualizing infrastructure assets, condition ratings, and maintenance history.

## Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Backend   | Python 3.12, FastAPI         |
| Database  | PostgreSQL 15                |
| ORM       | SQLAlchemy 2.0               |
| Frontend  | React 18, Recharts           |
| Build     | Vite 5                       |
| Container | Docker, Docker Compose       |

## Features

- **Asset Registry** — track bridges, roads, pipelines, electrical, water, and building infrastructure
- **Condition Monitoring** — Good / Fair / Poor / Critical condition states with visual badges
- **Inspection History** — time-ordered log of inspections per asset with condition updates
- **Dashboard Statistics** — condition breakdown, status overview, asset-type counts, critical alerts
- **Filtering & Sorting** — filter by condition, status, type; sort by name, condition, last inspected
- **RESTful API** — full CRUD with Pydantic validation and OpenAPI docs at `/docs`
- **Seed Data** — 10 sample Toronto-area infrastructure assets auto-loaded on first run
