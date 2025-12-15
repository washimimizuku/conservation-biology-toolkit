"""
Species Assessment Service

Provides computational tools for species conservation assessment including
IUCN Red List criteria evaluation, extinction risk assessment, and range calculations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Union
import numpy as np
# from scipy import stats  # Not needed for current implementation
import math
from enum import Enum

app = FastAPI(
    title="Species Assessment Service",
    description="Conservation biology tools for species assessment and threat evaluation",
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

# Enums for IUCN categories
class IUCNCategory(str, Enum):
    LC = "Least Concern"
    NT = "Near Threatened"
    VU = "Vulnerable"
    EN = "Endangered"
    CR = "Critically Endangered"
    EW = "Extinct in the Wild"
    EX = "Extinct"
    DD = "Data Deficient"

class ThreatLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

# Pydantic Models
class PopulationData(BaseModel):
    """Model for population trend data"""
    current_population: Optional[int] = Field(None, description="Current population size")
    historical_population: Optional[int] = Field(None, description="Historical population size")
    years_between: Optional[int] = Field(None, description="Years between measurements")
    decline_rate: Optional[float] = Field(None, description="Annual decline rate (0-1)")
    
    @validator('decline_rate')
    def validate_decline_rate(cls, v):
        if v is not None and not (0 <= v <= 1):
            raise ValueError("Decline rate must be between 0 and 1")
        return v

class RangeData(BaseModel):
    """Model for species range information"""
    extent_of_occurrence: Optional[float] = Field(None, description="Extent of occurrence in km²")
    area_of_occupancy: Optional[float] = Field(None, description="Area of occupancy in km²")
    number_of_locations: Optional[int] = Field(None, description="Number of locations")
    severely_fragmented: Optional[bool] = Field(False, description="Is the population severely fragmented?")

class ExtinctionRiskFactors(BaseModel):
    """Model for extinction risk assessment factors"""
    population_size: Optional[int] = Field(None, description="Current population size")
    population_trend: Optional[str] = Field(None, description="Population trend (declining/stable/increasing)")
    habitat_quality: Optional[float] = Field(None, description="Habitat quality score (0-1)")
    threat_intensity: Optional[float] = Field(None, description="Threat intensity score (0-1)")
    genetic_diversity: Optional[float] = Field(None, description="Genetic diversity score (0-1)")
    
    @validator('habitat_quality', 'threat_intensity', 'genetic_diversity')
    def validate_scores(cls, v):
        if v is not None and not (0 <= v <= 1):
            raise ValueError("Scores must be between 0 and 1")
        return v
# Response Models
class IUCNAssessmentResult(BaseModel):
    """IUCN Red List assessment results"""
    category: IUCNCategory
    criteria_met: List[str]
    population_decline: Optional[float]
    range_size_km2: Optional[float]
    population_size: Optional[int]
    justification: str
    confidence_level: str

class ExtinctionRiskResult(BaseModel):
    """Extinction risk assessment results"""
    risk_level: ThreatLevel
    risk_score: float  # 0-1 scale
    contributing_factors: Dict[str, float]
    time_to_extinction_years: Optional[int]
    recommendations: List[str]

class RangeSizeResult(BaseModel):
    """Range size calculation results"""
    extent_of_occurrence_km2: Optional[float]
    area_of_occupancy_km2: Optional[float]
    range_fragmentation_index: Optional[float]
    habitat_connectivity: Optional[float]
    conservation_priority: str

# Assessment Functions

def assess_iucn_criteria(population_data: PopulationData, range_data: RangeData) -> IUCNAssessmentResult:
    """
    Assess IUCN Red List criteria based on population and range data.
    
    Implements simplified IUCN criteria A (population decline), B (geographic range), 
    C (small population size), and D (very small population).
    """
    criteria_met = []
    category = IUCNCategory.LC
    justification_parts = []
    
    # Criterion A: Population decline
    if population_data.decline_rate is not None:
        decline_percent = population_data.decline_rate * 100
        
        if decline_percent >= 80:
            criteria_met.append("A1: ≥80% population decline")
            category = IUCNCategory.CR
            justification_parts.append(f"Population declined by {decline_percent:.1f}%")
        elif decline_percent >= 50:
            criteria_met.append("A1: ≥50% population decline")
            if category not in [IUCNCategory.CR]:
                category = IUCNCategory.EN
            justification_parts.append(f"Population declined by {decline_percent:.1f}%")
        elif decline_percent >= 30:
            criteria_met.append("A1: ≥30% population decline")
            if category not in [IUCNCategory.CR, IUCNCategory.EN]:
                category = IUCNCategory.VU
            justification_parts.append(f"Population declined by {decline_percent:.1f}%")
    
    # Criterion B: Geographic range
    if range_data.extent_of_occurrence is not None:
        eoo = range_data.extent_of_occurrence
        
        if eoo < 100:  # km²
            criteria_met.append("B1: EOO < 100 km²")
            category = IUCNCategory.CR
            justification_parts.append(f"Extent of occurrence: {eoo} km²")
        elif eoo < 5000:
            criteria_met.append("B1: EOO < 5,000 km²")
            if category not in [IUCNCategory.CR]:
                category = IUCNCategory.EN
            justification_parts.append(f"Extent of occurrence: {eoo} km²")
        elif eoo < 20000:
            criteria_met.append("B1: EOO < 20,000 km²")
            if category not in [IUCNCategory.CR, IUCNCategory.EN]:
                category = IUCNCategory.VU
            justification_parts.append(f"Extent of occurrence: {eoo} km²")
    
    if range_data.area_of_occupancy is not None:
        aoo = range_data.area_of_occupancy
        
        if aoo < 10:  # km²
            criteria_met.append("B2: AOO < 10 km²")
            category = IUCNCategory.CR
            justification_parts.append(f"Area of occupancy: {aoo} km²")
        elif aoo < 500:
            criteria_met.append("B2: AOO < 500 km²")
            if category not in [IUCNCategory.CR]:
                category = IUCNCategory.EN
            justification_parts.append(f"Area of occupancy: {aoo} km²")
        elif aoo < 2000:
            criteria_met.append("B2: AOO < 2,000 km²")
            if category not in [IUCNCategory.CR, IUCNCategory.EN]:
                category = IUCNCategory.VU
            justification_parts.append(f"Area of occupancy: {aoo} km²")
    
    # Criterion C: Small population size
    if population_data.current_population is not None:
        pop_size = population_data.current_population
        
        if pop_size < 250:
            criteria_met.append("C: Population < 250 mature individuals")
            category = IUCNCategory.CR
            justification_parts.append(f"Population size: {pop_size} individuals")
        elif pop_size < 2500:
            criteria_met.append("C: Population < 2,500 mature individuals")
            if category not in [IUCNCategory.CR]:
                category = IUCNCategory.EN
            justification_parts.append(f"Population size: {pop_size} individuals")
        elif pop_size < 10000:
            criteria_met.append("C: Population < 10,000 mature individuals")
            if category not in [IUCNCategory.CR, IUCNCategory.EN]:
                category = IUCNCategory.VU
            justification_parts.append(f"Population size: {pop_size} individuals")
    
    # Criterion D: Very small population
    if population_data.current_population is not None:
        pop_size = population_data.current_population
        
        if pop_size < 50:
            criteria_met.append("D: Population < 50 mature individuals")
            category = IUCNCategory.CR
        elif pop_size < 250:
            criteria_met.append("D: Population < 250 mature individuals")
            if category not in [IUCNCategory.CR]:
                category = IUCNCategory.EN
        elif pop_size < 1000:
            criteria_met.append("D: Population < 1,000 mature individuals")
            if category not in [IUCNCategory.CR, IUCNCategory.EN]:
                category = IUCNCategory.VU
    
    # Determine confidence level
    data_points = sum([
        population_data.current_population is not None,
        population_data.decline_rate is not None,
        range_data.extent_of_occurrence is not None,
        range_data.area_of_occupancy is not None
    ])
    
    if data_points >= 3:
        confidence = "High"
    elif data_points >= 2:
        confidence = "Medium"
    else:
        confidence = "Low"
    
    justification = "; ".join(justification_parts) if justification_parts else "Insufficient data for threat assessment"
    
    return IUCNAssessmentResult(
        category=category,
        criteria_met=criteria_met,
        population_decline=population_data.decline_rate,
        range_size_km2=range_data.extent_of_occurrence,
        population_size=population_data.current_population,
        justification=justification,
        confidence_level=confidence
    )

def assess_extinction_risk(risk_factors: ExtinctionRiskFactors) -> ExtinctionRiskResult:
    """
    Assess extinction risk based on multiple factors using a weighted scoring system.
    """
    factors = {}
    total_score = 0
    weight_sum = 0
    
    # Population size factor (weight: 0.3)
    if risk_factors.population_size is not None:
        pop_size = risk_factors.population_size
        if pop_size < 50:
            pop_score = 1.0
        elif pop_size < 250:
            pop_score = 0.8
        elif pop_size < 1000:
            pop_score = 0.6
        elif pop_size < 10000:
            pop_score = 0.4
        else:
            pop_score = 0.2
        
        factors["Population Size"] = pop_score
        total_score += pop_score * 0.3
        weight_sum += 0.3
    
    # Population trend factor (weight: 0.25)
    if risk_factors.population_trend is not None:
        trend = risk_factors.population_trend.lower()
        if trend == "declining":
            trend_score = 0.8
        elif trend == "stable":
            trend_score = 0.4
        elif trend == "increasing":
            trend_score = 0.1
        else:
            trend_score = 0.5  # unknown
        
        factors["Population Trend"] = trend_score
        total_score += trend_score * 0.25
        weight_sum += 0.25
    
    # Habitat quality factor (weight: 0.2)
    if risk_factors.habitat_quality is not None:
        habitat_score = 1.0 - risk_factors.habitat_quality  # Invert: poor habitat = high risk
        factors["Habitat Quality"] = habitat_score
        total_score += habitat_score * 0.2
        weight_sum += 0.2
    
    # Threat intensity factor (weight: 0.15)
    if risk_factors.threat_intensity is not None:
        factors["Threat Intensity"] = risk_factors.threat_intensity
        total_score += risk_factors.threat_intensity * 0.15
        weight_sum += 0.15
    
    # Genetic diversity factor (weight: 0.1)
    if risk_factors.genetic_diversity is not None:
        genetic_score = 1.0 - risk_factors.genetic_diversity  # Invert: low diversity = high risk
        factors["Genetic Diversity"] = genetic_score
        total_score += genetic_score * 0.1
        weight_sum += 0.1
    
    # Normalize score
    if weight_sum > 0:
        risk_score = total_score / weight_sum
    else:
        risk_score = 0.5  # Default if no data
    
    # Determine risk level
    if risk_score >= 0.8:
        risk_level = ThreatLevel.CRITICAL
    elif risk_score >= 0.6:
        risk_level = ThreatLevel.HIGH
    elif risk_score >= 0.4:
        risk_level = ThreatLevel.MEDIUM
    else:
        risk_level = ThreatLevel.LOW
    
    # Estimate time to extinction (simplified model)
    time_to_extinction = None
    if risk_factors.population_size is not None and risk_factors.population_trend == "declining":
        pop_size = risk_factors.population_size
        if risk_score > 0.8:
            time_to_extinction = max(5, int(pop_size / 100))  # Very rough estimate
        elif risk_score > 0.6:
            time_to_extinction = max(10, int(pop_size / 50))
    
    # Generate recommendations
    recommendations = []
    if risk_score >= 0.6:
        recommendations.append("Immediate conservation action required")
        recommendations.append("Establish protected areas or reserves")
        recommendations.append("Implement captive breeding program")
    elif risk_score >= 0.4:
        recommendations.append("Monitor population trends closely")
        recommendations.append("Reduce habitat threats")
        recommendations.append("Enhance habitat connectivity")
    else:
        recommendations.append("Continue regular monitoring")
        recommendations.append("Maintain habitat quality")
    
    return ExtinctionRiskResult(
        risk_level=risk_level,
        risk_score=risk_score,
        contributing_factors=factors,
        time_to_extinction_years=time_to_extinction,
        recommendations=recommendations
    )
def calculate_range_metrics(range_data: RangeData) -> RangeSizeResult:
    """
    Calculate range size metrics and conservation priority.
    """
    # Calculate fragmentation index
    fragmentation_index = None
    if range_data.extent_of_occurrence is not None and range_data.area_of_occupancy is not None:
        eoo = range_data.extent_of_occurrence
        aoo = range_data.area_of_occupancy
        if eoo > 0:
            fragmentation_index = 1.0 - (aoo / eoo)  # Higher values = more fragmented
    
    # Estimate habitat connectivity
    connectivity = None
    if range_data.number_of_locations is not None and range_data.area_of_occupancy is not None:
        locations = range_data.number_of_locations
        aoo = range_data.area_of_occupancy
        if locations > 0:
            avg_patch_size = aoo / locations
            # Connectivity decreases with more, smaller patches
            connectivity = min(1.0, avg_patch_size / 100)  # Normalized to 100 km² patches
    
    # Determine conservation priority
    priority_score = 0
    
    if range_data.extent_of_occurrence is not None:
        eoo = range_data.extent_of_occurrence
        if eoo < 100:
            priority_score += 3
        elif eoo < 5000:
            priority_score += 2
        elif eoo < 20000:
            priority_score += 1
    
    if range_data.area_of_occupancy is not None:
        aoo = range_data.area_of_occupancy
        if aoo < 10:
            priority_score += 3
        elif aoo < 500:
            priority_score += 2
        elif aoo < 2000:
            priority_score += 1
    
    if range_data.severely_fragmented:
        priority_score += 2
    
    if range_data.number_of_locations is not None and range_data.number_of_locations <= 5:
        priority_score += 2
    
    # Convert score to priority level
    if priority_score >= 6:
        conservation_priority = "Critical"
    elif priority_score >= 4:
        conservation_priority = "High"
    elif priority_score >= 2:
        conservation_priority = "Medium"
    else:
        conservation_priority = "Low"
    
    return RangeSizeResult(
        extent_of_occurrence_km2=range_data.extent_of_occurrence,
        area_of_occupancy_km2=range_data.area_of_occupancy,
        range_fragmentation_index=fragmentation_index,
        habitat_connectivity=connectivity,
        conservation_priority=conservation_priority
    )

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Species Assessment Service",
        "version": "1.0.0",
        "description": "Conservation biology tools for species assessment and threat evaluation",
        "endpoints": [
            "/iucn-assessment",
            "/extinction-risk",
            "/range-analysis"
        ]
    }
class IUCNAssessmentRequest(BaseModel):
    """Request model for IUCN assessment"""
    population_data: PopulationData
    range_data: RangeData

@app.post("/iucn-assessment", response_model=IUCNAssessmentResult)
async def iucn_red_list_assessment(request: IUCNAssessmentRequest):
    """
    Assess species according to IUCN Red List criteria.
    
    Evaluates population decline, geographic range, and population size
    to determine appropriate IUCN threat category.
    """
    try:
        return assess_iucn_criteria(request.population_data, request.range_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/extinction-risk", response_model=ExtinctionRiskResult)
async def extinction_risk_assessment(risk_factors: ExtinctionRiskFactors):
    """
    Assess extinction risk based on multiple biological and environmental factors.
    
    Uses a weighted scoring system to evaluate population size, trends,
    habitat quality, threats, and genetic diversity.
    """
    try:
        return assess_extinction_risk(risk_factors)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/range-analysis", response_model=RangeSizeResult)
async def range_size_analysis(range_data: RangeData):
    """
    Analyze species range size and fragmentation metrics.
    
    Calculates extent of occurrence, area of occupancy, fragmentation indices,
    and conservation priority based on range characteristics.
    """
    try:
        return calculate_range_metrics(range_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)