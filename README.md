# Conservation Biology Toolkit

A comprehensive web-based platform providing essential computational tools for conservation biologists, wildlife managers, and researchers. Built with a modern microservices architecture using React, FastAPI, and Django to make complex conservation analyses accessible through an intuitive interface.

## Overview

This toolkit addresses the critical need for standardized, accessible conservation biology calculations. From population viability analysis to climate impact assessments, these tools help researchers make data-driven conservation decisions.

## Project History

The Conservation Biology Toolkit began in 2014 as a personal project during my Master's degree in Conservation Biology at Universidade de Lisboa, Portugal. What started as a simple command-line tool to help with my own research calculations grew from a genuine need to make complex conservation biology computations more accessible and standardized.

The original version (v1.x) was a collection of Python scripts that I used throughout my studies and early research work. It served its purpose well, helping with population analyses, genetic diversity calculations, and basic conservation planning tasks. However, after 2016, as life took different directions, the project went largely forgotten and unused.

In late 2025, I decided to revisit this old project with fresh eyes and renewed purpose. The scientific community's need for accessible, reliable conservation tools had only grown, and modern web technologies offered an opportunity to transform these personal scripts into something much more valuable. This led to a complete rewrite and expansion into the current web-based platform (v2.0.0).

The transformation from a personal command-line tool to a comprehensive web application represents not just a technological upgrade, but a commitment to sharing knowledge with the broader conservation biology community. My hope is that by making these tools freely available and easy to use, researchers worldwide can focus more on their important conservation work and less on the computational challenges.

This project embodies the collaborative spirit of science – taking something that helped one researcher and expanding it to potentially help many. Every calculation, every feature, and every line of code is written with the hope that it will contribute to better conservation decisions and, ultimately, to protecting the biodiversity that makes our planet so remarkable.

## Tool Categories

### 🧬 Population Analysis ✅ **COMPLETE**
- **Population Viability Analysis (PVA)** ✅ - Assess extinction risk and population persistence
- **Effective Population Size** ✅ - Calculate genetic effective population size
- **Growth Rate & Carrying Capacity** ✅ - Model population dynamics and limits
- **Metapopulation Dynamics** ✅ - Simulate connected population networks
- **Age-Structured Population Models** *(Planned v2.0)* - Advanced demographic modeling with age classes
- **Sensitivity Analysis Tools** *(Planned v2.0)* - Parameter sensitivity and uncertainty analysis

### 📋 Sampling & Survey Design ✅ **COMPLETE**
- **Sample Size Calculators** ✅ - Determine optimal survey effort with finite population correction
- **Detection Probability** ✅ - Account for imperfect species detection using Wilson score intervals
- **Capture-Recapture Analysis** ✅ - Estimate population size from marked individuals (Lincoln-Petersen)
- **Distance Sampling** ✅ - Analyze line and point transect surveys with half-normal detection function
- **Advanced Detection Functions** *(Planned v2.0)* - Hazard-rate and uniform detection models
- **Multi-Species Capture-Recapture** *(Planned v2.0)* - Community-level population estimation
- **Stratified Sampling Calculators** *(Planned v2.0)* - Complex survey design optimization
- **Power Analysis Tools** *(Planned v2.0)* - Statistical power and effect size calculations

### 🔬 Genetic Diversity ✅ **COMPLETE**
- **Hardy-Weinberg Equilibrium** ✅ - Test population genetic assumptions
- **Inbreeding Coefficients** ✅ - Measure genetic relatedness and inbreeding
- **Bottleneck Detection** ✅ - Identify genetic diversity loss events
- **Allelic Richness & Heterozygosity** ✅ - Quantify genetic variation
- **Multi-Population Hardy-Weinberg Tests** *(Planned v2.0)* - Population structure analysis
- **Linkage Disequilibrium Analysis** *(Planned v2.0)* - Genetic association patterns
- **Population Structure Analysis** *(Planned v2.0)* - STRUCTURE-like clustering algorithms
- **Phylogenetic Diversity Metrics** *(Planned v2.0)* - Evolutionary diversity quantification

