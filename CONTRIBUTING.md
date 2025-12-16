# Contributing to Conservation Biology Toolkit

Thank you for your interest in contributing to the Conservation Biology Toolkit! This project aims to make conservation science more accessible through standardized, well-tested computational tools. We welcome contributions from conservation biologists, software developers, researchers, and anyone passionate about wildlife conservation.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Scientific Accuracy](#scientific-accuracy)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate in all interactions
- Focus on constructive feedback and collaboration
- Respect diverse perspectives and experiences
- Prioritize scientific accuracy and evidence-based approaches
- Help create a supportive learning environment

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Git** installed and configured
- **Python 3.9+** for backend services
- **Node.js 18+** for frontend development
- **Poetry** for Python dependency management
- **Docker & Docker Compose** for development environment
- Basic understanding of conservation biology principles (helpful but not required)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/conservation-biology-toolkit.git
   cd conservation-biology-toolkit
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/washimimizuku/conservation-biology-toolkit.git
   ```

4. **Set up the development environment**:
   ```bash
   ./setup-dev.sh
   ```

5. **Start the development environment**:
   ```bash
   docker-compose up
   ```

6. **Verify everything works**:
   - Frontend: http://localhost:3000
   - API docs: http://localhost:8002/docs (and other service ports)

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

#### 🔬 **Scientific Contributions**
- New conservation biology tools and calculations
- Improvements to existing algorithms
- Scientific accuracy reviews and corrections
- Literature citations and methodology validation

#### 💻 **Technical Contributions**
- Bug fixes and performance improvements
- New features and enhancements
- Test coverage improvements
- Documentation updates
- UI/UX improvements

#### 📚 **Documentation Contributions**
- API documentation improvements
- User guides and tutorials
- Scientific methodology explanations
- Code comments and examples

#### 🐛 **Issue Reporting**
- Bug reports with detailed reproduction steps
- Feature requests with scientific justification
- Performance issues and optimization suggestions

### Finding Issues to Work On

- **Good First Issues**: Look for issues labeled `good first issue`
- **Help Wanted**: Issues labeled `help wanted` need community assistance
- **Scientific Review**: Issues labeled `scientific-review` need domain expertise
- **Frontend**: Issues labeled `frontend` for React/UI work
- **Backend**: Issues labeled `backend` for API/service work

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
# or
git checkout -b docs/documentation-update
```

### 2. Make Your Changes

- Follow the [coding standards](#coding-standards)
- Write or update tests for your changes
- Ensure scientific accuracy for any calculations
- Update documentation as needed

### 3. Test Your Changes

#### Frontend Testing
```bash
cd frontend
npm test                    # Run tests
npm run test:coverage      # Check coverage
```

#### Backend Testing
```bash
cd services/your-service
poetry run pytest --cov=main --cov-report=html
```

#### Integration Testing
```bash
docker-compose up          # Start all services
# Test the full application manually
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add population growth rate calculator

- Implement exponential and logistic growth models
- Add comprehensive test coverage (95%)
- Include scientific references and validation
- Update API documentation"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots for UI changes
- Scientific justification for new calculations

## Coding Standards

### Python (Backend Services)

- **Style**: Follow PEP 8 with Black formatting
- **Type Hints**: Use type hints for all function parameters and returns
- **Docstrings**: Use Google-style docstrings
- **Error Handling**: Implement proper exception handling
- **Validation**: Use Pydantic models for data validation

Example:
```python
from typing import List, Optional
from pydantic import BaseModel, Field

class PopulationData(BaseModel):
    """Population data for growth analysis."""
    
    initial_size: int = Field(gt=0, description="Initial population size")
    growth_rate: float = Field(description="Annual growth rate")
    time_periods: int = Field(gt=0, description="Number of time periods")

def calculate_exponential_growth(
    data: PopulationData
) -> List[float]:
    """Calculate exponential population growth.
    
    Args:
        data: Population parameters
        
    Returns:
        List of population sizes over time
        
    Raises:
        ValueError: If parameters are invalid
    """
    # Implementation here
    pass
```

### JavaScript/React (Frontend)

- **Style**: Use Prettier for formatting
- **Components**: Functional components with hooks
- **Testing**: Jest + React Testing Library
- **State Management**: React hooks (useState, useEffect)
- **Error Handling**: Error boundaries and proper error states

Example:
```javascript
import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';

/**
 * Population Growth Calculator Component
 * Calculates exponential and logistic population growth
 */
const PopulationGrowthCalculator = () => {
  const [initialSize, setInitialSize] = useState('');
  const [growthRate, setGrowthRate] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    try {
      // API call and calculation logic
    } catch (err) {
      setError('Calculation failed. Please check your inputs.');
    }
  };

  return (
    // Component JSX
  );
};

export default PopulationGrowthCalculator;
```

## Testing Guidelines

### Test Coverage Requirements

- **Minimum Coverage**: 90% for new code
- **Frontend**: Jest + React Testing Library
- **Backend**: pytest with coverage reporting
- **Integration**: Manual testing of full workflows

### Test Types

#### Unit Tests
Test individual functions and components:

```python
def test_exponential_growth_calculation():
    """Test exponential growth calculation accuracy."""
    data = PopulationData(
        initial_size=100,
        growth_rate=0.05,
        time_periods=10
    )
    result = calculate_exponential_growth(data)
    
    # Test specific values
    assert len(result) == 11  # Including initial
    assert result[0] == 100
    assert abs(result[10] - 162.89) < 0.01  # Expected value
```

#### Integration Tests
Test API endpoints and user workflows:

```python
def test_population_growth_endpoint(client):
    """Test population growth API endpoint."""
    response = client.post("/api/population/growth", json={
        "initial_size": 100,
        "growth_rate": 0.05,
        "time_periods": 10
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "population_sizes" in data
    assert len(data["population_sizes"]) == 11
```

#### Frontend Tests
Test React components and user interactions:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import PopulationGrowthCalculator from './PopulationGrowthCalculator';

test('calculates population growth correctly', async () => {
  render(<PopulationGrowthCalculator />);
  
  fireEvent.change(screen.getByLabelText('Initial Population'), {
    target: { value: '100' }
  });
  fireEvent.change(screen.getByLabelText('Growth Rate'), {
    target: { value: '0.05' }
  });
  
  fireEvent.click(screen.getByText('Calculate'));
  
  await screen.findByText(/Population after 10 years: 163/);
});
```

## Scientific Accuracy

### Methodology Requirements

- **Peer-Reviewed Sources**: Base calculations on published, peer-reviewed methods
- **Citations**: Include proper scientific citations in code comments
- **Validation**: Validate results against known examples or published data
- **Edge Cases**: Handle biological edge cases appropriately

### Scientific Review Process

1. **Literature Review**: Verify methods against current scientific literature
2. **Expert Review**: Seek review from domain experts when possible
3. **Test Cases**: Include test cases with known correct answers
4. **Documentation**: Document assumptions and limitations clearly

Example:
```python
def calculate_effective_population_size(
    breeding_males: int,
    breeding_females: int
) -> float:
    """Calculate effective population size using the harmonic mean formula.
    
    Based on Wright (1931) and Crow & Kimura (1970).
    Formula: Ne = 4 * Nm * Nf / (Nm + Nf)
    
    References:
        Wright, S. (1931). Evolution in Mendelian populations. 
        Genetics, 16(2), 97-159.
        
        Crow, J. F., & Kimura, M. (1970). An introduction to 
        population genetics theory. Harper & Row.
    
    Args:
        breeding_males: Number of breeding males
        breeding_females: Number of breeding females
        
    Returns:
        Effective population size
        
    Note:
        Assumes equal reproductive success and random mating.
        Real populations may deviate from these assumptions.
    """
    if breeding_males <= 0 or breeding_females <= 0:
        raise ValueError("Breeding population sizes must be positive")
    
    return (4 * breeding_males * breeding_females) / (breeding_males + breeding_females)
```

## Documentation

### Code Documentation

- **Docstrings**: All functions must have comprehensive docstrings
- **Comments**: Explain complex algorithms and scientific reasoning
- **Type Hints**: Use type hints for clarity
- **Examples**: Include usage examples in docstrings

### API Documentation

- **OpenAPI**: FastAPI automatically generates OpenAPI docs
- **Descriptions**: Provide clear parameter and response descriptions
- **Examples**: Include request/response examples
- **Error Codes**: Document possible error conditions

### User Documentation

- **README Updates**: Update README.md for new features
- **Tutorials**: Create tutorials for complex workflows
- **Scientific Background**: Explain the science behind calculations
- **Use Cases**: Provide real-world application examples

## Submitting Changes

### Pull Request Process

1. **Create Pull Request**: Use the GitHub interface to create a PR
2. **Fill Template**: Complete the PR template with all required information
3. **Request Review**: Request review from maintainers and relevant experts
4. **Address Feedback**: Respond to review comments promptly
5. **Update Documentation**: Ensure all documentation is updated
6. **Final Testing**: Verify all tests pass in CI

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Scientific Justification
For new calculations or algorithm changes:
- Literature references
- Validation against known results
- Assumptions and limitations

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Test coverage maintained (>90%)

## Documentation
- [ ] Code comments updated
- [ ] API documentation updated
- [ ] README updated (if needed)
- [ ] User documentation updated (if needed)

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review code quality and style
3. **Scientific Review**: Domain experts review scientific accuracy
4. **Integration Testing**: Manual testing of new features
5. **Documentation Review**: Ensure documentation is complete and accurate

## Community

### Getting Help

- **GitHub Issues**: Ask questions using the `question` label
- **Discussions**: Use GitHub Discussions for broader topics
- **Documentation**: Check existing documentation first
- **Code Examples**: Look at existing services for patterns

### Communication Guidelines

- **Be Specific**: Provide detailed information in issues and PRs
- **Be Patient**: Maintainers are volunteers with other commitments
- **Be Constructive**: Focus on solutions and improvements
- **Be Scientific**: Back up claims with evidence and citations

### Recognition

Contributors are recognized through:
- **Contributors List**: Listed in README.md
- **Release Notes**: Mentioned in release announcements
- **Scientific Citations**: Co-authorship opportunities for significant contributions
- **Community Roles**: Opportunity to become maintainers

## Development Tips

### Working with Services

Each service is independent:
```bash
# Work on a specific service
cd services/population-analysis
poetry install
poetry run uvicorn main:app --reload --port 8002

# Run tests for that service
poetry run pytest --cov=main
```

### Frontend Development

```bash
cd frontend
npm start                   # Development server
npm test                    # Test runner
npm run build              # Production build
```

### Database Changes

For services using databases:
```bash
# Create migrations (Django services)
python manage.py makemigrations
python manage.py migrate

# Reset database if needed
docker-compose down -v
docker-compose up db
```

### Debugging

- **Backend**: Use FastAPI's automatic docs at `/docs`
- **Frontend**: Use React Developer Tools
- **Network**: Use browser dev tools to inspect API calls
- **Logs**: Check Docker logs with `docker-compose logs service-name`

## Questions?

If you have questions about contributing:

1. **Check existing documentation** in this file and README.md
2. **Search existing issues** for similar questions
3. **Create a new issue** with the `question` label
4. **Join discussions** in GitHub Discussions

Thank you for contributing to conservation science! Every contribution, no matter how small, helps make conservation tools more accessible to researchers worldwide.

---

*Together, we're making conservation science more accessible, one calculation at a time.*