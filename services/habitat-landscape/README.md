# Habitat and Landscape Analysis Service

A FastAPI-based microservice providing computational tools for habitat quality assessment, landscape fragmentation analysis, and species-area relationship modeling in conservation biology.

## Features

### 🏠 Habitat Suitability Index (HSI) Calculator
- **Purpose**: Evaluate overall habitat quality based on multiple environmental parameters
- **Method**: Weighted scoring system with parameter-specific weights and scores
- **Output**: HSI score (0-1), suitability classification, parameter contributions, and management recommendations
- **Use Cases**: Site selection, habitat restoration planning, species reintroduction assessments

### 📊 Species-Area Relationship Estimator  
- **Purpose**: Model the relationship between habitat area and species richness
- **Method**: Power law regression (S = c × A^z) with log-linear fitting
- **Output**: Scaling exponent (z), constant (c), R², relationship strength, and species predictions
- **Use Cases**: Reserve design, extinction risk assessment, biodiversity forecasting

### 🧩 Fragmentation Metrics Calculator
- **Purpose**: Quantify landscape fragmentation and habitat connectivity
- **Method**: Comprehensive landscape metrics including patch density, edge density, and shape indices
- **Output**: Multiple fragmentation metrics and overall fragmentation classification
- **Use Cases**: Landscape planning, corridor design, habitat connectivity assessment

## API Endpoints

### Root Endpoint
```
GET /
```
Returns service information and available endpoints.

### Habitat Suitability Index
```
POST /habitat-suitability
```

**Request Body:**
```json
{
  "parameters": [
    {
      "name": "Food Availability",
      "score": 0.8,
      "weight": 0.3
    },
    {
      "name": "Water Access", 
      "score": 0.9,
      "weight": 0.2
    }
  ]
}
```

**Response:**
```json
{
  "habitat_suitability_index": 0.74,
  "suitability_class": "Good",
  "parameter_contributions": {
    "Food Availability": 0.32,
    "Water Access": 0.42
  },
  "recommendations": [
    "Minor habitat enhancements could improve suitability",
    "Monitor habitat conditions regularly"
  ]
}
```

### Species-Area Relationship
```
POST /species-area-relationship
```

**Request Body:**
```json
{
  "areas": [1, 10, 100, 1000],
  "species_counts": [5, 15, 35, 80],
  "prediction_area": 500
}
```

**Response:**
```json
{
  "z_value": 0.3456,
  "c_value": 4.23,
  "r_squared": 0.95,
  "equation": "S = 4.23 × A^0.346",
  "predicted_species": 65,
  "relationship_strength": "Very Strong"
}
```

### Fragmentation Metrics
```
POST /fragmentation-metrics
```

**Request Body:**
```json
{
  "patches": [
    {
      "area": 10.0,
      "perimeter": 1200
    },
    {
      "area": 5.0,
      "perimeter": 900
    }
  ],
  "total_landscape_area": 100.0
}
```

**Response:**
```json
{
  "number_of_patches": 2,
  "total_habitat_area": 15.0,
  "habitat_proportion": 0.15,
  "mean_patch_size": 7.5,
  "patch_density": 2.0,
  "edge_density": 21.0,
  "mean_shape_index": 1.34,
  "fragmentation_index": 0.65,
  "fragmentation_class": "High Fragmentation"
}
```

## Scientific Background

### Habitat Suitability Index (HSI)
The HSI model evaluates habitat quality by combining multiple environmental variables into a single index. Each parameter is scored (0-1) and weighted based on its importance to the target species. The overall HSI is calculated as:

```
HSI = Σ(score_i × weight_i) / Σ(weight_i)
```

**Classifications:**
- Excellent: HSI ≥ 0.8
- Good: 0.6 ≤ HSI < 0.8  
- Fair: 0.4 ≤ HSI < 0.6
- Poor: 0.2 ≤ HSI < 0.4
- Unsuitable: HSI < 0.2

### Species-Area Relationship
The species-area relationship follows the power law:

```
S = c × A^z
```

Where:
- S = number of species
- A = area (hectares)
- c = taxon-specific constant
- z = scaling exponent (typically 0.2-0.35)

The relationship is fitted using log-linear regression and provides insights into biodiversity patterns and extinction risks.

### Fragmentation Metrics
Multiple landscape metrics are calculated:

- **Patch Density**: Number of patches per unit area
- **Edge Density**: Total edge length per unit area  
- **Shape Index**: Perimeter-to-area ratio normalized by a circle
- **Fragmentation Index**: Composite metric (0-1) combining multiple factors

## Installation & Usage

### Using Docker (Recommended)
```bash
# Build the container
docker build -t habitat-landscape-service .

# Run the service
docker run -p 8006:8006 habitat-landscape-service
```

### Local Development
```bash
# Install dependencies
poetry install

# Run the service
poetry run uvicorn main:app --host 0.0.0.0 --port 8006

# Run tests
poetry run pytest

# Run tests with coverage
poetry run pytest --cov=main --cov-report=html
```

## Testing

The service includes comprehensive tests covering:
- ✅ All API endpoints and mathematical calculations
- ✅ Edge cases and boundary conditions  
- ✅ Input validation and error handling
- ✅ Scientific accuracy verification
- ✅ Performance with extreme values

Run the test suite:
```bash
poetry run python test_main.py
```

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8006/docs`
- ReDoc: `http://localhost:8006/redoc`

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Pydantic**: Data validation and settings management
- **NumPy**: Numerical computing for mathematical operations
- **Uvicorn**: ASGI server for running the application

## References

1. **Habitat Suitability Index**: U.S. Fish and Wildlife Service HSI models
2. **Species-Area Relationship**: MacArthur, R.H. & Wilson, E.O. (1967). *The Theory of Island Biogeography*
3. **Fragmentation Metrics**: McGarigal, K. & Marks, B.J. (1995). FRAGSTATS spatial pattern analysis program
4. **Landscape Ecology**: Turner, M.G. (1989). Landscape ecology: the effect of pattern on process

## License

This service is part of the Conservation Biology Toolkit project and is licensed under the MIT License.