### 📊 Species Assessment ✅ **COMPLETE**
- **IUCN Red List Assessment** ✅ - Apply standardized threat assessment criteria (A, B, C, D)
- **Extinction Risk Assessment** ✅ - Quantify species vulnerability with multi-factor scoring
- **Range Size Analysis** ✅ - Calculate extent of occurrence, area of occupancy, and fragmentation metrics
- **Species Distribution Modeling (SDM)** *(Planned v2.0)* - Advanced GIS integration for range mapping
- **Climate Change Vulnerability Assessment** *(Planned v2.0)* - Climate-species interaction modeling
- **Population Trend Analysis Integration** *(Planned v2.0)* - Time-series population data analysis
- **Automated Threat Assessment** *(Planned v2.0)* - AI-assisted threat identification and scoring

### 🌍 Habitat & Landscape ✅ **COMPLETE**
- **Habitat Suitability Index** ✅ - Evaluate habitat quality using weighted environmental parameters
- **Fragmentation Metrics** ✅ - Measure landscape connectivity, patch density, edge effects, and shape complexity
- **Species-Area Relationships** ✅ - Predict species richness using power law regression analysis
- **Wildlife Corridor Calculator** *(Planned v2.0)* - Advanced spatial connectivity analysis and optimal corridor design
- **Landscape Connectivity Modeling** *(Planned v2.0)* - Graph-based connectivity assessment
- **Habitat Network Analysis** *(Planned v2.0)* - Network topology and resilience metrics
- **GIS Data Integration** *(Planned v2.0)* - Direct integration with spatial data sources

### 🌡️ Climate Impact Assessment ✅ **COMPLETE**
- **Temperature Tolerance Analysis** ✅ - Assess species vulnerability to temperature changes
- **Phenology Shift Analysis** ✅ - Calculate timing shifts in life cycle events due to climate change
- **Sea Level Rise Impact Assessment** ✅ - Evaluate coastal habitat vulnerability to rising seas
- **Climate Velocity Analysis** ✅ - Analyze species ability to track shifting climate conditions
- **Species Distribution Modeling (SDM) Integration** *(Planned v2.0)* - Climate-driven range shift predictions
- **Climate Refugia Identification** *(Planned v2.0)* - Locate climate-stable areas for conservation
- **Extreme Weather Event Analysis** *(Planned v2.0)* - Impact assessment of climate extremes
- **Climate Adaptation Pathway Planning** *(Planned v2.0)* - Strategic adaptation scenario modeling

### 🎯 Conservation Planning ✅ **COMPLETE**
- **Conservation Priority Analysis** ✅ - Multi-criteria decision analysis for site prioritization
- **Threat Assessment Matrix** ✅ - Systematic threat evaluation using severity, scope, and urgency
- **Cost-Effectiveness Analysis** ✅ - Investment optimization with budget constraints and ROI analysis
- **Reserve Selection Optimization** ✅ - Greedy set cover algorithms for optimal site selection
- **Advanced Reserve Selection Algorithms** *(Planned v2.0)* - Simulated annealing and genetic algorithms
- **Spatial Connectivity Analysis Integration** *(Planned v2.0)* - Corridor-aware reserve design
- **Multi-Objective Optimization** *(Planned v2.0)* - Pareto frontier analysis for trade-offs
- **Uncertainty Analysis & Robust Optimization** *(Planned v2.0)* - Decision-making under uncertainty

### 📚 Breed Registry & Data Management *(Future Release)*
- **Individual Animal Records** *(Planned)* - Comprehensive pedigree and life history tracking
- **Breeding Program Management** *(Planned)* - Plan and monitor captive breeding efforts
- **Genetic Lineage Tracking** *(Planned)* - Maintain detailed family trees and ancestry records
- **Population Demographics** *(Planned)* - Track age structure, sex ratios, and vital statistics
- **Transfer & Transaction Logs** *(Planned)* - Record animal movements between institutions
- **Health & Medical Records** *(Planned)* - Maintain veterinary and health monitoring data
- **Breeding Recommendations** *(Planned)* - Generate optimal pairing suggestions based on genetic diversity

