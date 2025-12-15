"""
Genetic Diversity Service

Provides computational tools for analyzing genetic diversity in conservation biology.
Implements Hardy-Weinberg equilibrium, inbreeding coefficients, bottleneck detection,
and allelic richness calculations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Union
import numpy as np
from scipy import stats
import math
from collections import Counter

app = FastAPI(
    title="Genetic Diversity Service",
    description="Conservation biology tools for genetic diversity analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class AlleleFrequencies(BaseModel):
    """Model for allele frequency data"""
    alleles: Dict[str, float] = Field(..., description="Allele names and their frequencies")
    
    @validator('alleles')
    def validate_frequencies(cls, v):
        if not v:
            raise ValueError("At least one allele frequency must be provided")
        
        total = sum(v.values())
        if not (0.99 <= total <= 1.01):  # Allow small floating point errors
            raise ValueError(f"Allele frequencies must sum to 1.0, got {total}")
        
        for allele, freq in v.items():
            if not (0 <= freq <= 1):
                raise ValueError(f"Frequency for allele {allele} must be between 0 and 1")
        
        return v

class GenotypeData(BaseModel):
    """Model for genotype count data"""
    genotypes: Dict[str, int] = Field(..., description="Genotype combinations and their counts")
    
    @validator('genotypes')
    def validate_genotypes(cls, v):
        if not v:
            raise ValueError("At least one genotype count must be provided")
        
        for genotype, count in v.items():
            if count < 0:
                raise ValueError(f"Count for genotype {genotype} cannot be negative")
        
        return v

class PopulationSizes(BaseModel):
    """Model for historical population sizes for bottleneck detection"""
    sizes: List[int] = Field(..., description="Population sizes over time")
    generations: Optional[List[int]] = Field(None, description="Generation numbers (optional)")
    
    @validator('sizes')
    def validate_sizes(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 population size measurements required")
        
        for size in v:
            if size <= 0:
                raise ValueError("Population sizes must be positive")
        
        return v

class AlleleCountData(BaseModel):
    """Model for allele count data for richness calculations"""
    allele_counts: List[int] = Field(..., description="Number of alleles per locus")
    sample_sizes: List[int] = Field(..., description="Sample sizes per locus")
    
    @validator('allele_counts', 'sample_sizes')
    def validate_positive(cls, v):
        if not v:
            raise ValueError("At least one value must be provided")
        
        for val in v:
            if val <= 0:
                raise ValueError("All values must be positive")
        
        return v
    
    @validator('sample_sizes')
    def validate_sample_allele_match(cls, v, values):
        if 'allele_counts' in values and len(v) != len(values['allele_counts']):
            raise ValueError("Sample sizes and allele counts must have the same length")
        return v

# Response Models
class HardyWeinbergResult(BaseModel):
    """Hardy-Weinberg equilibrium test results"""
    observed_genotypes: Dict[str, int]
    expected_genotypes: Dict[str, float]
    chi_square_statistic: float
    p_value: float
    degrees_of_freedom: int
    is_in_equilibrium: bool
    allele_frequencies: Dict[str, float]

class InbreedingResult(BaseModel):
    """Inbreeding coefficient calculation results"""
    fis: float  # Inbreeding coefficient within subpopulations
    fit: float  # Total inbreeding coefficient
    fst: float  # Fixation index (population differentiation)
    interpretation: str

class BottleneckResult(BaseModel):
    """Bottleneck detection results"""
    bottleneck_detected: bool
    severity: str
    minimum_size: int
    reduction_percentage: float
    recovery_generations: Optional[int]
    effective_population_size: float

class AlleleRichnessResult(BaseModel):
    """Allelic richness calculation results"""
    observed_alleles: List[int]
    rarefied_richness: List[float]
    mean_richness: float
    expected_heterozygosity: List[float]
    mean_heterozygosity: float

# Genetic Diversity Calculations

def calculate_hardy_weinberg(genotype_data: GenotypeData) -> HardyWeinbergResult:
    """
    Test for Hardy-Weinberg equilibrium using chi-square test.
    
    Args:
        genotype_data: Observed genotype counts
        
    Returns:
        Hardy-Weinberg test results
    """
    genotypes = genotype_data.genotypes
    
    # Calculate total individuals
    total_individuals = sum(genotypes.values())
    
    if total_individuals == 0:
        raise ValueError("No individuals in dataset")
    
    # Extract alleles from genotype names (assumes format like "AA", "AB", "BB")
    alleles = set()
    for genotype in genotypes.keys():
        if len(genotype) == 2:
            alleles.update(list(genotype))
        else:
            # Handle multi-character allele names (e.g., "A1A1", "A1A2")
            # Simple heuristic: split by common patterns
            if len(genotype) == 4 and genotype[:2] == genotype[2:]:
                alleles.add(genotype[:2])
            elif len(genotype) == 4:
                alleles.add(genotype[:2])
                alleles.add(genotype[2:])
            else:
                # Fallback: treat as single characters
                alleles.update(list(genotype))
    
    alleles = sorted(list(alleles))
    
    if len(alleles) < 2:
        raise ValueError("At least 2 alleles required for Hardy-Weinberg test")
    
    # Calculate allele frequencies
    allele_counts = {allele: 0 for allele in alleles}
    
    for genotype, count in genotypes.items():
        if len(genotype) == 2:
            # Single character alleles
            for allele in genotype:
                if allele in allele_counts:
                    allele_counts[allele] += count
        else:
            # Multi-character alleles (simplified handling)
            if len(genotype) == 4:
                allele1, allele2 = genotype[:2], genotype[2:]
                if allele1 in allele_counts:
                    allele_counts[allele1] += count
                if allele2 in allele_counts:
                    allele_counts[allele2] += count
    
    total_alleles = sum(allele_counts.values())
    allele_frequencies = {allele: count / total_alleles for allele, count in allele_counts.items()}
    
    # Calculate expected genotype frequencies under Hardy-Weinberg
    expected_genotypes = {}
    
    for i, allele1 in enumerate(alleles):
        for j, allele2 in enumerate(alleles):
            if i <= j:  # Avoid duplicate genotypes
                genotype = allele1 + allele2
                if i == j:
                    # Homozygote
                    expected_freq = allele_frequencies[allele1] ** 2
                else:
                    # Heterozygote
                    expected_freq = 2 * allele_frequencies[allele1] * allele_frequencies[allele2]
                
                expected_genotypes[genotype] = expected_freq * total_individuals
    
    # Perform chi-square test
    observed_values = []
    expected_values = []
    
    for genotype in expected_genotypes.keys():
        observed = genotypes.get(genotype, 0)
        expected = expected_genotypes[genotype]
        
        observed_values.append(observed)
        expected_values.append(expected)
    
    # Calculate chi-square statistic
    chi_square = sum((obs - exp) ** 2 / exp for obs, exp in zip(observed_values, expected_values) if exp > 0)
    
    # Degrees of freedom = number of genotypes - number of alleles
    df = len(expected_genotypes) - len(alleles)
    
    # Calculate p-value
    p_value = 1 - stats.chi2.cdf(chi_square, df) if df > 0 else 1.0
    
    # Determine if in equilibrium (p > 0.05)
    is_in_equilibrium = p_value > 0.05
    
    return HardyWeinbergResult(
        observed_genotypes=genotypes,
        expected_genotypes=expected_genotypes,
        chi_square_statistic=chi_square,
        p_value=p_value,
        degrees_of_freedom=df,
        is_in_equilibrium=is_in_equilibrium,
        allele_frequencies=allele_frequencies
    )

def calculate_inbreeding_coefficient(
    subpop_heterozygosity: List[float],
    total_heterozygosity: float,
    expected_heterozygosity: float
) -> InbreedingResult:
    """
    Calculate inbreeding coefficients (F-statistics).
    
    Args:
        subpop_heterozygosity: Observed heterozygosity in each subpopulation
        total_heterozygosity: Overall observed heterozygosity
        expected_heterozygosity: Expected heterozygosity under random mating
        
    Returns:
        Inbreeding coefficient results
    """
    if not (0 <= total_heterozygosity <= 1):
        raise ValueError("Total heterozygosity must be between 0 and 1")
    
    if not (0 <= expected_heterozygosity <= 1):
        raise ValueError("Expected heterozygosity must be between 0 and 1")
    
    for h in subpop_heterozygosity:
        if not (0 <= h <= 1):
            raise ValueError("All heterozygosity values must be between 0 and 1")
    
    # Calculate mean subpopulation heterozygosity
    hs = np.mean(subpop_heterozygosity) if subpop_heterozygosity else total_heterozygosity
    ht = expected_heterozygosity
    hi = total_heterozygosity
    
    # Calculate F-statistics
    # FIS = (Hs - Hi) / Hs (inbreeding within subpopulations)
    fis = (hs - hi) / hs if hs > 0 else 0
    
    # FST = (Ht - Hs) / Ht (population differentiation)
    fst = (ht - hs) / ht if ht > 0 else 0
    
    # FIT = (Ht - Hi) / Ht (total inbreeding)
    fit = (ht - hi) / ht if ht > 0 else 0
    
    # Interpretation
    if fis > 0.1:
        interpretation = "High inbreeding detected"
    elif fis > 0.05:
        interpretation = "Moderate inbreeding detected"
    elif fis > 0:
        interpretation = "Low inbreeding detected"
    else:
        interpretation = "No inbreeding detected (possible outbreeding)"
    
    return InbreedingResult(
        fis=fis,
        fit=fit,
        fst=fst,
        interpretation=interpretation
    )

def detect_bottleneck(population_sizes: PopulationSizes) -> BottleneckResult:
    """
    Detect genetic bottlenecks from population size data.
    
    Args:
        population_sizes: Historical population size data
        
    Returns:
        Bottleneck detection results
    """
    sizes = population_sizes.sizes
    
    if len(sizes) < 2:
        raise ValueError("At least 2 population size measurements required")
    
    # Find minimum population size and its position
    min_size = min(sizes)
    min_index = sizes.index(min_size)
    max_size = max(sizes)
    
    # Calculate reduction percentage
    reduction_percentage = ((max_size - min_size) / max_size) * 100
    
    # Determine bottleneck severity
    if reduction_percentage >= 90:
        severity = "Severe"
        bottleneck_detected = True
    elif reduction_percentage >= 75:
        severity = "Moderate"
        bottleneck_detected = True
    elif reduction_percentage >= 50:
        severity = "Mild"
        bottleneck_detected = True
    else:
        severity = "None"
        bottleneck_detected = False
    
    # Estimate recovery time (generations after bottleneck to reach 90% of pre-bottleneck size)
    recovery_generations = None
    if bottleneck_detected and min_index < len(sizes) - 1:
        target_size = max_size * 0.9
        for i in range(min_index + 1, len(sizes)):
            if sizes[i] >= target_size:
                recovery_generations = i - min_index
                break
    
    # Calculate effective population size (harmonic mean)
    effective_size = len(sizes) / sum(1/size for size in sizes)
    
    return BottleneckResult(
        bottleneck_detected=bottleneck_detected,
        severity=severity,
        minimum_size=min_size,
        reduction_percentage=reduction_percentage,
        recovery_generations=recovery_generations,
        effective_population_size=effective_size
    )

def calculate_allelic_richness(allele_data: AlleleCountData) -> AlleleRichnessResult:
    """
    Calculate allelic richness using rarefaction method.
    
    Args:
        allele_data: Allele count and sample size data
        
    Returns:
        Allelic richness results
    """
    allele_counts = allele_data.allele_counts
    sample_sizes = allele_data.sample_sizes
    
    if len(allele_counts) != len(sample_sizes):
        raise ValueError("Allele counts and sample sizes must have the same length")
    
    # Calculate rarefied allelic richness for standardized sample size
    min_sample_size = min(sample_sizes)
    rarefied_richness = []
    expected_heterozygosity = []
    
    for i, (alleles, sample_size) in enumerate(zip(allele_counts, sample_sizes)):
        if sample_size < min_sample_size:
            raise ValueError(f"Sample size {sample_size} is less than minimum {min_sample_size}")
        
        # Rarefaction formula: expected number of alleles in smaller sample
        if sample_size == min_sample_size:
            rarefied = float(alleles)
        else:
            # Use hypergeometric distribution for rarefaction
            # Simplified approximation for computational efficiency
            rarefied = alleles * (1 - ((sample_size - min_sample_size) / sample_size) ** 2)
        
        rarefied_richness.append(rarefied)
        
        # Calculate expected heterozygosity (gene diversity)
        # Assuming equal allele frequencies for simplicity
        if alleles > 1:
            he = 1 - (1 / alleles)  # Simplified formula
        else:
            he = 0.0
        
        expected_heterozygosity.append(he)
    
    mean_richness = np.mean(rarefied_richness)
    mean_heterozygosity = np.mean(expected_heterozygosity)
    
    return AlleleRichnessResult(
        observed_alleles=allele_counts,
        rarefied_richness=rarefied_richness,
        mean_richness=mean_richness,
        expected_heterozygosity=expected_heterozygosity,
        mean_heterozygosity=mean_heterozygosity
    )

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Genetic Diversity Analysis",
        "version": "1.0.0",
        "description": "Conservation biology tools for genetic diversity analysis",
        "endpoints": [
            "/hardy-weinberg",
            "/inbreeding-coefficient", 
            "/bottleneck-detection",
            "/allelic-richness"
        ]
    }

@app.post("/hardy-weinberg", response_model=HardyWeinbergResult)
async def hardy_weinberg_test(genotype_data: GenotypeData):
    """
    Test for Hardy-Weinberg equilibrium using chi-square test.
    
    Determines if a population is in genetic equilibrium by comparing
    observed vs expected genotype frequencies.
    """
    try:
        return calculate_hardy_weinberg(genotype_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class InbreedingRequest(BaseModel):
    """Request model for inbreeding coefficient calculation"""
    subpop_heterozygosity: List[float] = Field(..., description="Heterozygosity values per subpopulation")
    total_heterozygosity: float = Field(..., description="Overall observed heterozygosity")
    expected_heterozygosity: float = Field(..., description="Expected heterozygosity under random mating")

@app.post("/inbreeding-coefficient", response_model=InbreedingResult)
async def inbreeding_coefficient(request: InbreedingRequest):
    """
    Calculate inbreeding coefficients (F-statistics).
    
    Computes FIS, FST, and FIT to assess inbreeding levels
    and population structure.
    """
    try:
        return calculate_inbreeding_coefficient(
            request.subpop_heterozygosity,
            request.total_heterozygosity, 
            request.expected_heterozygosity
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/bottleneck-detection", response_model=BottleneckResult)
async def bottleneck_detection(population_sizes: PopulationSizes):
    """
    Detect genetic bottlenecks from population size data.
    
    Analyzes historical population sizes to identify
    bottleneck events and assess their severity.
    """
    try:
        return detect_bottleneck(population_sizes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/allelic-richness", response_model=AlleleRichnessResult)
async def allelic_richness(allele_data: AlleleCountData):
    """
    Calculate allelic richness using rarefaction method.
    
    Standardizes allelic diversity measures across different
    sample sizes for comparative analysis.
    """
    try:
        return calculate_allelic_richness(allele_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)