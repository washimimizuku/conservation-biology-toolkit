from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from typing import List, Optional

app = FastAPI(
    title="Population Analysis API",
    description="Population viability analysis and demographic tools",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PopulationGrowthInput(BaseModel):
    initial_population: int
    growth_rate: float
    years: int
    carrying_capacity: Optional[int] = None

class PopulationGrowthOutput(BaseModel):
    years: List[int]
    population: List[float]
    growth_rate: float
    carrying_capacity: Optional[int]

class EffectivePopulationInput(BaseModel):
    breeding_males: int
    breeding_females: int

class EffectivePopulationOutput(BaseModel):
    effective_population_size: float
    breeding_males: int
    breeding_females: int

@app.get("/")
async def root():
    return {"message": "Population Analysis API", "version": "0.1.0"}

@app.post("/population-growth", response_model=PopulationGrowthOutput)
async def calculate_population_growth(data: PopulationGrowthInput):
    """Calculate population growth over time using exponential or logistic model."""
    years = list(range(data.years + 1))
    population = []
    
    for year in years:
        if data.carrying_capacity:
            # Logistic growth model
            pop = (data.carrying_capacity * data.initial_population * 
                   np.exp(data.growth_rate * year)) / (
                   data.carrying_capacity + data.initial_population * 
                   (np.exp(data.growth_rate * year) - 1))
        else:
            # Exponential growth model
            pop = data.initial_population * np.exp(data.growth_rate * year)
        
        population.append(float(pop))
    
    return PopulationGrowthOutput(
        years=years,
        population=population,
        growth_rate=data.growth_rate,
        carrying_capacity=data.carrying_capacity
    )

@app.post("/effective-population-size", response_model=EffectivePopulationOutput)
async def calculate_effective_population_size(data: EffectivePopulationInput):
    """Calculate effective population size using the harmonic mean formula."""
    # Ne = 4 * Nm * Nf / (Nm + Nf)
    effective_size = (4 * data.breeding_males * data.breeding_females) / (
        data.breeding_males + data.breeding_females
    )
    
    return EffectivePopulationOutput(
        effective_population_size=effective_size,
        breeding_males=data.breeding_males,
        breeding_females=data.breeding_females
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)