## Getting Started

### Prerequisites
- **Python 3.9+** - For backend services
- **Node.js 18+** - For React frontend
- **Poetry** - Python dependency management
- **Docker & Docker Compose** - For development environment
- **AWS CLI v2** - For deployment (if deploying to AWS)

### New Computer Setup
If setting up on a new computer, run the prerequisites checker first:

```bash
# Clone the repository
git clone https://github.com/washimimizuku/conservation-biology-toolkit.git
cd conservation-biology-toolkit

# Check if your system is ready for deployment
./check-prerequisites.sh
```

For detailed setup instructions, see [New Computer Setup Guide](docs/NEW_COMPUTER_SETUP.md).

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
cd ../sampling-survey && poetry install          # FastAPI service
cd ../genetic-diversity && poetry install        # FastAPI service
cd ../../frontend && npm install                 # React frontend

# Start services individually
docker-compose up db redis                       # Start databases
cd frontend && npm start                         # Frontend (port 3000)
cd services/population-analysis && poetry run uvicorn main:app --reload --port 8002
cd services/sampling-survey && poetry run uvicorn main:app --reload --port 8003
cd services/genetic-diversity && poetry run uvicorn main:app --reload --port 8004
cd services/species-assessment && poetry run uvicorn main:app --reload --port 8005
cd services/habitat-landscape && poetry run uvicorn main:app --reload --port 8006
cd services/climate-impact && poetry run uvicorn main:app --reload --port 8007
cd services/conservation-planning && poetry run uvicorn main:app --reload --port 8008
```

### Access the Application
- **Main Application**: http://localhost:3000
- **Population Analysis API**: http://localhost:8002/docs
- **Sampling & Survey API**: http://localhost:8003/docs
- **Genetic Diversity API**: http://localhost:8004/docs
- **Species Assessment API**: http://localhost:8005/docs
- **Habitat & Landscape API**: http://localhost:8006/docs
- **Climate Impact Assessment API**: http://localhost:8007/docs
- **Conservation Planning API**: http://localhost:8008/docs
- **Breed Registry Admin**: http://localhost:8001/admin (when implemented)

### Architecture
This project uses a microservices architecture:
- **Frontend**: React application with Material-UI and comprehensive test coverage (92%+)
- **Services**: FastAPI for calculations (Population Analysis, Sampling & Survey, Genetic Diversity, Species Assessment, Habitat & Landscape), Django for breed registry
- **Database**: PostgreSQL with Redis for caching
- **Testing**: Jest + React Testing Library for frontend, pytest for backend services
- **Deployment**: Docker Compose for development, production-ready configs available
- **API Documentation**: Auto-generated OpenAPI docs for all services

### Habitat & Landscape Service Details

The **Habitat & Landscape Service** provides three core analytical tools for spatial conservation analysis:

#### 🏞️ **Habitat Suitability Index (HSI)**
- **Purpose**: Evaluate habitat quality using weighted environmental parameters
- **Method**: Weighted scoring system with customizable parameters and weights
- **Output**: Overall HSI score (0-1), suitability classification, parameter contributions, and management recommendations
- **Use Cases**: Site assessment, habitat restoration planning, species reintroduction site selection

#### 📈 **Species-Area Relationship Analysis**
- **Purpose**: Predict species richness based on habitat area using ecological theory
- **Method**: Power law regression (S = c × A^z) with statistical validation
- **Output**: Relationship parameters (z-value, c-value), R² goodness-of-fit, species predictions for new areas
- **Use Cases**: Biodiversity estimation, reserve size planning, habitat fragmentation impact assessment

#### 🧩 **Fragmentation Metrics Calculator**
- **Purpose**: Quantify landscape fragmentation and connectivity
- **Method**: Comprehensive patch-based analysis including density, edge effects, and shape complexity
- **Output**: 8 key metrics including fragmentation index, patch density, edge density, and shape indices
- **Use Cases**: Landscape planning, corridor design, habitat connectivity assessment

**Scientific Foundation**: All calculations are based on established ecological principles with proper citations to foundational literature (MacArthur & Wilson, McGarigal & Marks, U.S. Fish & Wildlife Service HSI models).

### Current Implementation Status

**✅ Fully Implemented & Tested (7/8 Services Complete):**
- **Population Analysis Service** - Complete with 96% test coverage (23 test cases)
- **Sampling & Survey Design Service** - Complete with 94% test coverage (31 test cases)  
- **Genetic Diversity Service** - Complete with 94% test coverage (36 test cases)
- **Species Assessment Service** - Complete with 92% test coverage (36 test cases)
- **Habitat & Landscape Service** - Complete with 91% test coverage (31 test cases)
- **Climate Impact Assessment Service** - Complete with 91% test coverage (27 test cases)
- **Conservation Planning Service** - Complete with 96% test coverage (24 test cases)
- **Frontend Application** - React interface with 92%+ test coverage (comprehensive test suite)
- **Docker Environment** - Multi-service development setup with Nginx proxy

**📋 Implementation Pipeline (1 Service Remaining):**
1. **Breed Registry** (High complexity) - Django-based CRUD application, pedigree tracking, breeding management

**🎯 Current Status: 26/32 tools implemented across 7/8 service categories**

## Deployment

Choose the deployment method that best fits your needs:

### 1. Lightsail + ECR (Recommended for Small Projects)
**Cost**: ~$5.10/month | **Best for**: Development, testing, low-traffic production

```bash
# Quick setup
cd deployment/lightsail-setup/
./setup-lightsail-iam.sh        # Setup IAM role
./deploy-lightsail-ecr.sh       # Deploy to Lightsail
```

### 2. ECS Fargate (Recommended for Production)
**Cost**: $49-245/month | **Best for**: Auto-scaling production workloads

```bash
# Complete automated deployment
cd deployment/ecs-setup/
./deploy-all.sh
```

### 3. S3 + CloudFront + Lightsail (Legacy)
**Cost**: ~$8.50/month | **Best for**: Static frontend + simple backend

```bash
# Traditional AWS deployment
cd deployment/scripts/
./setup-aws-infrastructure.sh
./deploy-aws.sh
```

**Documentation:**
- [Deployment Options](deployment/README.md) - Compare all deployment methods
- [Lightsail + ECR Guide](deployment/lightsail-setup/README.md) - Cost-effective deployment
- [ECS Fargate Guide](deployment/ecs-setup/README.md) - Production-ready deployment
- [AWS Setup Guide](docs/AWS_SETUP_GUIDE.md) - Detailed AWS infrastructure setup
- [Architecture Diagrams](docs/ARCHITECTURE_DIAGRAM.md) - Visual system architecture

### Local Development

For local development, use Docker Compose:

```bash
# Start all services
docker-compose up

