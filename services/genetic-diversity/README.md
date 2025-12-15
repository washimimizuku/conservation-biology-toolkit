# Genetic Diversity Service

A FastAPI-based microservice providing computational tools for analyzing genetic diversity in conservation biology. This service implements key genetic analysis methods including Hardy-Weinberg equilibrium testing, inbreeding coefficient calculations, bottleneck detection, and allelic richness assessment.

## Features

### 🧬 Hardy-Weinberg Equilibrium Testing
- Chi-square test for population genetic equilibrium
- Supports multi-allele systems
- Calculates expected vs observed genotype frequencies
- Statistical significance testing (p-values)

### 📊 Inbreeding Coefficient Analysis (F-statistics)
- **FIS**: Inbreeding within subpopulations
- **FST**: Population differentiation (fixation index)
- **FIT**: Total inbreeding coefficient
- Automated interpretation of inbreeding levels

### 🔍 Bottleneck Detection
- Historical population size analysis
- Severity assessment (Mild/Moderate/Severe)
- Recovery time estimation
- Effective population size calculation (harmonic mean)

### 🎯 Allelic Richness Assessment
- Rarefaction method for standardized comparison
- Expected heterozygosity calculations
- Multi-locus analysis support
- Sample size correction

## API Endpoints

### POST `/hardy-weinberg`
Test for Hardy-Weinberg equilibrium using genotype count data.

**Request Body:**
```json
{
  "genotypes": {
    "AA": 25,
    "AB": 50, 
    "BB": 25
  }
}
```

**Response:**
```json
{
  "observed_genotypes": {"AA": 25, "AB": 50, "BB": 25},
  "expected_genotypes": {"AA": 25.0, "AB": 50.0, "BB": 25.0},
  "chi_square_statistic": 0.0,
  "p_value": 1.0,
  "degrees_of_freedom": 1,
  "is_in_equilibrium": true,
  "allele_frequencies": {"A": 0.5, "B": 0.5}
}
```

### POST `/inbreeding-coefficient`
Calculate inbreeding coefficients (F-statistics).

**Request Body:**
```json
{
  "subpop_heterozygosity": [0.4, 0.4, 0.4],
  "total_heterozygosity": 0.35,
  "expected_heterozygosity": 0.5
}
```

**Response:**
```json
{
  "fis": 0.125,
  "fit": 0.3,
  "fst": 0.2,
  "interpretation": "Moderate inbreeding detected"
}
```

### POST `/bottleneck-detection`
Detect genetic bottlenecks from population size data.

**Request Body:**
```json
{
  "sizes": [1000, 900, 50, 100, 200, 400],
  "generations": [1, 2, 3, 4, 5, 6]
}
```

**Response:**
```json
{
  "bottleneck_detected": true,
  "severity": "Severe",
  "minimum_size": 50,
  "reduction_percentage": 95.0,
  "recovery_generations": 3,
  "effective_population_size": 171.4
}
```

### POST `/allelic-richness`
Calculate allelic richness using rarefaction method.

**Request Body:**
```json
{
  "allele_counts": [5, 8, 6, 7],
  "sample_sizes": [50, 50, 50, 50]
}
```

**Response:**
```json
{
  "observed_alleles": [5, 8, 6, 7],
  "rarefied_richness": [5.0, 8.0, 6.0, 7.0],
  "mean_richness": 6.5,
  "expected_heterozygosity": [0.8, 0.875, 0.833, 0.857],
  "mean_heterozygosity": 0.841
}
```

## Installation & Usage

### Local Development
```bash
cd services/genetic-diversity
poetry install
poetry run uvicorn main:app --reload --port 8004
```

### Docker
```bash
docker build -t genetic-diversity-service .
docker run -p 8004:8004 genetic-diversity-service
```

### Testing
```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=main --cov-report=html

# Run specific test class
poetry run pytest test_main.py::TestHardyWeinbergEquilibrium -v
```

## Scientific Background

### Hardy-Weinberg Equilibrium
The Hardy-Weinberg principle states that allele and genotype frequencies remain constant in a population under specific conditions (no mutation, migration, selection, or genetic drift). Deviations indicate evolutionary forces at work.

**Formula for two alleles (p, q):**
- Expected frequency of AA: p²
- Expected frequency of AB: 2pq  
- Expected frequency of BB: q²

### F-Statistics (Wright's Fixation Indices)
Developed by Sewall Wright to measure population structure and inbreeding:

- **FIS = (HS - HI) / HS**: Inbreeding within subpopulations
- **FST = (HT - HS) / HT**: Population differentiation
- **FIT = (HT - HI) / HT**: Total inbreeding

Where:
- HI = observed heterozygosity
- HS = expected heterozygosity within subpopulations
- HT = expected heterozygosity in total population

### Bottleneck Detection
Population bottlenecks reduce genetic diversity and increase extinction risk. This service detects bottlenecks by analyzing:

1. **Severity Classification:**
   - Severe: >90% population reduction
   - Moderate: 75-90% reduction
   - Mild: 50-75% reduction

2. **Effective Population Size:** Harmonic mean of historical sizes
   - Ne = n / Σ(1/Ni) where n = number of generations

### Allelic Richness
Standardized measure of genetic diversity that accounts for sample size differences using rarefaction:

**Rarefaction Formula:**
Expected number of alleles in a standardized sample size, correcting for sampling effects to enable fair comparison between populations.

## Conservation Applications

### Population Monitoring
- Assess genetic health of endangered species
- Monitor inbreeding in small populations
- Track genetic diversity over time

### Breeding Programs
- Optimize genetic diversity in captive populations
- Identify inbreeding depression
- Plan genetic rescue operations

### Habitat Management
- Evaluate genetic connectivity between populations
- Assess impact of habitat fragmentation
- Guide translocation decisions

### Research Applications
- Population genetics studies
- Conservation genomics research
- Evolutionary biology investigations

## Error Handling

The service includes comprehensive validation:

- **Input Validation**: Pydantic models ensure data integrity
- **Range Checking**: Frequencies must sum to 1.0, counts must be positive
- **Statistical Validation**: Minimum sample sizes, degrees of freedom checks
- **Biological Constraints**: Heterozygosity values between 0-1

## Performance Considerations

- **Computational Complexity**: O(n²) for Hardy-Weinberg with n alleles
- **Memory Usage**: Efficient for typical genetic datasets (<10MB)
- **Scalability**: Handles up to 1000 alleles per analysis
- **Response Time**: <100ms for typical requests

## Dependencies

- **FastAPI**: Web framework and API documentation
- **Pydantic**: Data validation and serialization
- **NumPy**: Numerical computations
- **SciPy**: Statistical functions (chi-square tests)
- **Pandas**: Data manipulation (future enhancements)

## Future Enhancements

- [ ] Linkage disequilibrium analysis
- [ ] Population structure analysis (STRUCTURE-like algorithms)
- [ ] Phylogenetic diversity metrics
- [ ] Genomic inbreeding coefficients (ROH analysis)
- [ ] Batch processing for large datasets
- [ ] Integration with genetic file formats (VCF, PLINK)

## References

1. Hardy, G.H. (1908). Mendelian proportions in a mixed population
2. Wright, S. (1951). The genetical structure of populations
3. Nei, M. (1987). Molecular Evolutionary Genetics
4. Allendorf, F.W. et al. (2013). Conservation and the Genetics of Populations
5. Frankham, R. et al. (2017). Introduction to Conservation Genetics