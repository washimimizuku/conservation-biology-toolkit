# Species Assessment Service

A FastAPI-based microservice providing computational tools for species conservation assessment, including IUCN Red List criteria evaluation, extinction risk assessment, and range size analysis.

## Features

### 🔴 IUCN Red List Assessment
- **Population Decline Analysis** - Evaluate species based on population reduction rates
- **Geographic Range Criteria** - Assess extent of occurrence and area of occupancy
- **Population Size Thresholds** - Apply small population criteria (C and D)
- **Automated Classification** - Determine appropriate IUCN threat category

### ⚠️ Extinction Risk Assessment  
- **Multi-factor Analysis** - Weighted scoring system for extinction risk
- **Population Dynamics** - Consider size, trends, and demographic factors
- **Environmental Factors** - Habitat quality and threat intensity assessment
- **Genetic Considerations** - Include genetic diversity in risk calculations
- **Time Predictions** - Estimate time to extinction under current trends

### 📍 Range Size Analysis
- **Fragmentation Metrics** - Calculate range fragmentation indices
- **Habitat Connectivity** - Assess connectivity between populations
- **Conservation Priority** - Determine conservation priority levels
- **Spatial Metrics** - Analyze extent of occurrence and area of occupancy

## API Endpoints

### Core Assessment Tools

#### POST `/iucn-assessment`
Assess species according to IUCN Red List criteria.

**Request Body:**
```json
{
  "population_data": {
    "current_population": 1500,
    "historical_population": 5000,
    "years_between": 10,
    "decline_rate": 0.7
  },
  "range_data": {
    "extent_of_occurrence": 2500,
    "area_of_occupancy": 400,
    "number_of_locations": 6,
    "severely_fragmented": true
  }
}
```

**Response:**
```json
{
  "category": "Endangered",
  "criteria_met": ["A1: ≥50% population decline", "B1: EOO < 5,000 km²"],
  "population_decline": 0.7,
  "range_size_km2": 2500,
  "population_size": 1500,
  "justification": "Population declined by 70.0%; Extent of occurrence: 2500 km²",
  "confidence_level": "High"
}
```

#### POST `/extinction-risk`
Assess extinction risk using multiple biological and environmental factors.

**Request Body:**
```json
{
  "population_size": 800,
  "population_trend": "declining",
  "habitat_quality": 0.4,
  "threat_intensity": 0.8,
  "genetic_diversity": 0.3
}
```

**Response:**
```json
{
  "risk_level": "High",
  "risk_score": 0.72,
  "contributing_factors": {
    "Population Size": 0.6,
    "Population Trend": 0.8,
    "Habitat Quality": 0.6,
    "Threat Intensity": 0.8,
    "Genetic Diversity": 0.7
  },
  "time_to_extinction_years": 16,
  "recommendations": [
    "Immediate conservation action required",
    "Establish protected areas or reserves",
    "Implement captive breeding program"
  ]
}
```

#### POST `/range-analysis`
Analyze species range characteristics and conservation priority.

**Request Body:**
```json
{
  "extent_of_occurrence": 8500,
  "area_of_occupancy": 1200,
  "number_of_locations": 12,
  "severely_fragmented": false
}
```

**Response:**
```json
{
  "extent_of_occurrence_km2": 8500,
  "area_of_occupancy_km2": 1200,
  "range_fragmentation_index": 0.859,
  "habitat_connectivity": 1.0,
  "conservation_priority": "Medium"
}
```

## Scientific Methods

### IUCN Red List Criteria Implementation

The service implements simplified versions of key IUCN criteria:

- **Criterion A**: Population decline ≥30% (VU), ≥50% (EN), ≥80% (CR)
- **Criterion B1**: Extent of occurrence <20,000 km² (VU), <5,000 km² (EN), <100 km² (CR)  
- **Criterion B2**: Area of occupancy <2,000 km² (VU), <500 km² (EN), <10 km² (CR)
- **Criterion C**: Population size <10,000 (VU), <2,500 (EN), <250 (CR)
- **Criterion D**: Very small populations <1,000 (VU), <250 (EN), <50 (CR)

### Extinction Risk Scoring

Multi-factor weighted assessment:
- **Population Size** (30%): Smaller populations = higher risk
- **Population Trend** (25%): Declining = 0.8, Stable = 0.4, Increasing = 0.1
- **Habitat Quality** (20%): Inverted score (poor habitat = high risk)
- **Threat Intensity** (15%): Direct correlation with risk
- **Genetic Diversity** (10%): Inverted score (low diversity = high risk)

### Range Analysis Metrics

- **Fragmentation Index**: 1 - (AOO / EOO)
- **Habitat Connectivity**: Based on average patch size
- **Conservation Priority**: Cumulative scoring system based on range thresholds

## Installation & Usage

### Local Development
```bash
cd services/species-assessment
poetry install
poetry run uvicorn main:app --reload --port 8005
```

### Docker
```bash
docker build -t species-assessment .
docker run -p 8005:8005 species-assessment
```

### API Documentation
- **Interactive Docs**: http://localhost:8005/docs
- **OpenAPI Schema**: http://localhost:8005/openapi.json

## Testing

Run the comprehensive test suite:
```bash
poetry run pytest --cov=main --cov-report=html
```

The test suite includes:
- IUCN criteria assessment validation
- Extinction risk calculation verification  
- Range analysis metric testing
- API endpoint functionality
- Edge case and error handling
- Input validation testing

## References

- IUCN Standards and Petitions Subcommittee. (2019). Guidelines for Using the IUCN Red List Categories and Criteria. Version 14.
- Mace, G.M. et al. (2008). Quantification of extinction risk: IUCN's system for classifying threatened species. Conservation Biology 22: 1424-1442.
- Akçakaya, H.R. et al. (2006). Use and misuse of the IUCN Red List Criteria in projecting climate change impacts on biodiversity. Global Change Biology 12: 2037-2043.