# Or start individual services
cd frontend && npm start
cd services/population-analysis && poetry run uvicorn main:app --reload --port 8002
```

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

# Genetic Diversity Service
cd services/genetic-diversity  
poetry run pytest --cov=main --cov-report=html

# Species Assessment Service
cd services/species-assessment
poetry run pytest --cov=main --cov-report=html

# Habitat & Landscape Service
cd services/habitat-landscape
poetry run pytest --cov=main --cov-report=html
```

**Current Test Coverage:**
- Frontend: 92%+ (statements, functions, lines) 
- Population Analysis: 96% code coverage (23 test cases)
- Sampling & Survey: 94% code coverage (31 test cases)
- Genetic Diversity: 94% code coverage (36 test cases)
- Species Assessment: 92% code coverage (36 test cases)
- Habitat & Landscape: 91% code coverage (31 test cases)

## Project Roadmap

### 🎯 **Milestone 1: Foundation Complete** ✅ **(December 2025)**
- ✅ Population Analysis Service (4 tools)
- ✅ Sampling & Survey Design Service (4 tools) 
- ✅ Genetic Diversity Service (4 tools)
- ✅ Species Assessment Service (3 tools)
- ✅ Habitat & Landscape Service (3 tools)
- ✅ React frontend with comprehensive testing
- ✅ Docker development environment

