# Genetic Diversity Service - Testing Documentation

This document provides comprehensive information about testing the Genetic Diversity Service, including test coverage, methodologies, and scientific validation.

## Test Overview

The genetic diversity service includes **45+ test cases** covering all major functionality:

- **Hardy-Weinberg Equilibrium**: 7 test cases
- **Inbreeding Coefficients**: 6 test cases  
- **Bottleneck Detection**: 8 test cases
- **Allelic Richness**: 7 test cases
- **API Endpoints**: 6 test cases
- **Edge Cases & Validation**: 11+ test cases

## Running Tests

### Basic Test Execution
```bash
# Run all tests
poetry run pytest

# Verbose output
poetry run pytest -v

# Run specific test class
poetry run pytest test_main.py::TestHardyWeinbergEquilibrium -v

# Run with coverage report
poetry run pytest --cov=main --cov-report=html --cov-report=term-missing
```

### Test Categories

#### Unit Tests
```bash
# Test individual calculation functions
poetry run pytest test_main.py::TestHardyWeinbergEquilibrium::test_simple_two_allele_equilibrium
poetry run pytest test_main.py::TestInbreedingCoefficient::test_moderate_inbreeding
```

#### Integration Tests  
```bash
# Test API endpoints
poetry run pytest test_main.py::TestAPIEndpoints -v
```

#### Edge Case Tests
```bash
# Test boundary conditions
poetry run pytest test_main.py::TestEdgeCases -v
```

## Test Coverage Goals

**Target Coverage: 95%+**

Current coverage areas:
- ✅ **Function Coverage**: All calculation functions tested
- ✅ **Branch Coverage**: All conditional logic paths tested  
- ✅ **Error Handling**: All validation and error cases tested
- ✅ **API Coverage**: All endpoints and response models tested
- ✅ **Edge Cases**: Boundary conditions and extreme values tested

## Scientific Validation

### Hardy-Weinberg Equilibrium Tests

#### Test Case 1: Perfect Equilibrium
```python
# Input: AA=25, AB=50, BB=25 (p=q=0.5)
# Expected: χ² ≈ 0, p-value ≈ 1.0, equilibrium = True
```

#### Test Case 2: Inbreeding Deviation  
```python
# Input: AA=40, AB=20, BB=40 (excess homozygotes)
# Expected: χ² > 3.84, p-value < 0.05, equilibrium = False
```

#### Test Case 3: Three-Allele System
```python
# Input: Multiple genotype combinations
# Expected: Correct allele frequency calculation, proper χ² test
```

### Inbreeding Coefficient Tests

#### F-Statistics Validation
```python
# Test mathematical relationships:
# FIT = FIS + FST - (FIS × FST)
# All values should be between -1 and 1
```

#### Interpretation Accuracy
- **FIS > 0.1**: "High inbreeding detected"
- **0.05 < FIS ≤ 0.1**: "Moderate inbreeding detected"  
- **0 < FIS ≤ 0.05**: "Low inbreeding detected"
- **FIS ≤ 0**: "No inbreeding detected"

### Bottleneck Detection Tests

#### Severity Classification
```python
# Severe: >90% population reduction
# Moderate: 75-90% reduction
# Mild: 50-75% reduction
# None: <50% reduction
```

#### Effective Population Size
```python
# Harmonic mean calculation: Ne = n / Σ(1/Ni)
# Test case: [100, 200, 300, 400] → Ne ≈ 171.4
```

### Allelic Richness Tests

#### Rarefaction Method
```python
# Standardization to smallest sample size
# Expected heterozygosity: He = 1 - Σpi²
# Range validation: 0 ≤ He ≤ 1
```

## Error Handling Tests

### Input Validation
- **Empty datasets**: Proper error messages
- **Negative values**: Validation rejection
- **Out-of-range values**: Boundary checking
- **Mismatched array lengths**: Size validation

### Statistical Validation
- **Insufficient data**: Minimum sample size requirements
- **Degrees of freedom**: Proper calculation for χ² tests
- **Division by zero**: Safe mathematical operations
- **Floating point precision**: Numerical stability

## Performance Testing

### Computational Complexity
```python
# Hardy-Weinberg: O(n²) where n = number of alleles
# Bottleneck detection: O(n) where n = time points
# Allelic richness: O(m) where m = number of loci
```

