"""
Climate Impact Assessment Service

This service provides tools for analyzing climate change impacts on species and ecosystems
for conservation biology applications. Focuses on mathematical models and calculations
that don't require external data sources.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
import math
import numpy as np

app = FastAPI(
    title="Climate Impact Assessment Service",
    description="Tools for climate change impact analysis on species and ecosystems",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation

class TemperatureToleranceRequest(BaseModel):
    """Request model for temperature tolerance analysis"""
    current_temp_min: float = Field(..., description="Current minimum temperature (°C)")
    current_temp_max: float = Field(..., description="Current maximum temperature (°C)")
    optimal_temp_min: float = Field(..., description="Species optimal minimum temperature (°C)")
    optimal_temp_max: float = Field(..., description="Species optimal maximum temperature (°C)")
    critical_temp_min: float = Field(..., description="Species critical minimum temperature (°C)")
    critical_temp_max: float = Field(..., description="Species critical maximum temperature (°C)")
    projected_temp_change: float = Field(..., description="Projected temperature change (°C)")
    
    @validator('current_temp_max')
    def validate_current_temps(cls, v, values):
        if 'current_temp_min' in values and v <= values['current_temp_min']:
            raise ValueError("Current max temperature must be greater than current min temperature")
        return v
    
    @validator('optimal_temp_max')
    def validate_optimal_temps(cls, v, values):
        if 'optimal_temp_min' in values and v <= values['optimal_temp_min']:
            raise ValueError("Optimal max temperature must be greater than optimal min temperature")
        return v
    
    @validator('critical_temp_max')
    def validate_critical_temps(cls, v, values):
        if 'critical_temp_min' in values and v <= values['critical_temp_min']:
            raise ValueError("Critical max temperature must be greater than critical min temperature")
        return v

class TemperatureToleranceResponse(BaseModel):
    """Response model for temperature tolerance analysis"""
    current_suitability: float = Field(..., description="Current temperature suitability (0-1)")
    projected_suitability: float = Field(..., description="Projected temperature suitability (0-1)")
    suitability_change: float = Field(..., description="Change in suitability (-1 to 1)")
    risk_level: str = Field(..., description="Climate risk classification")
    current_status: str = Field(..., description="Current temperature status")
    projected_status: str = Field(..., description="Projected temperature status")
    recommendations: List[str] = Field(..., description="Management recommendations")

class PhenologyShiftRequest(BaseModel):
    """Request model for phenology shift analysis"""
    historical_event_day: int = Field(..., ge=1, le=365, description="Historical event day of year (1-365)")
    temperature_sensitivity: float = Field(..., gt=0, description="Days shift per °C temperature change")
    projected_temp_change: float = Field(..., description="Projected temperature change (°C)")
    species_flexibility: float = Field(..., ge=0, le=1, description="Species adaptation flexibility (0-1)")
    dependent_species_events: Optional[List[int]] = Field(None, description="Dependent species event days")
    
class PhenologyShiftResponse(BaseModel):
    """Response model for phenology shift analysis"""
    projected_event_day: int = Field(..., description="Projected event day of year")
    shift_magnitude: float = Field(..., description="Days shifted from historical timing")
    shift_direction: str = Field(..., description="Earlier or Later")
    mismatch_risk: str = Field(..., description="Risk of ecological mismatch")
    synchrony_analysis: Optional[Dict[str, float]] = Field(None, description="Synchrony with dependent species")
    adaptation_potential: str = Field(..., description="Species adaptation potential")
    recommendations: List[str] = Field(..., description="Management recommendations")

class SeaLevelRiseRequest(BaseModel):
    """Request model for sea level rise impact analysis"""
    habitat_elevation: float = Field(..., ge=0, description="Habitat elevation above sea level (meters)")
    habitat_area: float = Field(..., gt=0, description="Current habitat area (hectares)")
    slope_gradient: float = Field(..., ge=0, le=90, description="Average slope gradient (degrees)")
    sea_level_rise_rate: float = Field(..., gt=0, description="Sea level rise rate (mm/year)")
    time_horizon: int = Field(..., gt=0, le=200, description="Time horizon for analysis (years)")
    migration_potential: float = Field(..., ge=0, le=1, description="Habitat migration potential (0-1)")

class SeaLevelRiseResponse(BaseModel):
    """Response model for sea level rise impact analysis"""
    total_sea_level_rise: float = Field(..., description="Total projected sea level rise (meters)")
    habitat_loss_percentage: float = Field(..., description="Percentage of habitat lost (%)")
    remaining_habitat_area: float = Field(..., description="Remaining habitat area (hectares)")
    inundation_timeline: Dict[str, float] = Field(..., description="Habitat loss over time")
    migration_feasibility: str = Field(..., description="Habitat migration feasibility")
    urgency_level: str = Field(..., description="Conservation urgency level")
    recommendations: List[str] = Field(..., description="Adaptation recommendations")

class ClimateVelocityRequest(BaseModel):
    """Request model for climate velocity analysis"""
    temperature_gradient: float = Field(..., gt=0, description="Temperature gradient (°C per km)")
    climate_change_rate: float = Field(..., description="Rate of climate change (°C per decade)")
    species_dispersal_rate: float = Field(..., gt=0, description="Species dispersal rate (km per year)")
    habitat_fragmentation: float = Field(..., ge=0, le=1, description="Habitat fragmentation index (0-1)")
    topographic_complexity: float = Field(..., ge=0, le=1, description="Topographic complexity (0-1)")

class ClimateVelocityResponse(BaseModel):
    """Response model for climate velocity analysis"""
    climate_velocity: float = Field(..., description="Climate velocity (km per year)")
    dispersal_deficit: float = Field(..., description="Dispersal deficit (km per year)")
    tracking_ability: str = Field(..., description="Species ability to track climate")
    fragmentation_impact: str = Field(..., description="Impact of habitat fragmentation")
    topographic_refugia: str = Field(..., description="Availability of topographic refugia")
    migration_feasibility: str = Field(..., description="Overall migration feasibility")
    recommendations: List[str] = Field(..., description="Conservation recommendations")

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Climate Impact Assessment Service",
        "version": "1.0.0",
        "description": "Tools for climate change impact analysis on species and ecosystems",
        "endpoints": [
            "/temperature-tolerance",
            "/phenology-shift",
            "/sea-level-rise",
            "/climate-velocity"
        ]
    }

@app.post("/temperature-tolerance", response_model=TemperatureToleranceResponse)
async def analyze_temperature_tolerance(request: TemperatureToleranceRequest):
    """
    Analyze species temperature tolerance and climate change vulnerability.
    
    Calculates current and projected temperature suitability based on species
    thermal tolerance ranges and projected climate change.
    """
    try:
        # Calculate current temperature suitability
        current_mean = (request.current_temp_min + request.current_temp_max) / 2
        optimal_mean = (request.optimal_temp_min + request.optimal_temp_max) / 2
        optimal_range = request.optimal_temp_max - request.optimal_temp_min
        critical_range_min = request.critical_temp_min
        critical_range_max = request.critical_temp_max
        
        # Current suitability based on overlap with optimal range
        current_suitability = calculate_temperature_suitability(
            request.current_temp_min, request.current_temp_max,
            request.optimal_temp_min, request.optimal_temp_max,
            critical_range_min, critical_range_max
        )
        
        # Projected temperatures
        projected_temp_min = request.current_temp_min + request.projected_temp_change
        projected_temp_max = request.current_temp_max + request.projected_temp_change
        
        # Projected suitability
        projected_suitability = calculate_temperature_suitability(
            projected_temp_min, projected_temp_max,
            request.optimal_temp_min, request.optimal_temp_max,
            critical_range_min, critical_range_max
        )
        
        # Calculate change
        suitability_change = projected_suitability - current_suitability
        
        # Classify risk level
        if suitability_change <= -0.5:
            risk_level = "Very High Risk"
        elif suitability_change <= -0.25:
            risk_level = "High Risk"
        elif suitability_change <= -0.1:
            risk_level = "Moderate Risk"
        elif suitability_change <= 0.1:
            risk_level = "Low Risk"
        else:
            risk_level = "Potential Benefit"
        
        # Status classifications
        current_status = classify_temperature_status(current_suitability)
        projected_status = classify_temperature_status(projected_suitability)
        
        # Generate recommendations
        recommendations = generate_temperature_recommendations(
            current_suitability, projected_suitability, suitability_change, request.projected_temp_change
        )
        
        return TemperatureToleranceResponse(
            current_suitability=round(current_suitability, 3),
            projected_suitability=round(projected_suitability, 3),
            suitability_change=round(suitability_change, 3),
            risk_level=risk_level,
            current_status=current_status,
            projected_status=projected_status,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@app.post("/phenology-shift", response_model=PhenologyShiftResponse)
async def analyze_phenology_shift(request: PhenologyShiftRequest):
    """
    Analyze phenological shifts due to climate change.
    
    Calculates how species life cycle events (breeding, migration, flowering)
    will shift in timing due to temperature changes.
    """
    try:
        # Calculate projected shift
        shift_days = request.temperature_sensitivity * request.projected_temp_change
        projected_day = request.historical_event_day + shift_days
        
        # Ensure day stays within year bounds
        if projected_day < 1:
            projected_day = 1
        elif projected_day > 365:
            projected_day = 365
        
        projected_day = int(round(projected_day))
        
        # Determine shift direction
        if shift_days < -1:
            shift_direction = "Earlier"
        elif shift_days > 1:
            shift_direction = "Later"
        else:
            shift_direction = "Minimal Change"
        
        # Assess mismatch risk
        abs_shift = abs(shift_days)
        if abs_shift >= 20:
            mismatch_risk = "Very High"
        elif abs_shift >= 10:
            mismatch_risk = "High"
        elif abs_shift >= 5:
            mismatch_risk = "Moderate"
        else:
            mismatch_risk = "Low"
        
        # Analyze synchrony with dependent species
        synchrony_analysis = None
        if request.dependent_species_events:
            synchrony_analysis = {}
            for i, dep_day in enumerate(request.dependent_species_events):
                original_gap = abs(request.historical_event_day - dep_day)
                projected_gap = abs(projected_day - dep_day)
                synchrony_change = projected_gap - original_gap
                synchrony_analysis[f"species_{i+1}"] = round(synchrony_change, 1)
        
        # Assess adaptation potential
        if request.species_flexibility >= 0.8:
            adaptation_potential = "High"
        elif request.species_flexibility >= 0.5:
            adaptation_potential = "Moderate"
        elif request.species_flexibility >= 0.2:
            adaptation_potential = "Low"
        else:
            adaptation_potential = "Very Low"
        
        # Generate recommendations
        recommendations = generate_phenology_recommendations(
            abs_shift, mismatch_risk, adaptation_potential, shift_direction
        )
        
        return PhenologyShiftResponse(
            projected_event_day=projected_day,
            shift_magnitude=round(abs_shift, 1),
            shift_direction=shift_direction,
            mismatch_risk=mismatch_risk,
            synchrony_analysis=synchrony_analysis,
            adaptation_potential=adaptation_potential,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@app.post("/sea-level-rise", response_model=SeaLevelRiseResponse)
async def analyze_sea_level_rise(request: SeaLevelRiseRequest):
    """
    Analyze sea level rise impacts on coastal habitats.
    
    Calculates habitat loss due to sea level rise based on elevation,
    slope, and migration potential.
    """
    try:
        # Convert sea level rise rate from mm/year to m/year
        slr_rate_m = request.sea_level_rise_rate / 1000
        
        # Calculate total sea level rise over time horizon
        total_slr = slr_rate_m * request.time_horizon
        
        # Calculate slope in radians (needed for multiple calculations)
        slope_radians = math.radians(request.slope_gradient)
        
        # Calculate habitat loss based on elevation and slope
        if request.habitat_elevation <= total_slr:
            # Complete inundation
            habitat_loss_pct = 100.0
        else:
            # Partial loss based on slope and horizontal intrusion
            if slope_radians > 0:
                horizontal_intrusion = total_slr / math.tan(slope_radians)
                # Simplified model: assume rectangular habitat
                habitat_width = math.sqrt(request.habitat_area * 10000)  # Convert ha to m²
                loss_fraction = min(horizontal_intrusion / habitat_width, 1.0)
                habitat_loss_pct = loss_fraction * 100
            else:
                # Flat terrain - use elevation-based model
                elevation_buffer = request.habitat_elevation - total_slr
                if elevation_buffer <= 0:
                    habitat_loss_pct = 100.0
                else:
                    # Gradual loss model
                    habitat_loss_pct = min((total_slr / request.habitat_elevation) * 100, 100.0)
        
        # Calculate remaining habitat
        remaining_area = request.habitat_area * (1 - habitat_loss_pct / 100)
        
        # Create inundation timeline
        timeline_years = [10, 25, 50, request.time_horizon]
        inundation_timeline = {}
        habitat_width = math.sqrt(request.habitat_area * 10000)  # Calculate once
        
        for year in timeline_years:
            if year <= request.time_horizon:
                year_slr = slr_rate_m * year
                if request.habitat_elevation <= year_slr:
                    year_loss = 100.0
                else:
                    if slope_radians > 0:
                        year_intrusion = year_slr / math.tan(slope_radians)
                        year_loss_fraction = min(year_intrusion / habitat_width, 1.0)
                        year_loss = year_loss_fraction * 100
                    else:
                        year_loss = min((year_slr / request.habitat_elevation) * 100, 100.0)
                inundation_timeline[f"year_{year}"] = round(year_loss, 1)
        
        # Assess migration feasibility
        if request.migration_potential >= 0.8:
            migration_feasibility = "High - Good inland habitat available"
        elif request.migration_potential >= 0.5:
            migration_feasibility = "Moderate - Some migration options"
        elif request.migration_potential >= 0.2:
            migration_feasibility = "Low - Limited migration potential"
        else:
            migration_feasibility = "Very Low - Migration unlikely"
        
        # Determine urgency level
        if habitat_loss_pct >= 75:
            urgency_level = "Critical - Immediate action required"
        elif habitat_loss_pct >= 50:
            urgency_level = "High - Action needed within decade"
        elif habitat_loss_pct >= 25:
            urgency_level = "Moderate - Plan adaptation strategies"
        else:
            urgency_level = "Low - Monitor and prepare"
        
        # Generate recommendations
        recommendations = generate_slr_recommendations(
            habitat_loss_pct, migration_feasibility, urgency_level, total_slr
        )
        
        return SeaLevelRiseResponse(
            total_sea_level_rise=round(total_slr, 3),
            habitat_loss_percentage=round(habitat_loss_pct, 1),
            remaining_habitat_area=round(remaining_area, 2),
            inundation_timeline=inundation_timeline,
            migration_feasibility=migration_feasibility,
            urgency_level=urgency_level,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@app.post("/climate-velocity", response_model=ClimateVelocityResponse)
async def analyze_climate_velocity(request: ClimateVelocityRequest):
    """
    Analyze climate velocity and species tracking ability.
    
    Calculates the speed at which species need to migrate to track
    their optimal climate conditions.
    """
    try:
        # Convert climate change rate from per decade to per year
        annual_change_rate = request.climate_change_rate / 10
        
        # Calculate climate velocity (km/year)
        climate_velocity = annual_change_rate / request.temperature_gradient
        
        # Calculate dispersal deficit
        dispersal_deficit = climate_velocity - request.species_dispersal_rate
        
        # Assess tracking ability
        if dispersal_deficit <= 0:
            tracking_ability = "Excellent - Can exceed climate velocity"
        elif dispersal_deficit <= climate_velocity * 0.25:
            tracking_ability = "Good - Can mostly track climate"
        elif dispersal_deficit <= climate_velocity * 0.5:
            tracking_ability = "Moderate - Partial tracking possible"
        elif dispersal_deficit <= climate_velocity:
            tracking_ability = "Poor - Significant lag expected"
        else:
            tracking_ability = "Very Poor - Cannot track climate"
        
        # Assess fragmentation impact
        if request.habitat_fragmentation <= 0.2:
            fragmentation_impact = "Low - Continuous habitat facilitates movement"
        elif request.habitat_fragmentation <= 0.5:
            fragmentation_impact = "Moderate - Some barriers to movement"
        elif request.habitat_fragmentation <= 0.8:
            fragmentation_impact = "High - Significant movement barriers"
        else:
            fragmentation_impact = "Very High - Severe movement constraints"
        
        # Assess topographic refugia
        if request.topographic_complexity >= 0.8:
            topographic_refugia = "Abundant - Complex topography provides refugia"
        elif request.topographic_complexity >= 0.5:
            topographic_refugia = "Moderate - Some topographic diversity"
        elif request.topographic_complexity >= 0.2:
            topographic_refugia = "Limited - Low topographic complexity"
        else:
            topographic_refugia = "Minimal - Flat terrain limits refugia"
        
        # Overall migration feasibility
        feasibility_score = 0
        if dispersal_deficit <= 0:
            feasibility_score += 3
        elif dispersal_deficit <= climate_velocity * 0.5:
            feasibility_score += 2
        else:
            feasibility_score += 1
            
        if request.habitat_fragmentation <= 0.5:
            feasibility_score += 2
        else:
            feasibility_score += 1
            
        if request.topographic_complexity >= 0.5:
            feasibility_score += 2
        else:
            feasibility_score += 1
        
        if feasibility_score >= 6:
            migration_feasibility = "High"
        elif feasibility_score >= 4:
            migration_feasibility = "Moderate"
        else:
            migration_feasibility = "Low"
        
        # Generate recommendations
        recommendations = generate_velocity_recommendations(
            climate_velocity, dispersal_deficit, tracking_ability, 
            fragmentation_impact, migration_feasibility
        )
        
        return ClimateVelocityResponse(
            climate_velocity=round(climate_velocity, 2),
            dispersal_deficit=round(dispersal_deficit, 2),
            tracking_ability=tracking_ability,
            fragmentation_impact=fragmentation_impact,
            topographic_refugia=topographic_refugia,
            migration_feasibility=migration_feasibility,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

# Helper functions

def calculate_temperature_suitability(current_min, current_max, optimal_min, optimal_max, critical_min, critical_max):
    """Calculate temperature suitability based on overlap with optimal range"""
    # Check if completely outside critical range
    if current_max < critical_min or current_min > critical_max:
        return 0.0
    
    # Calculate overlap with optimal range
    overlap_min = max(current_min, optimal_min)
    overlap_max = min(current_max, optimal_max)
    
    if overlap_max <= overlap_min:
        # No overlap with optimal range, but within critical range
        # Calculate distance-based suitability
        if current_max < optimal_min:
            distance = optimal_min - current_max
        else:
            distance = current_min - optimal_max
        
        max_distance = max(abs(optimal_min - critical_min), abs(critical_max - optimal_max))
        if max_distance > 0:
            suitability = max(0, 1 - (distance / max_distance))
        else:
            suitability = 0.5
    else:
        # Calculate overlap fraction
        overlap_range = overlap_max - overlap_min
        current_range = current_max - current_min
        optimal_range = optimal_max - optimal_min
        
        if current_range > 0 and optimal_range > 0:
            suitability = overlap_range / max(current_range, optimal_range)
        else:
            suitability = 1.0 if overlap_range > 0 else 0.0
    
    return min(1.0, max(0.0, suitability))

def classify_temperature_status(suitability):
    """Classify temperature status based on suitability score"""
    if suitability >= 0.8:
        return "Optimal"
    elif suitability >= 0.6:
        return "Suitable"
    elif suitability >= 0.4:
        return "Marginal"
    elif suitability >= 0.2:
        return "Stressful"
    else:
        return "Critical"

def generate_temperature_recommendations(current_suit, projected_suit, change, temp_change):
    """Generate temperature-based recommendations"""
    recommendations = []
    
    if change <= -0.5:
        recommendations.append("Implement immediate conservation interventions")
        recommendations.append("Consider assisted migration to suitable habitats")
        recommendations.append("Establish ex-situ conservation programs")
    elif change <= -0.25:
        recommendations.append("Develop climate adaptation strategies")
        recommendations.append("Enhance habitat connectivity for migration")
        recommendations.append("Monitor population trends closely")
    elif change <= -0.1:
        recommendations.append("Implement adaptive management practices")
        recommendations.append("Maintain habitat quality to reduce additional stressors")
    else:
        recommendations.append("Continue current conservation practices")
        recommendations.append("Monitor for unexpected climate impacts")
    
    if temp_change > 0:
        recommendations.append("Focus on cooling microhabitat management")
    else:
        recommendations.append("Protect thermal refugia and warming areas")
    
    return recommendations

def generate_phenology_recommendations(shift_magnitude, mismatch_risk, adaptation_potential, direction):
    """Generate phenology-based recommendations"""
    recommendations = []
    
    if mismatch_risk in ["Very High", "High"]:
        recommendations.append("Monitor breeding/feeding success closely")
        recommendations.append("Consider supplemental feeding during mismatch periods")
        if adaptation_potential == "Low":
            recommendations.append("Evaluate assisted adaptation strategies")
    
    if shift_magnitude >= 10:
        recommendations.append("Track phenological changes with long-term monitoring")
        recommendations.append("Coordinate with ecosystem-wide phenology studies")
    
    if direction == "Earlier":
        recommendations.append("Ensure early season resources are available")
        recommendations.append("Protect overwintering habitats")
    elif direction == "Later":
        recommendations.append("Maintain late season habitat quality")
        recommendations.append("Monitor for extended breeding seasons")
    
    recommendations.append("Maintain habitat diversity to support timing flexibility")
    
    return recommendations

def generate_slr_recommendations(loss_pct, migration_feasibility, urgency, total_slr):
    """Generate sea level rise recommendations"""
    recommendations = []
    
    if loss_pct >= 50:
        recommendations.append("Prioritize habitat restoration in higher elevation areas")
        recommendations.append("Implement managed retreat strategies")
    
    if "Low" in migration_feasibility:
        recommendations.append("Create stepping stone habitats for migration")
        recommendations.append("Remove barriers to inland movement")
    
    if "Critical" in urgency or "High" in urgency:
        recommendations.append("Develop emergency response protocols")
        recommendations.append("Consider translocation of key species")
    
    recommendations.append("Install early warning monitoring systems")
    recommendations.append("Engage in regional coastal planning initiatives")
    
    if total_slr > 0.5:
        recommendations.append("Plan for long-term habitat transformation")
    
    return recommendations

def generate_velocity_recommendations(velocity, deficit, tracking, fragmentation, feasibility):
    """Generate climate velocity recommendations"""
    recommendations = []
    
    if deficit > 0:
        recommendations.append("Enhance habitat connectivity along climate gradients")
        recommendations.append("Remove barriers to species movement")
    
    if "High" in fragmentation:
        recommendations.append("Create wildlife corridors between habitat patches")
        recommendations.append("Restore degraded habitats to improve connectivity")
    
    if feasibility == "Low":
        recommendations.append("Consider assisted migration programs")
        recommendations.append("Establish climate refugia in suitable areas")
    
    if velocity > 1.0:
        recommendations.append("Focus on rapid habitat restoration techniques")
        recommendations.append("Prioritize protection of climate-stable areas")
    
    recommendations.append("Monitor species distribution shifts")
    recommendations.append("Coordinate landscape-scale conservation planning")
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)