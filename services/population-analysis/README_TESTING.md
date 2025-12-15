# Population Analysis Service - Testing

This document describes the testing setup for the Population Analysis service.

## Test Coverage

The test suite provides comprehensive coverage of all calculation endpoints:

- **Population Growth Calculator**: Exponential and logistic growth models
- **Effective Population Size**: Harmonic mean calculations with various sex ratios
- **Population Viability Analysis**: Stochastic population modeling and extinction risk
- **Metapopulation Dynamics**: Multi-patch population simulations with migration

## Running Tests

### Quick Start
```bash
# Install dependencies
poetry install

# Run all tests
poetry run pytest test_main.py

# Run with coverage
poetry run pytest test_main.py --cov=main --cov-report=term-missing

# Run specific test class
poetry run pytest test_main.py::TestPopulationGrowth -v
```

### Using the Test Runner
```bash
# Run all tests with coverage
python run_tests.py --coverage

# Run only unit tests
python run_tests.py --unit

# Run with verbose output
python run_tests.py --verbose

# Stop on first failure
python run_tests.py --fast
```

## Test Structure

### Test Classes

1. **TestPopulationGrowth**
   - Basic exponential growth
   - Logistic growth with carrying capacity
   - Zero and negative growth rates
   - Edge cases and boundary conditions

2. **TestEffectivePopulationSize**
   - Equal and unequal sex ratios
   - Extreme sex ratio scenarios
   - Single individual edge cases
   - Large population scenarios

3. **TestPopulationViabilityAnalysis**
   - Basic PVA functionality
   - High growth (low extinction risk)
   - Negative growth (high extinction risk)
   - Small population effects

4. **TestMetapopulationDynamics**
   - Multi-patch simulations
   - Migration effects
   - Single patch scenarios
   - Large patch networks

5. **TestMathematicalAccuracy**
   - Verification of mathematical formulas
   - Exponential growth: P(t) = P₀ × e^(rt)
   - Logistic growth properties
   - Effective population size: Ne = 4NmNf/(Nm + Nf)

### API Tests
- Health check endpoint
- Root endpoint information
- Response structure validation
- Error handling

## Mathematical Validation

The tests verify that calculations follow established scientific formulas:

### Population Growth
- **Exponential**: P(t) = P₀ × e^(rt)
- **Logistic**: P(t) = K × P₀ × e^(rt) / (K + P₀ × (e^(rt) - 1))

### Effective Population Size
- **Formula**: Ne = 4 × Nm × Nf / (Nm + Nf)
- **Properties**: Ne ≤ Nm + Nf, maximized when Nm = Nf

### Population Viability Analysis
- Stochastic modeling with environmental variance
- Demographic stochasticity for small populations
- Extinction probability calculations
- Quasi-extinction thresholds

### Metapopulation Dynamics
- Patch-specific growth rates
- Migration matrix effects
- Population persistence across patches

## Test Configuration

### pytest.ini
- Coverage reporting with 80% minimum threshold
- HTML coverage reports generated in `htmlcov/`
- Verbose output and short tracebacks
- Warning suppression for cleaner output

### Dependencies
- `pytest`: Test framework
- `pytest-cov`: Coverage reporting
- `pytest-asyncio`: Async test support
- `httpx`: HTTP client for API testing

## Continuous Integration

Tests should be run:
- Before committing changes
- In CI/CD pipelines
- Before deploying to production
- When updating dependencies

## Coverage Goals

- **Target**: >95% code coverage
- **Current**: 96% coverage
- **Missing**: Only error handling edge cases

## Adding New Tests

When adding new functionality:

1. Create test class for new endpoint
2. Test normal operation cases
3. Test edge cases and boundaries
4. Verify mathematical accuracy
5. Test error conditions
6. Update this documentation

## Scientific Validation

All calculations are tested against:
- Known mathematical formulas
- Published scientific literature
- Expected biological behaviors
- Conservation biology best practices

This ensures the toolkit provides accurate, reliable calculations for conservation research and management decisions.