### Memory Usage
```python
# Typical dataset: <1MB memory usage
# Large dataset (1000 alleles): <10MB memory usage
# Response time: <100ms for standard requests
```

## Test Data Examples

### Hardy-Weinberg Test Data
```json
{
  "equilibrium_case": {"AA": 25, "AB": 50, "BB": 25},
  "inbreeding_case": {"AA": 40, "AB": 20, "BB": 40},
  "three_allele_case": {
    "AA": 16, "AB": 24, "AC": 20,
    "BB": 9, "BC": 15, "CC": 16
  }
}
```

### Bottleneck Test Data
```json
{
  "severe_bottleneck": [1000, 900, 50, 100, 200, 400],
  "moderate_bottleneck": [1000, 800, 200, 300, 500],
  "no_bottleneck": [1000, 950, 900, 950, 1000]
}
```

### Inbreeding Test Data
```json
{
  "no_inbreeding": {
    "subpop_heterozygosity": [0.5, 0.5, 0.5],
    "total_heterozygosity": 0.5,
    "expected_heterozygosity": 0.5
  },
  "high_inbreeding": {
    "subpop_heterozygosity": [0.3, 0.3, 0.3],
    "total_heterozygosity": 0.2,
    "expected_heterozygosity": 0.5
  }
}
```

## Continuous Integration

### Automated Testing
```yaml
# GitHub Actions workflow
- name: Run Tests
  run: |
    poetry install
    poetry run pytest --cov=main --cov-report=xml
    
- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

### Quality Gates
- **Minimum Coverage**: 95%
- **All Tests Pass**: Required for merge
- **No Critical Issues**: Static analysis clean
- **Performance Benchmarks**: Response time <100ms

## Manual Testing Procedures

### API Testing with curl
```bash
# Hardy-Weinberg test
curl -X POST "http://localhost:8004/hardy-weinberg" \
  -H "Content-Type: application/json" \
  -d '{"genotypes": {"AA": 25, "AB": 50, "BB": 25}}'

# Bottleneck detection
curl -X POST "http://localhost:8004/bottleneck-detection" \
  -H "Content-Type: application/json" \
  -d '{"sizes": [1000, 900, 50, 100, 200, 400]}'
```

### Interactive Testing
```python
# Python interactive testing
from main import calculate_hardy_weinberg, GenotypeData

# Test equilibrium
data = GenotypeData(genotypes={"AA": 25, "AB": 50, "BB": 25})
result = calculate_hardy_weinberg(data)
print(f"P-value: {result.p_value}")
print(f"In equilibrium: {result.is_in_equilibrium}")
```

## Test Maintenance

### Adding New Tests
1. **Identify test case**: New functionality or edge case
2. **Write test function**: Follow naming convention `test_*`
3. **Add assertions**: Verify expected behavior
4. **Update documentation**: Include in test coverage report

### Test Data Management
- **Realistic datasets**: Use published genetic data when possible
- **Edge cases**: Include boundary conditions
- **Error cases**: Test all validation scenarios
- **Performance cases**: Include large datasets for benchmarking

## Troubleshooting

### Common Test Failures
1. **Floating point precision**: Use `abs(a - b) < 0.01` for comparisons
2. **Statistical variation**: Chi-square tests may vary slightly
3. **Input validation**: Ensure test data meets model requirements
4. **API responses**: Check JSON serialization of complex objects

### Debug Commands
```bash
# Run single test with detailed output
poetry run pytest test_main.py::test_function_name -v -s

# Run with Python debugger
poetry run pytest --pdb test_main.py::test_function_name

# Check test coverage for specific function
poetry run pytest --cov=main --cov-report=term-missing -k "test_function_name"
```

## References

### Testing Frameworks
- **pytest**: Primary testing framework
- **FastAPI TestClient**: API endpoint testing
- **pytest-cov**: Coverage reporting
- **pytest-asyncio**: Async function testing

### Scientific Validation Sources
1. Weir, B.S. (1996). Genetic Data Analysis II
2. Nei, M. & Kumar, S. (2000). Molecular Evolution and Phylogenetics  
3. Excoffier, L. et al. (2005). Arlequin software for population genetics
4. Peakall, R. & Smouse, P.E. (2012). GenAlEx 6.5 genetic analysis software

This comprehensive testing approach ensures the genetic diversity service provides accurate, reliable results for conservation biology applications.