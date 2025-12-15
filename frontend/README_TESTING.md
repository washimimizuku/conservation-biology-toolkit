# Frontend Testing Documentation

## Overview

Comprehensive testing suite for the Conservation Biology Toolkit frontend using React Testing Library, Jest, and MSW (Mock Service Worker).

## Test Structure

```
src/__tests__/
├── config/           # Configuration tests
├── integration/      # Integration and workflow tests
├── mocks/           # MSW mock handlers and server setup
└── pages/           # Component unit tests
```

## Testing Stack

- **React Testing Library**: Component testing with user-centric approach
- **Jest**: Test runner and assertion library
- **MSW**: API mocking for realistic testing
- **User Event**: Realistic user interaction simulation

## Running Tests

### Quick Commands
```bash
npm test                    # Watch mode (development)
npm run test:coverage      # Full coverage report
npm run test:ci           # CI/CD mode
```

### Test Runner Script
```bash
node run_tests.js unit        # Unit tests only
node run_tests.js integration # Integration tests only
node run_tests.js coverage   # All tests with coverage
node run_tests.js watch      # Watch mode
node run_tests.js ci         # CI mode
```

## Test Categories

### Unit Tests
- **PopulationTools.test.js**: All population analysis calculators
- **SamplingTools.test.js**: All sampling and survey design tools
- **api.test.js**: API configuration validation

### Integration Tests
- **UserWorkflows.test.js**: Complete user journeys and cross-tool workflows

## Coverage Goals

- **Target**: 80% minimum coverage (branches, functions, lines, statements)
- **Current**: Comprehensive coverage of all calculator components
- **Focus**: User interactions, form validation, API integration

## Key Test Scenarios

### Calculator Testing
- Default value validation
- Form submission and API integration
- Result display and formatting
- Input validation and constraints
- Loading states and error handling

### User Workflow Testing
- Multi-step calculations
- Cross-tool data usage
- Error recovery
- Responsive design functionality

## Mock API Responses

All API endpoints are mocked with realistic responses:
- Population growth calculations
- Effective population size
- Population viability analysis
- Sample size calculations
- Detection probability estimates
- Capture-recapture analysis
- Distance sampling results

## Best Practices

1. **User-Centric Testing**: Test what users see and do
2. **Realistic Scenarios**: Use conservation biology examples
3. **Accessibility**: Verify proper labels and ARIA attributes
4. **Error Handling**: Test both success and failure paths
5. **Performance**: Validate loading states and responsiveness

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release builds

Coverage reports are generated and stored for tracking improvements.