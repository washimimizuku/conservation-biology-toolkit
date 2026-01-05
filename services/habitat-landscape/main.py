"""
Habitat and Landscape Analysis Service

This service provides tools for analyzing habitat quality, landscape fragmentation,
and species-area relationships for conservation biology applications.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
import math
import numpy as np

app = FastAPI(
    title="Habitat and Landscape Analysis Service",
    description="Tools for habitat suitability, fragmentation metrics, and species-area relationships",
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

class HabitatParameter(BaseModel):
    """Individual habitat parameter with weight and score"""
    name: str = Field(..., description="Parameter name")
    score: float = Field(..., ge=0, le=1, description="Parameter score (0-1)")
    weight: float = Field(..., ge=0, le=1, description="Parameter weight (0-1)")

class HabitatSuitabilityRequest(BaseModel):
    """Request model for habitat suitability index calculation"""
    parameters: List[HabitatParameter] = Field(..., min_items=1, description="List of habitat parameters")
    
    @validator('parameters')
    def validate_weights_sum(cls, v):
        total_weight = sum(param.weight for param in v)
        if not (0.8 <= total_weight <= 1.2):  # Allow some tolerance
            raise ValueError("Parameter weights should sum to approximately 1.0")
        return v

class HabitatSuitabilityResponse(BaseModel):
    """Response model for habitat suitability index"""
    habitat_suitability_index: float = Field(..., description="Overall HSI score (0-1)")
    suitability_class: str = Field(..., description="Qualitative suitability classification")
    parameter_contributions: Dict[str, float] = Field(..., description="Individual parameter contributions")
    recommendations: List[str] = Field(..., description="Management recommendations")

class SpeciesAreaRequest(BaseModel):
    """Request model for species-area relationship"""
    areas: List[float] = Field(..., min_items=2, description="List of habitat areas (hectares)")
    species_counts: List[int] = Field(..., min_items=2, description="Corresponding species counts")
    prediction_area: Optional[float] = Field(None, gt=0, description="Area for species prediction")
    
    @validator('species_counts')
    def validate_species_counts(cls, v, values):
        if 'areas' in values and len(v) != len(values['areas']):
            raise ValueError("Areas and species counts must have the same length")
        return v

class SpeciesAreaResponse(BaseModel):
    """Response model for species-area relationship"""
    z_value: float = Field(..., description="Species-area relationship exponent")
    c_value: float = Field(..., description="Species-area relationship constant")
    r_squared: float = Field(..., description="Coefficient of determination")
    equation: str = Field(..., description="Species-area equation")
    predicted_species: Optional[int] = Field(None, description="Predicted species count for given area")
    relationship_strength: str = Field(..., description="Strength of the relationship")

class FragmentationPatch(BaseModel):
    """Individual habitat patch for fragmentation analysis"""
    area: float = Field(..., gt=0, description="Patch area (hectares)")
    perimeter: float = Field(..., gt=0, description="Patch perimeter (meters)")

class FragmentationRequest(BaseModel):
    """Request model for fragmentation metrics"""
    patches: List[FragmentationPatch] = Field(..., min_items=1, description="List of habitat patches")
    total_landscape_area: float = Field(..., gt=0, description="Total landscape area (hectares)")

class FragmentationResponse(BaseModel):
    """Response model for fragmentation metrics"""
    number_of_patches: int = Field(..., description="Total number of patches")
    total_habitat_area: float = Field(..., description="Total habitat area (hectares)")
    habitat_proportion: float = Field(..., description="Proportion of landscape that is habitat")
    mean_patch_size: float = Field(..., description="Mean patch size (hectares)")
    patch_density: float = Field(..., description="Number of patches per 100 hectares")
    edge_density: float = Field(..., description="Total edge per hectare (m/ha)")
    mean_shape_index: float = Field(..., description="Mean patch shape index")
    fragmentation_index: float = Field(..., description="Overall fragmentation index (0-1)")
    fragmentation_class: str = Field(..., description="Fragmentation classification")

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Habitat and Landscape Analysis Service",
        "version": "1.0.0",
        "description": "Tools for habitat suitability, fragmentation metrics, and species-area relationships",
        "endpoints": [
            "/habitat-suitability",
            "/species-area-relationship", 
            "/fragmentation-metrics"
        ]
    }

@app.post("/habitat-suitability", response_model=HabitatSuitabilityResponse)
async def calculate_habitat_suitability(request: HabitatSuitabilityRequest):
    """
    Calculate Habitat Suitability Index (HSI) based on multiple habitat parameters.
    
    The HSI is calculated as a weighted average of individual parameter scores,
    providing an overall assessment of habitat quality for a species.
    """
    try:
        # Calculate weighted HSI
        total_weighted_score = sum(param.score * param.weight for param in request.parameters)
        total_weight = sum(param.weight for param in request.parameters)
        
        # Normalize by total weight (in case weights don't sum to exactly 1)
        hsi = total_weighted_score / total_weight if total_weight > 0 else 0
        
        # Classify suitability
        if hsi >= 0.8:
            suitability_class = "Excellent"
        elif hsi >= 0.6:
            suitability_class = "Good"
        elif hsi >= 0.4:
            suitability_class = "Fair"
        elif hsi >= 0.2:
            suitability_class = "Poor"
        else:
            suitability_class = "Unsuitable"
        
        # Calculate individual parameter contributions
        parameter_contributions = {
            param.name: (param.score * param.weight) / total_weight
            for param in request.parameters
        }
        
        # Generate recommendations
        recommendations = []
        
        # Find limiting factors (parameters with low scores)
        limiting_factors = [param for param in request.parameters if param.score < 0.4]
        if limiting_factors:
            recommendations.append(f"Address limiting factors: {', '.join([p.name for p in limiting_factors])}")
        
        # General recommendations based on HSI
        if hsi < 0.4:
            recommendations.append("Habitat restoration is critically needed")
            recommendations.append("Consider alternative sites or extensive management")
        elif hsi < 0.6:
            recommendations.append("Moderate habitat improvements recommended")
            recommendations.append("Focus on enhancing key habitat parameters")
        elif hsi < 0.8:
            recommendations.append("Minor habitat enhancements could improve suitability")
            recommendations.append("Monitor habitat conditions regularly")
        else:
            recommendations.append("Habitat is in excellent condition")
            recommendations.append("Maintain current management practices")
        
        return HabitatSuitabilityResponse(
            habitat_suitability_index=round(hsi, 3),
            suitability_class=suitability_class,
            parameter_contributions=parameter_contributions,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@app.post("/species-area-relationship", response_model=SpeciesAreaResponse)
async def calculate_species_area_relationship(request: SpeciesAreaRequest):
    """
    Calculate species-area relationship using the power law: S = c * A^z
    
    Where S is species count, A is area, c is a constant, and z is the scaling exponent.
    This relationship is fundamental in island biogeography and conservation planning.
    """
    try:
        areas = np.array(request.areas)
        species_counts = np.array(request.species_counts)
        
        # Remove zero or negative values
        valid_indices = (areas > 0) & (species_counts > 0)
        if np.sum(valid_indices) < 2:
            raise ValueError("Need at least 2 valid data points with positive areas and species counts")
        
        areas = areas[valid_indices]
        species_counts = species_counts[valid_indices]
        
        # Log-transform for linear regression: log(S) = log(c) + z * log(A)
        log_areas = np.log(areas)
        log_species = np.log(species_counts)
        
        # Calculate regression coefficients
        n = len(areas)
        sum_log_a = np.sum(log_areas)
        sum_log_s = np.sum(log_species)
        sum_log_a_squared = np.sum(log_areas ** 2)
        sum_log_a_log_s = np.sum(log_areas * log_species)
        
        # Calculate z (slope) and log(c) (intercept)
        z = (n * sum_log_a_log_s - sum_log_a * sum_log_s) / (n * sum_log_a_squared - sum_log_a ** 2)
        log_c = (sum_log_s - z * sum_log_a) / n
        c = np.exp(log_c)
        
        # Calculate R-squared
        predicted_log_species = log_c + z * log_areas
        ss_res = np.sum((log_species - predicted_log_species) ** 2)
        ss_tot = np.sum((log_species - np.mean(log_species)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Classify relationship strength
        if r_squared >= 0.8:
            relationship_strength = "Very Strong"
        elif r_squared >= 0.6:
            relationship_strength = "Strong"
        elif r_squared >= 0.4:
            relationship_strength = "Moderate"
        elif r_squared >= 0.2:
            relationship_strength = "Weak"
        else:
            relationship_strength = "Very Weak"
        
        # Create equation string
        equation = f"S = {c:.2f} × A^{z:.3f}"
        
        # Predict species count for given area if provided
        predicted_species = None
        if request.prediction_area is not None:
            predicted_species = int(round(c * (request.prediction_area ** z)))
        
        return SpeciesAreaResponse(
            z_value=round(z, 4),
            c_value=round(c, 4),
            r_squared=round(r_squared, 4),
            equation=equation,
            predicted_species=predicted_species,
            relationship_strength=relationship_strength
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

@app.post("/fragmentation-metrics", response_model=FragmentationResponse)
async def calculate_fragmentation_metrics(request: FragmentationRequest):
    """
    Calculate landscape fragmentation metrics for habitat patches.
    
    Provides comprehensive metrics including patch density, edge density,
    shape indices, and an overall fragmentation assessment.
    """
    try:
        patches = request.patches
        total_landscape_area = request.total_landscape_area
        
        # Basic metrics
        number_of_patches = len(patches)
        total_habitat_area = sum(patch.area for patch in patches)
        habitat_proportion = total_habitat_area / total_landscape_area
        
        # Patch size metrics
        patch_areas = [patch.area for patch in patches]
        mean_patch_size = np.mean(patch_areas)
        
        # Patch density (patches per 100 hectares)
        patch_density = (number_of_patches / total_landscape_area) * 100
        
        # Edge density and shape metrics
        total_perimeter = sum(patch.perimeter for patch in patches)
        edge_density = total_perimeter / total_landscape_area  # meters per hectare
        
        # Calculate shape index for each patch (perimeter-to-area ratio normalized by circle)
        shape_indices = []
        for patch in patches:
            # Shape index = perimeter / (2 * sqrt(π * area))
            # A circle has shape index = 1, more complex shapes have higher values
            if patch.area > 0:
                circle_perimeter = 2 * math.sqrt(math.pi * patch.area * 10000)  # Convert ha to m²
                shape_index = patch.perimeter / circle_perimeter
                shape_indices.append(shape_index)
        
        mean_shape_index = np.mean(shape_indices) if shape_indices else 1.0
        
        # Calculate overall fragmentation index (0 = not fragmented, 1 = highly fragmented)
        # Based on multiple factors: patch density, edge density, shape complexity, habitat proportion
        
        # Normalize components (higher values = more fragmentation)
        patch_density_norm = min(patch_density / 10, 1.0)  # Normalize to 0-1 (10 patches/100ha = high)
        edge_density_norm = min(edge_density / 1000, 1.0)  # Normalize to 0-1 (1000 m/ha = high)
        shape_complexity_norm = min((mean_shape_index - 1) / 2, 1.0)  # Normalize shape index
        habitat_loss_norm = 1 - habitat_proportion  # Low habitat proportion = high fragmentation
        
        # Weighted fragmentation index
        fragmentation_index = (
            0.3 * patch_density_norm +
            0.25 * edge_density_norm +
            0.2 * shape_complexity_norm +
            0.25 * habitat_loss_norm
        )
        
        # Classify fragmentation level
        if fragmentation_index <= 0.2:
            fragmentation_class = "Low Fragmentation"
        elif fragmentation_index <= 0.4:
            fragmentation_class = "Moderate Fragmentation"
        elif fragmentation_index <= 0.6:
            fragmentation_class = "High Fragmentation"
        elif fragmentation_index <= 0.8:
            fragmentation_class = "Very High Fragmentation"
        else:
            fragmentation_class = "Extreme Fragmentation"
        
        return FragmentationResponse(
            number_of_patches=number_of_patches,
            total_habitat_area=round(total_habitat_area, 2),
            habitat_proportion=round(habitat_proportion, 4),
            mean_patch_size=round(mean_patch_size, 2),
            patch_density=round(patch_density, 2),
            edge_density=round(edge_density, 2),
            mean_shape_index=round(mean_shape_index, 3),
            fragmentation_index=round(fragmentation_index, 3),
            fragmentation_class=fragmentation_class
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)