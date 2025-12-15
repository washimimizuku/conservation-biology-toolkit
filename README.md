# Conservation Biology Toolkit

A comprehensive web-based platform providing essential computational tools for conservation biologists, wildlife managers, and researchers. Built with a modern microservices architecture using React, FastAPI, and Django to make complex conservation analyses accessible through an intuitive interface.

## Overview

This toolkit addresses the critical need for standardized, accessible conservation biology calculations. From population viability analysis to climate impact assessments, these tools help researchers make data-driven conservation decisions.

## Tool Categories

### 🧬 Population Analysis ✅
- **Population Viability Analysis (PVA)** - Assess extinction risk and population persistence
- **Effective Population Size** - Calculate genetic effective population size
- **Growth Rate & Carrying Capacity** - Model population dynamics and limits
- **Metapopulation Dynamics** - Simulate connected population networks

### 🔬 Genetic Diversity
- **Hardy-Weinberg Equilibrium** *(WIP)* - Test population genetic assumptions
- **Inbreeding Coefficients** *(WIP)* - Measure genetic relatedness and inbreeding
- **Bottleneck Detection** *(WIP)* - Identify genetic diversity loss events
- **Allelic Richness & Heterozygosity** *(WIP)* - Quantify genetic variation

### 🌍 Habitat & Landscape
- **Habitat Suitability Index** *(WIP)* - Evaluate habitat quality for species
- **Fragmentation Metrics** *(WIP)* - Measure landscape connectivity and patch dynamics
- **Species-Area Relationships** *(WIP)* - Predict species richness in habitat patches
- **Wildlife Corridor Design** *(WIP)* - Calculate optimal corridor widths for movement

### 📊 Species Assessment
- **IUCN Red List Criteria** *(WIP)* - Apply standardized threat assessment criteria
- **Extinction Risk Assessment** *(WIP)* - Quantify species vulnerability
- **Species Distribution Modeling** *(WIP)* - Map current and potential species ranges
- **Range Size & Occupancy** *(WIP)* - Calculate geographic and habitat occupancy metrics

### 📋 Sampling & Survey Design ✅
- **Sample Size Calculators** - Determine optimal survey effort with finite population correction
- **Detection Probability** - Account for imperfect species detection using Wilson score intervals
- **Capture-Recapture Analysis** - Estimate population size from marked individuals (Lincoln-Petersen)
- **Distance Sampling** - Analyze line and point transect surveys with half-normal detection function

### 🎯 Conservation Planning
- **Reserve Selection Algorithms** *(WIP)* - Optimize protected area networks
- **Cost-Effectiveness Analysis** *(WIP)* - Evaluate conservation investment efficiency
- **Threat Assessment Matrices** *(WIP)* - Systematically evaluate conservation threats
- **Conservation Prioritization** *(WIP)* - Rank areas and species for protection

### 🌡️ Climate Impact Assessment
- **Species Climate Envelopes** *(WIP)* - Model climate suitability ranges
- **Migration Corridor Planning** *(WIP)* - Design climate adaptation pathways
- **Phenology Shift Calculators** *(WIP)* - Assess timing mismatches in ecological events
- **Sea Level Rise Impact** *(WIP)* - Evaluate coastal habitat vulnerability

### 📚 Breed Registry & Data Management
- **Individual Animal Records** *(WIP)* - Comprehensive pedigree and life history tracking
- **Breeding Program Management** *(WIP)* - Plan and monitor captive breeding efforts
- **Genetic Lineage Tracking** *(WIP)* - Maintain detailed family trees and ancestry records
- **Population Demographics** *(WIP)* - Track age structure, sex ratios, and vital statistics
- **Transfer & Transaction Logs** *(WIP)* - Record animal movements between institutions
- **Health & Medical Records** *(WIP)* - Maintain veterinary and health monitoring data
- **Breeding Recommendations** *(WIP)* - Generate optimal pairing suggestions based on genetic diversity

## Getting Started

### Prerequisites
- **Python 3.9+** - For backend services
- **Node.js 18+** - For React frontend
- **Poetry** - Python dependency management
- **Docker & Docker Compose** - For development environment

### Quick Start
```bash
# Clone the repository
git clone https://github.com/washimimizuku/conservation-biology-toolkit.git
cd conservation-biology-toolkit

# Run the setup script (installs all dependencies)
./setup-dev.sh

# Start all services with Docker
docker-compose up
```

### Manual Setup (Alternative)
```bash
# Install dependencies for each service
poetry install                                    # Root dependencies
cd services/breed-registry && poetry install     # Django service
cd ../population-analysis && poetry install      # FastAPI service
cd ../../frontend && npm install                 # React frontend

# Start services individually
docker-compose up db redis                       # Start databases
cd frontend && npm start                         # Frontend (port 3000)
cd services/population-analysis && poetry run uvicorn main:app --reload --port 8002
cd services/sampling-survey && poetry run uvicorn main:app --reload --port 8003
```

### Access the Application
- **Main Application**: http://localhost:3000
- **Population Analysis API**: http://localhost:8002/docs
- **Sampling & Survey API**: http://localhost:8003/docs
- **Breed Registry Admin**: http://localhost:8001/admin (when implemented)

### Architecture
This project uses a microservices architecture:
- **Frontend**: React application with Material-UI and comprehensive test coverage (94%+)
- **Services**: FastAPI for calculations, Django for breed registry
- **Database**: PostgreSQL with Redis for caching
- **Testing**: Jest + React Testing Library for frontend, pytest for backend services
- **Deployment**: Docker Compose for development, production-ready configs available

### Current Implementation Status

**✅ Fully Implemented & Tested:**
- **Population Analysis Service** - Complete with 96% test coverage (23 test cases)
- **Sampling & Survey Design Service** - Complete with 94% test coverage (31 test cases)
- **Frontend Application** - React interface with 94%+ test coverage (123 tests)
- **Docker Environment** - Multi-service development setup with Nginx proxy

**🔄 In Development:**
- Genetic Diversity Service (next priority)
- Enhanced data visualization components
- CI/CD pipeline setup

## Testing

The project maintains high test coverage standards:

### Frontend Testing
```bash
cd frontend
npm test                    # Run tests in watch mode
npm run test:coverage      # Generate coverage report
node run_tests.js ci       # CI mode for automated testing
```

### Backend Testing
```bash
# Population Analysis Service
cd services/population-analysis
poetry run pytest --cov=main --cov-report=html

# Sampling & Survey Service  
cd services/sampling-survey
poetry run pytest --cov=main --cov-report=html
```

**Current Test Coverage:**
- Frontend: 94%+ (statements, functions, lines)
- Population Analysis: 96% code coverage
- Sampling & Survey: 94% code coverage

## Contributing

We welcome contributions from the conservation biology community. Whether you're adding new tools, improving existing calculations, or enhancing documentation, your input helps make conservation science more accessible.

### Development Guidelines
- Maintain test coverage above 90% for new code
- Follow scientific accuracy in all calculations
- Include comprehensive API documentation
- Test edge cases and boundary conditions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use this toolkit in your research, please cite:
```
Conservation Biology Toolkit. (2025). GitHub repository: https://github.com/washimimizuku/conservation-biology-toolkit
```

## Contact

For questions, suggestions, or collaboration opportunities, please open an issue or contact the development team.

---

*Making conservation science accessible, one calculation at a time.*