### 🎯 **Milestone 2: Platform Completion** *(Q1 2026)*
- 📋 Breed Registry Service (7 tools) - Complete the final service category
- 📋 Enhanced data visualization components with interactive charts
- 📋 Export/import functionality (CSV, JSON, PDF reports)
- 📋 CI/CD pipeline implementation with automated testing
- 📋 Performance optimization and caching strategies

### 🎯 **Milestone 3: Advanced Analytics (v2.0)** *(Q2-Q3 2026)*
- 📋 Species Distribution Modeling (SDM) with advanced GIS integration
- 📋 Wildlife corridor design and landscape connectivity modeling
- 📋 Climate refugia identification and adaptation pathway planning
- 📋 Advanced genetic analysis (population structure, linkage disequilibrium)
- 📋 Multi-species capture-recapture and community-level analysis

### 🎯 **Milestone 4: Optimization & Intelligence** *(Q4 2026)*
- 📋 Advanced optimization algorithms (simulated annealing, genetic algorithms)
- 📋 Multi-objective optimization with Pareto frontier analysis
- 📋 AI-assisted threat assessment and automated analysis
- 📋 External data source integration (GBIF, climate databases, satellite data)
- 📋 Mobile application for field data collection (optional)

**Progress: 81.3% Complete (7/8 services, 26/32 tools)**

## Planned Features & Enhancements

### 🔬 **Advanced Scientific Methods (v2.0)**
- **Age-Structured Population Models**: Demographic analysis with age classes and life tables
- **Population Structure Analysis**: STRUCTURE-like clustering algorithms for genetic data
- **Species Distribution Modeling (SDM)**: MaxEnt-style environmental niche modeling with GIS integration
- **Multi-Species Community Analysis**: Capture-recapture and occupancy modeling for species assemblages
- **Phylogenetic Diversity Metrics**: Evolutionary diversity quantification and conservation prioritization

### 🌐 **Spatial Analysis & Connectivity (v2.0)**
- **Wildlife Corridor Design**: Least-cost path analysis and corridor optimization algorithms
- **Landscape Connectivity Modeling**: Graph-based connectivity assessment with network topology metrics
- **Habitat Network Analysis**: Resilience metrics and critical node identification
- **Climate Refugia Identification**: Stable climate area detection for conservation planning
- **Spatial Connectivity Integration**: Corridor-aware reserve selection and design optimization

### 🤖 **Advanced Algorithms & Optimization (v2.0)**
- **Simulated Annealing & Genetic Algorithms**: Advanced metaheuristic optimization for reserve selection
- **Multi-Objective Optimization**: Pareto frontier analysis for conservation trade-offs
- **Uncertainty Analysis**: Robust optimization and decision-making under uncertainty
- **AI-Assisted Analysis**: Machine learning for automated threat assessment and pattern recognition
- **Sensitivity Analysis**: Parameter uncertainty propagation and model validation

### 📊 **Data Integration & Visualization (v2.0)**
- **External Data Sources**: GBIF species occurrence, climate databases, satellite imagery
- **Interactive Visualizations**: Dynamic charts, maps, and 3D landscape models
- **GIS Integration**: Direct shapefile import/export and spatial data processing
- **Real-Time Data Feeds**: Live environmental monitoring and species tracking integration
- **Advanced Export Options**: Publication-ready figures, statistical reports, and data packages

### 📱 **Platform Enhancements (v2.0)**
- **Mobile Field Application**: Data collection app for surveys and monitoring
- **User Authentication & Profiles**: Personal workspaces and project management
- **Collaborative Features**: Team projects, data sharing, and peer review workflows
- **API Ecosystem**: RESTful APIs and SDKs for third-party integration
- **Cloud Deployment**: Scalable infrastructure with global accessibility

## Contributing

We welcome contributions from the conservation biology community. Whether you're adding new tools, improving existing calculations, or enhancing documentation, your input helps make conservation science more accessible.

### Development Guidelines
- Maintain test coverage above 90% for new code
- Follow scientific accuracy in all calculations
- Include comprehensive API documentation
- Test edge cases and boundary conditions
- Follow established patterns from completed services

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
