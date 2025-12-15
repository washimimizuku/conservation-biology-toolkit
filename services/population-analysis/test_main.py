import pytest
import numpy as np
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestPopulationGrowth:
    """Test population growth calculations."""
    
    def test_exponential_growth_basic(self):
        """Test basic exponential growth calculation."""
        response = client.post("/population-growth", json={
            "initial_population": 100,
            "growth_rate": 0.05,
            "years": 10
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "years" in data
        assert "population" in data
        assert "growth_rate" in data
        assert data["carrying_capacity"] is None
        
        # Check values
        assert len(data["years"]) == 11  # 0 to 10 years
        assert len(data["population"]) == 11
        assert data["growth_rate"] == 0.05
        
        # Check exponential growth formula: P(t) = P0 * e^(rt)
        expected_final = 100 * np.exp(0.05 * 10)
        assert abs(data["population"][-1] - expected_final) < 0.01
    
    def test_logistic_growth_basic(self):
        """Test basic logistic growth calculation."""
        response = client.post("/population-growth", json={
            "initial_population": 50,
            "growth_rate": 0.1,
            "years": 20,
            "carrying_capacity": 200
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert data["carrying_capacity"] == 200
        assert len(data["population"]) == 21  # 0 to 20 years
        
        # Final population should approach but not exceed carrying capacity
        assert data["population"][-1] < 200
        assert data["population"][-1] > data["population"][0]  # Should grow
    
    def test_zero_growth_rate(self):
        """Test population with zero growth rate."""
        response = client.post("/population-growth", json={
            "initial_population": 100,
            "growth_rate": 0.0,
            "years": 5
        })
        assert response.status_code == 200
        data = response.json()
        
        # Population should remain constant
        for pop in data["population"]:
            assert abs(pop - 100) < 0.01
    
    def test_negative_growth_rate(self):
        """Test population decline."""
        response = client.post("/population-growth", json={
            "initial_population": 100,
            "growth_rate": -0.05,
            "years": 10
        })
        assert response.status_code == 200
        data = response.json()
        
        # Population should decline
        assert data["population"][-1] < data["population"][0]
        
        # Check exponential decay formula
        expected_final = 100 * np.exp(-0.05 * 10)
        assert abs(data["population"][-1] - expected_final) < 0.01
    
    def test_edge_cases(self):
        """Test edge cases that should still work."""
        # Very small initial population
        response = client.post("/population-growth", json={
            "initial_population": 1,
            "growth_rate": 0.05,
            "years": 5
        })
        assert response.status_code == 200
        
        # Very large carrying capacity
        response = client.post("/population-growth", json={
            "initial_population": 100,
            "growth_rate": 0.05,
            "years": 5,
            "carrying_capacity": 10000
        })
        assert response.status_code == 200


class TestEffectivePopulationSize:
    """Test effective population size calculations."""
    
    def test_equal_sex_ratio(self):
        """Test Ne calculation with equal numbers of males and females."""
        response = client.post("/effective-population-size", json={
            "breeding_males": 25,
            "breeding_females": 25
        })
        assert response.status_code == 200
        data = response.json()
        
        # Ne = 4 * Nm * Nf / (Nm + Nf) = 4 * 25 * 25 / 50 = 50
        expected_ne = 4 * 25 * 25 / (25 + 25)
        assert abs(data["effective_population_size"] - expected_ne) < 0.01
        assert data["breeding_males"] == 25
        assert data["breeding_females"] == 25
    
    def test_unequal_sex_ratio(self):
        """Test Ne calculation with unequal sex ratios."""
        response = client.post("/effective-population-size", json={
            "breeding_males": 10,
            "breeding_females": 40
        })
        assert response.status_code == 200
        data = response.json()
        
        # Ne = 4 * 10 * 40 / (10 + 40) = 1600 / 50 = 32
        expected_ne = 4 * 10 * 40 / (10 + 40)
        assert abs(data["effective_population_size"] - expected_ne) < 0.01
    
    def test_extreme_sex_ratio(self):
        """Test Ne with very skewed sex ratio."""
        response = client.post("/effective-population-size", json={
            "breeding_males": 1,
            "breeding_females": 100
        })
        assert response.status_code == 200
        data = response.json()
        
        # Ne should be limited by the smaller sex
        expected_ne = 4 * 1 * 100 / (1 + 100)
        assert abs(data["effective_population_size"] - expected_ne) < 0.01
        assert data["effective_population_size"] < 4  # Should be very small
    
    def test_single_individual(self):
        """Test edge case with single individuals."""
        response = client.post("/effective-population-size", json={
            "breeding_males": 1,
            "breeding_females": 1
        })
        assert response.status_code == 200
        data = response.json()
        
        expected_ne = 4 * 1 * 1 / (1 + 1)
        assert abs(data["effective_population_size"] - expected_ne) < 0.01
    
    def test_edge_cases(self):
        """Test edge cases for effective population size."""
        # Very large populations
        response = client.post("/effective-population-size", json={
            "breeding_males": 1000,
            "breeding_females": 1000
        })
        assert response.status_code == 200
        data = response.json()
        assert data["effective_population_size"] == 2000  # Should equal total when equal
        
        # Small but valid populations
        response = client.post("/effective-population-size", json={
            "breeding_males": 2,
            "breeding_females": 3
        })
        assert response.status_code == 200


class TestPopulationViabilityAnalysis:
    """Test Population Viability Analysis calculations."""
    
    def test_pva_basic(self):
        """Test basic PVA functionality."""
        response = client.post("/population-viability-analysis", json={
            "initial_population": 50,
            "growth_rate": 0.05,
            "environmental_variance": 0.1,
            "carrying_capacity": 200,
            "years": 20,
            "simulations": 100  # Reduced for faster testing
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "extinction_probability" in data
        assert "mean_final_population" in data
        assert "population_trajectories" in data
        assert "years_to_extinction" in data
        assert "quasi_extinction_probability" in data
        
        # Check ranges
        assert 0 <= data["extinction_probability"] <= 1
        assert 0 <= data["quasi_extinction_probability"] <= 1
        assert data["mean_final_population"] >= 0
        
        # Should return some trajectories
        assert len(data["population_trajectories"]) <= 10  # Limited to 10 for visualization
        assert len(data["years_to_extinction"]) <= 10
    
    def test_pva_high_growth(self):
        """Test PVA with high growth rate (low extinction risk)."""
        response = client.post("/population-viability-analysis", json={
            "initial_population": 100,
            "growth_rate": 0.1,  # High growth
            "environmental_variance": 0.05,  # Low variance
            "carrying_capacity": 500,
            "years": 20,
            "simulations": 50
        })
        assert response.status_code == 200
        data = response.json()
        
        # With high growth and low variance, extinction probability should be low
        assert data["extinction_probability"] < 0.5
    
    def test_pva_negative_growth(self):
        """Test PVA with negative growth rate (high extinction risk)."""
        response = client.post("/population-viability-analysis", json={
            "initial_population": 20,
            "growth_rate": -0.05,  # Negative growth
            "environmental_variance": 0.2,
            "carrying_capacity": 100,
            "years": 50,
            "simulations": 50
        })
        assert response.status_code == 200
        data = response.json()
        
        # With negative growth, extinction probability should be high
        assert data["extinction_probability"] > 0.1
    
    def test_pva_small_population(self):
        """Test PVA with very small initial population."""
        response = client.post("/population-viability-analysis", json={
            "initial_population": 5,
            "growth_rate": 0.02,
            "environmental_variance": 0.3,  # High variance
            "carrying_capacity": 50,
            "years": 30,
            "simulations": 50
        })
        assert response.status_code == 200
        data = response.json()
        
        # Small populations should have higher extinction risk
        assert data["extinction_probability"] >= 0
        assert data["quasi_extinction_probability"] >= 0


class TestMetapopulationDynamics:
    """Test metapopulation dynamics calculations."""
    
    def test_metapopulation_basic(self):
        """Test basic metapopulation simulation."""
        response = client.post("/metapopulation-dynamics", json={
            "patch_populations": [100, 80, 60],
            "patch_capacities": [200, 150, 120],
            "growth_rates": [0.1, 0.08, 0.12],
            "migration_matrix": [
                [0, 0.05, 0.02],
                [0.05, 0, 0.03],
                [0.02, 0.03, 0]
            ],
            "years": 10
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "years" in data
        assert "patch_populations" in data
        assert "total_population" in data
        assert "extinction_risk" in data
        
        # Check dimensions
        assert len(data["years"]) == 11  # 0 to 10 years
        assert len(data["patch_populations"]) == 11
        assert len(data["total_population"]) == 11
        assert len(data["extinction_risk"]) == 11
        
        # Each time step should have 3 patches
        for patch_pops in data["patch_populations"]:
            assert len(patch_pops) == 3
        
        # Initial total population should be sum of initial patches
        initial_total = sum([100, 80, 60])
        assert abs(data["total_population"][0] - initial_total) < 0.01
    
    def test_metapopulation_no_migration(self):
        """Test metapopulation with no migration."""
        response = client.post("/metapopulation-dynamics", json={
            "patch_populations": [50, 50],
            "patch_capacities": [100, 100],
            "growth_rates": [0.1, 0.1],
            "migration_matrix": [
                [0, 0],
                [0, 0]
            ],
            "years": 5
        })
        assert response.status_code == 200
        data = response.json()
        
        # With identical conditions and no migration, 
        # patches should grow similarly
        final_patch_pops = data["patch_populations"][-1]
        assert abs(final_patch_pops[0] - final_patch_pops[1]) < 1.0
    
    def test_metapopulation_single_patch(self):
        """Test metapopulation with single patch."""
        response = client.post("/metapopulation-dynamics", json={
            "patch_populations": [100],
            "patch_capacities": [200],
            "growth_rates": [0.05],
            "migration_matrix": [[0]],
            "years": 10
        })
        assert response.status_code == 200
        data = response.json()
        
        # Should work with single patch
        assert len(data["patch_populations"][0]) == 1
        assert data["total_population"][0] == 100
    
    def test_metapopulation_edge_cases(self):
        """Test edge cases for metapopulation dynamics."""
        # Large number of patches
        n_patches = 5
        response = client.post("/metapopulation-dynamics", json={
            "patch_populations": [50] * n_patches,
            "patch_capacities": [100] * n_patches,
            "growth_rates": [0.05] * n_patches,
            "migration_matrix": [[0.01 if i != j else 0 for j in range(n_patches)] for i in range(n_patches)],
            "years": 5
        })
        assert response.status_code == 200
        
        # Very short simulation
        response = client.post("/metapopulation-dynamics", json={
            "patch_populations": [100],
            "patch_capacities": [200],
            "growth_rates": [0.05],
            "migration_matrix": [[0]],
            "years": 1
        })
        assert response.status_code == 200


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self):
        """Test health check returns success."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestRootEndpoint:
    """Test root endpoint."""
    
    def test_root(self):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["message"] == "Population Analysis API"


# Mathematical validation tests
class TestMathematicalAccuracy:
    """Test mathematical accuracy of calculations."""
    
    def test_exponential_growth_formula(self):
        """Verify exponential growth follows P(t) = P0 * e^(rt)."""
        initial_pop = 100
        growth_rate = 0.03
        years = 15
        
        response = client.post("/population-growth", json={
            "initial_population": initial_pop,
            "growth_rate": growth_rate,
            "years": years
        })
        
        data = response.json()
        
        # Check each time point
        for i, (year, pop) in enumerate(zip(data["years"], data["population"])):
            expected = initial_pop * np.exp(growth_rate * year)
            assert abs(pop - expected) < 0.01, f"Year {year}: expected {expected}, got {pop}"
    
    def test_logistic_growth_properties(self):
        """Verify logistic growth properties."""
        response = client.post("/population-growth", json={
            "initial_population": 10,
            "growth_rate": 0.1,
            "years": 50,
            "carrying_capacity": 100
        })
        
        data = response.json()
        populations = data["population"]
        
        # Population should be monotonically increasing
        for i in range(1, len(populations)):
            assert populations[i] >= populations[i-1], "Population should not decrease"
        
        # Should approach but not exceed carrying capacity
        assert populations[-1] < 100
        assert populations[-1] > 90  # Should be close to K for long time
    
    def test_effective_population_harmonic_mean(self):
        """Verify Ne calculation uses harmonic mean formula."""
        test_cases = [
            (10, 10, 20.0),  # Equal: Ne = 2 * (10 + 10) / 2 = 20
            (5, 20, 16.0),   # Unequal: Ne = 4 * 5 * 20 / (5 + 20) = 16
            (1, 99, 3.96),   # Extreme: Ne = 4 * 1 * 99 / (1 + 99) ≈ 3.96
        ]
        
        for males, females, expected_ne in test_cases:
            response = client.post("/effective-population-size", json={
                "breeding_males": males,
                "breeding_females": females
            })
            
            data = response.json()
            assert abs(data["effective_population_size"] - expected_ne) < 0.01


if __name__ == "__main__":
    pytest.main([__file__])