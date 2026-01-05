from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import scipy.stats as stats
from typing import List, Optional
from math import sqrt, log, exp

app = FastAPI(
    title="Sampling & Survey Design API",
    description="Statistical tools for sampling design and survey planning in conservation biology",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models
class SampleSizeInput(BaseModel):
    population_size: Optional[int] = None  # None for infinite population
    expected_proportion: float = 0.5  # Expected proportion (0.5 for maximum variance)
    margin_of_error: float = 0.05  # Desired margin of error
    confidence_level: float = 0.95  # Confidence level (0.95 = 95%)

class SampleSizeOutput(BaseModel):
    sample_size: int
    population_size: Optional[int]
    margin_of_error: float
    confidence_level: float
    expected_proportion: float
    finite_population_correction: bool

class DetectionProbabilityInput(BaseModel):
    detections: int  # Number of times species was detected
    surveys: int  # Total number of surveys conducted
    confidence_level: float = 0.95

class DetectionProbabilityOutput(BaseModel):
    detection_probability: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    detections: int
    surveys: int
    confidence_level: float

class CaptureRecaptureInput(BaseModel):
    marked_first_sample: int  # M: Number marked in first sample
    total_second_sample: int  # C: Total caught in second sample
    marked_in_second: int  # R: Number of marked individuals recaptured

class CaptureRecaptureOutput(BaseModel):
    population_estimate: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    standard_error: float
    marked_first_sample: int
    total_second_sample: int
    marked_in_second: int

class DistanceSamplingInput(BaseModel):
    distances: List[float]  # Perpendicular distances to detected animals
    transect_length: float  # Total length of transect(s)
    transect_width: float  # Half-width of transect (maximum detection distance)

class DistanceSamplingOutput(BaseModel):
    density_estimate: float  # Animals per unit area
    detection_function_parameter: float
    effective_strip_width: float
    encounter_rate: float
    total_detections: int
    surveyed_area: float

@app.get("/")
async def root():
    return {"message": "Sampling & Survey Design API", "version": "0.1.0"}

@app.post("/sample-size", response_model=SampleSizeOutput)
async def calculate_sample_size(data: SampleSizeInput):
    """Calculate required sample size for population surveys."""
    # Z-score for confidence level
    z_score = stats.norm.ppf(1 - (1 - data.confidence_level) / 2)
    
    # Calculate sample size for infinite population
    p = data.expected_proportion
    e = data.margin_of_error
    
    # Basic sample size formula: n = (Z²pq) / e²
    n_infinite = (z_score**2 * p * (1 - p)) / (e**2)
    
    finite_correction = False
    
    if data.population_size is not None:
        # Apply finite population correction
        N = data.population_size
        n_corrected = n_infinite / (1 + (n_infinite - 1) / N)
        sample_size = int(np.ceil(n_corrected))
        finite_correction = True
    else:
        sample_size = int(np.ceil(n_infinite))
    
    return SampleSizeOutput(
        sample_size=sample_size,
        population_size=data.population_size,
        margin_of_error=data.margin_of_error,
        confidence_level=data.confidence_level,
        expected_proportion=data.expected_proportion,
        finite_population_correction=finite_correction
    )

@app.post("/detection-probability", response_model=DetectionProbabilityOutput)
async def calculate_detection_probability(data: DetectionProbabilityInput):
    """Calculate detection probability with confidence intervals."""
    if data.surveys <= 0 or data.detections < 0 or data.detections > data.surveys:
        raise ValueError("Invalid input: detections must be between 0 and surveys")
    
    # Point estimate
    p_hat = data.detections / data.surveys
    
    # Wilson score interval (better for small samples and extreme proportions)
    z = stats.norm.ppf(1 - (1 - data.confidence_level) / 2)
    n = data.surveys
    
    denominator = 1 + z**2 / n
    center = (p_hat + z**2 / (2 * n)) / denominator
    margin = z * sqrt((p_hat * (1 - p_hat) + z**2 / (4 * n)) / n) / denominator
    
    ci_lower = max(0, center - margin)
    ci_upper = min(1, center + margin)
    
    return DetectionProbabilityOutput(
        detection_probability=p_hat,
        confidence_interval_lower=ci_lower,
        confidence_interval_upper=ci_upper,
        detections=data.detections,
        surveys=data.surveys,
        confidence_level=data.confidence_level
    )

@app.post("/capture-recapture", response_model=CaptureRecaptureOutput)
async def capture_recapture_analysis(data: CaptureRecaptureInput):
    """Estimate population size using Lincoln-Petersen estimator."""
    M = data.marked_first_sample
    C = data.total_second_sample
    R = data.marked_in_second
    
    if R == 0:
        raise ValueError("No recaptures found - cannot estimate population size")
    
    # Lincoln-Petersen estimator: N = (M * C) / R
    N_hat = (M * C) / R
    
    # Standard error (Seber 1982)
    if R > 1:
        variance = (M * C * (M - R) * (C - R)) / (R**3 * (R - 1))
        se = sqrt(variance)
        
        # Log-normal confidence interval (more appropriate for count data)
        log_N = log(N_hat)
        log_se = sqrt(log(1 + variance / (N_hat**2)))
        
        z = stats.norm.ppf(0.975)  # 95% CI
        ci_lower = exp(log_N - z * log_se)
        ci_upper = exp(log_N + z * log_se)
    else:
        se = 1e10  # Use very large number instead of infinity for JSON compatibility
        ci_lower = N_hat
        ci_upper = 1e10  # Use very large number instead of infinity for JSON compatibility
    
    return CaptureRecaptureOutput(
        population_estimate=N_hat,
        confidence_interval_lower=ci_lower,
        confidence_interval_upper=ci_upper,
        standard_error=se,
        marked_first_sample=M,
        total_second_sample=C,
        marked_in_second=R
    )

@app.post("/distance-sampling", response_model=DistanceSamplingOutput)
async def distance_sampling_analysis(data: DistanceSamplingInput):
    """Analyze distance sampling data to estimate animal density."""
    distances = np.array(data.distances)
    n = len(distances)
    
    if n == 0:
        raise ValueError("No distance observations provided")
    
    # Simple half-normal detection function: g(x) = exp(-x²/(2σ²))
    # Maximum likelihood estimation of σ
    sigma_hat = sqrt(np.mean(distances**2) / 2)
    
    # Effective strip width (ESW) for half-normal detection function
    # ESW = σ * sqrt(π/2)
    esw = sigma_hat * sqrt(np.pi / 2)
    
    # Encounter rate (detections per unit transect length)
    encounter_rate = n / data.transect_length
    
    # Density estimate: D = n / (2 * L * ESW)
    # where L is transect length and we multiply by 2 for both sides of transect
    surveyed_area = 2 * data.transect_length * esw
    density = n / surveyed_area
    
    return DistanceSamplingOutput(
        density_estimate=density,
        detection_function_parameter=sigma_hat,
        effective_strip_width=esw,
        encounter_rate=encounter_rate,
        total_detections=n,
        surveyed_area=surveyed_area
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)