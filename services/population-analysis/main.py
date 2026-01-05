from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import random
from typing import List, Optional

app = FastAPI(
    title="Population Analysis API",
    description="Population viability analysis and demographic tools",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development frontend
        "https://conservationbiologytools.org",  # Production frontend
        "https://www.conservationbiologytools.org",  # Production frontend with www
        "https://conservation-api.xfn4ddjmwg9tr.us-east-1.cs.amazonlightsail.com",  # Direct Lightsail URL
        "https://api.conservationbiologytools.org"  # Custom domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

class PVAInput(BaseModel):
    initial_population: int
    growth_rate: float
    environmental_variance: float
    carrying_capacity: int
    years: int
    simulations: int = 1000

class PVAOutput(BaseModel):
    extinction_probability: float
    mean_final_population: float
    population_trajectories: List[List[float]]
    years_to_extinction: List[Optional[int]]
    quasi_extinction_probability: float
    quasi_extinction_threshold: int = 50

class MetapopulationInput(BaseModel):
    patch_populations: List[int]
    patch_capacities: List[int]
    growth_rates: List[float]
    migration_matrix: List[List[float]]
    years: int

class MetapopulationOutput(BaseModel):
    years: List[int]
    patch_populations: List[List[float]]
    total_population: List[float]
    extinction_risk: List[float]

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

@app.post("/population-viability-analysis", response_model=PVAOutput)
async def population_viability_analysis(data: PVAInput):
    """Perform Population Viability Analysis using stochastic population models."""
    import random
    
    trajectories = []
    extinction_times = []
    final_populations = []
    quasi_extinctions = 0
    quasi_threshold = 50
    
    for sim in range(data.simulations):
        population = [float(data.initial_population)]
        extinct = False
        extinction_time = None
        
        for year in range(1, data.years + 1):
            if population[-1] <= 0:
                population.append(0.0)
                if not extinct:
                    extinct = True
                    extinction_time = year - 1
                continue
            
            # Environmental stochasticity
            random_growth = np.random.normal(data.growth_rate, data.environmental_variance)
            
            # Logistic growth with stochasticity
            current_pop = population[-1]
            growth_factor = np.exp(random_growth * (1 - current_pop / data.carrying_capacity))
            new_pop = current_pop * growth_factor
            
            # Demographic stochasticity for small populations
            if new_pop < 100:
                new_pop = max(0, np.random.poisson(new_pop))
            
            population.append(float(new_pop))
            
            if new_pop <= 0 and not extinct:
                extinct = True
                extinction_time = year
        
        trajectories.append(population)
        extinction_times.append(extinction_time)
        final_populations.append(population[-1])
        
        if min(population) <= quasi_threshold:
            quasi_extinctions += 1
    
    extinction_probability = sum(1 for t in extinction_times if t is not None) / data.simulations
    quasi_extinction_prob = quasi_extinctions / data.simulations
    mean_final_pop = np.mean([p for p in final_populations if p > 0]) if any(p > 0 for p in final_populations) else 0
    
    return PVAOutput(
        extinction_probability=extinction_probability,
        mean_final_population=mean_final_pop,
        population_trajectories=trajectories[:10],  # Return first 10 for visualization
        years_to_extinction=extinction_times[:10],
        quasi_extinction_probability=quasi_extinction_prob,
        quasi_extinction_threshold=quasi_threshold
    )

@app.post("/metapopulation-dynamics", response_model=MetapopulationOutput)
async def metapopulation_dynamics(data: MetapopulationInput):
    """Simulate metapopulation dynamics across connected habitat patches."""
    n_patches = len(data.patch_populations)
    years = list(range(data.years + 1))
    
    # Initialize population matrix
    populations = np.zeros((data.years + 1, n_patches))
    populations[0] = data.patch_populations
    
    total_pops = []
    extinction_risks = []
    
    for year in range(data.years):
        current_pops = populations[year].copy()
        
        # Growth within patches
        for patch in range(n_patches):
            if current_pops[patch] > 0:
                # Logistic growth
                growth_rate = data.growth_rates[patch]
                carrying_capacity = data.patch_capacities[patch]
                growth_factor = np.exp(growth_rate * (1 - current_pops[patch] / carrying_capacity))
                current_pops[patch] *= growth_factor
        
        # Migration between patches
        new_pops = current_pops.copy()
        for from_patch in range(n_patches):
            for to_patch in range(n_patches):
                if from_patch != to_patch:
                    migration_rate = data.migration_matrix[from_patch][to_patch]
                    migrants = current_pops[from_patch] * migration_rate
                    new_pops[from_patch] -= migrants
                    new_pops[to_patch] += migrants
        
        # Ensure no negative populations
        new_pops = np.maximum(new_pops, 0)
        populations[year + 1] = new_pops
        
        # Calculate metrics
        total_pop = np.sum(new_pops)
        extinct_patches = np.sum(new_pops < 1)
        extinction_risk = extinct_patches / n_patches
        
        total_pops.append(float(total_pop))
        extinction_risks.append(float(extinction_risk))
    
    # Add initial values
    total_pops.insert(0, float(np.sum(data.patch_populations)))
    extinction_risks.insert(0, 0.0)
    
    return MetapopulationOutput(
        years=years,
        patch_populations=populations.tolist(),
        total_population=total_pops,
        extinction_risk=extinction_risks
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)