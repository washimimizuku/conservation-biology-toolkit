# Development Guide

## Architecture Overview

This project uses a microservices architecture with:

- **Frontend**: React app (port 3000)
- **Breed Registry**: Django REST API (port 8001)
- **Population Analysis**: FastAPI service (port 8002)
- **Other Tools**: FastAPI services (ports 8003+)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Reverse Proxy**: Nginx (port 80)

## Project Structure

```
conservation-biology-toolkit/
├── frontend/                    # React application
├── services/
│   ├── breed-registry/         # Django service
│   ├── population-analysis/    # FastAPI service
│   └── ...                     # Other FastAPI services
├── shared/                     # Shared utilities
├── deployment/                 # Docker and deployment configs
└── docs/                       # Documentation
```

## Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Poetry
- Docker & Docker Compose

### Quick Start
```bash
# Run setup script
./setup-dev.sh

# Start all services
docker-compose up

# Or start individual services
cd frontend && npm start
cd services/population-analysis && poetry run uvicorn main:app --reload --port 8002
```

### URLs
- Frontend: http://localhost:3000
- Population Analysis API: http://localhost:8002/docs
- Breed Registry API: http://localhost:8001/admin

## Adding New Tools

### FastAPI Service
1. Create new service directory: `services/new-tool/`
2. Copy `pyproject.toml` from existing FastAPI service
3. Create `main.py` with FastAPI app
4. Add service to `docker-compose.yml`
5. Add route to `nginx/default.conf`

### React Component
1. Create component in `frontend/src/pages/`
2. Add route to `App.js`
3. Create API service in `frontend/src/services/`

## Testing

```bash
# Backend tests
cd services/population-analysis
poetry run pytest

# Frontend tests
cd frontend
npm test
```

## Deployment

See `docker-compose.yml` for local development.
For production, use `docker-compose.prod.yml` (to be created).