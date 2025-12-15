"""
Comprehensive test suite for the Climate Impact Assessment Service.

Tests cover all API endpoints, mathematical calculations, edge cases,
and error handling scenarios.
"""

import pytest
from fastapi.testclient import TestClient
from main import app
import math

client = TestClient(app)

class TestRootEndpoint:
    """Test the root endpoint"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns service information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Climate Impact Assessment Service"
        assert "endpoints" in data
        assert len(data["endpoints"]) == 4

class TestTemperatureTolerance:
    """Test temperature tolerance analysis"""
    
    def test_basic_temperature_tolerance(self):
        """Test basic temperature tolerance calculation"""
        request_data = {
            "current_temp_min": 10.0,
            "current_temp_max": 25.0,
            "optimal_temp_min": 15.0,
            "optimal_temp_max": 20.0,
            "critical_temp_min": 5.0,
            "critical_temp_max": 30.0,
            "projected_temp_change": 2.0
        }
        
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "current_suitability" in data
        assert "projected_suitability" in data
        assert "suitability_change" in data
        assert "risk_level" in data
        assert "current_status" in data
        assert "projected_status" in data
        assert "recommendations" in data
        
        # Current should have some overlap with optimal range
        assert 0 <= data["current_suitability"] <= 1
        assert 0 <= data["projected_suitability"] <= 1
        assert isinstance(data["recommendations"], list)
        assert len(data["recommendations"]) > 0
    
    def test_optimal_temperature_conditions(self):
        """Test when current conditions are optimal"""
        request_data = {
            "current_temp_min": 15.0,
            "current_temp_max": 20.0,
            "optimal_temp_min": 15.0,
            "optimal_temp_max": 20.0,
            "critical_temp_min": 10.0,
            "critical_temp_max": 25.0,
            "projected_temp_change": 0.0
        }
        
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["current_suitability"] == 1.0
        assert data["projected_suitability"] == 1.0
        assert data["suitability_change"] == 0.0
        assert data["current_status"] == "Optimal"
        assert data["projected_status"] == "Optimal"
        assert data["risk_level"] == "Low Risk"
    
    def test_critical_temperature_conditions(self):
        """Test when conditions are outside critical range"""
        request_data = {
            "current_temp_min": 35.0,
            "current_temp_max": 40.0,
            "optimal_temp_min": 15.0,
            "optimal_temp_max": 20.0,
            "critical_temp_min": 10.0,
            "critical_temp_max": 30.0,
            "projected_temp_change": 2.0
        }
        
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["current_suitability"] == 0.0
        assert data["projected_suitability"] == 0.0
        assert data["current_status"] == "Critical"
        assert data["projected_status"] == "Critical"
    
    def test_high_risk_temperature_change(self):
        """Test high risk scenario with large temperature change"""
        request_data = {
            "current_temp_min": 15.0,
            "current_temp_max": 20.0,
            "optimal_temp_min": 15.0,
            "optimal_temp_max": 20.0,
            "critical_temp_min": 10.0,
            "critical_temp_max": 25.0,
            "projected_temp_change": 8.0  # Large increase
        }
        
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["suitability_change"] < 0  # Should decrease
        assert "High Risk" in data["risk_level"] or "Very High Risk" in data["risk_level"]
        
        # Should include urgent recommendations
        recommendations_text = " ".join(data["recommendations"])
        assert "immediate" in recommendations_text.lower() or "urgent" in recommendations_text.lower()
    
    def test_temperature_validation_errors(self):
        """Test validation errors for temperature ranges"""
        # Current max <= current min
        request_data = {
            "current_temp_min": 25.0,
            "current_temp_max": 20.0,  # Invalid
            "optimal_temp_min": 15.0,
            "optimal_temp_max": 20.0,
            "critical_temp_min": 10.0,
            "critical_temp_max": 30.0,
            "projected_temp_change": 2.0
        }
        
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 422  # Validation error

class TestPhenologyShift:
    """Test phenology shift analysis"""
    
    def test_basic_phenology_shift(self):
        """Test basic phenology shift calculation"""
        request_data = {
            "historical_event_day": 120,  # Day 120 of year
            "temperature_sensitivity": 3.0,  # 3 days per °C
            "projected_temp_change": 2.0,  # 2°C increase
            "species_flexibility": 0.6,
            "dependent_species_events": [115, 125]
        }
        
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "projected_event_day" in data
        assert "shift_magnitude" in data
        assert "shift_direction" in data
        assert "mismatch_risk" in data
        assert "synchrony_analysis" in data
        assert "adaptation_potential" in data
        assert "recommendations" in data
        
        # Should shift later by 6 days (3 * 2)
        assert data["projected_event_day"] == 126
        assert data["shift_magnitude"] == 6.0
        assert data["shift_direction"] == "Later"
        assert data["adaptation_potential"] == "Moderate"
    
    def test_early_phenology_shift(self):
        """Test phenology shift to earlier timing"""
        request_data = {
            "historical_event_day": 150,
            "temperature_sensitivity": 4.0,
            "projected_temp_change": -1.5,  # Cooling
            "species_flexibility": 0.8
        }
        
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Should shift earlier by 6 days (4 * -1.5)
        assert data["projected_event_day"] == 144
        assert data["shift_direction"] == "Earlier"
        assert data["adaptation_potential"] == "High"
    
    def test_extreme_phenology_shift(self):
        """Test extreme phenology shift with high mismatch risk"""
        request_data = {
            "historical_event_day": 100,
            "temperature_sensitivity": 8.0,  # Very sensitive
            "projected_temp_change": 3.0,   # Large change
            "species_flexibility": 0.1      # Low flexibility
        }
        
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["shift_magnitude"] == 24.0  # 8 * 3
        assert data["mismatch_risk"] == "Very High"
        assert data["adaptation_potential"] == "Very Low"
        
        # Should include urgent recommendations
        recommendations_text = " ".join(data["recommendations"])
        assert "monitor" in recommendations_text.lower()
    
    def test_minimal_phenology_change(self):
        """Test minimal phenology change"""
        request_data = {
            "historical_event_day": 180,
            "temperature_sensitivity": 2.0,
            "projected_temp_change": 0.3,  # Small change
            "species_flexibility": 0.9
        }
        
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["shift_magnitude"] == 0.6  # 2 * 0.3
        assert data["shift_direction"] == "Minimal Change"
        assert data["mismatch_risk"] == "Low"
    
    def test_synchrony_analysis(self):
        """Test synchrony analysis with dependent species"""
        request_data = {
            "historical_event_day": 100,
            "temperature_sensitivity": 5.0,
            "projected_temp_change": 2.0,
            "species_flexibility": 0.5,
            "dependent_species_events": [95, 105, 110]
        }
        
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["synchrony_analysis"] is not None
        assert len(data["synchrony_analysis"]) == 3
        assert "species_1" in data["synchrony_analysis"]
        assert "species_2" in data["synchrony_analysis"]
        assert "species_3" in data["synchrony_analysis"]
    
    def test_phenology_validation_errors(self):
        """Test validation errors for phenology parameters"""
        # Invalid day of year
        request_data = {
            "historical_event_day": 400,  # Invalid
            "temperature_sensitivity": 3.0,
            "projected_temp_change": 2.0,
            "species_flexibility": 0.6
        }
        
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 422  # Validation error

class TestSeaLevelRise:
    """Test sea level rise impact analysis"""
    
    def test_basic_sea_level_rise(self):
        """Test basic sea level rise calculation"""
        request_data = {
            "habitat_elevation": 2.0,  # 2 meters above sea level
            "habitat_area": 100.0,     # 100 hectares
            "slope_gradient": 5.0,     # 5 degree slope
            "sea_level_rise_rate": 3.0, # 3 mm/year
            "time_horizon": 50,        # 50 years
            "migration_potential": 0.6
        }
        
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_sea_level_rise" in data
        assert "habitat_loss_percentage" in data
        assert "remaining_habitat_area" in data
        assert "inundation_timeline" in data
        assert "migration_feasibility" in data
        assert "urgency_level" in data
        assert "recommendations" in data
        
        # Total SLR should be 0.15m (3mm/year * 50 years)
        assert abs(data["total_sea_level_rise"] - 0.15) < 0.01
        assert 0 <= data["habitat_loss_percentage"] <= 100
        assert data["remaining_habitat_area"] <= request_data["habitat_area"]
    
    def test_complete_inundation(self):
        """Test scenario with complete habitat inundation"""
        request_data = {
            "habitat_elevation": 0.5,   # Low elevation
            "habitat_area": 50.0,
            "slope_gradient": 2.0,
            "sea_level_rise_rate": 10.0, # High SLR rate
            "time_horizon": 100,
            "migration_potential": 0.2   # Low migration potential
        }
        
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Should have complete or near-complete loss
        assert data["habitat_loss_percentage"] >= 90
        assert data["remaining_habitat_area"] <= 5.0
        assert "Critical" in data["urgency_level"]
        assert "Low" in data["migration_feasibility"]
    
    def test_minimal_sea_level_impact(self):
        """Test scenario with minimal sea level rise impact"""
        request_data = {
            "habitat_elevation": 10.0,  # High elevation
            "habitat_area": 200.0,
            "slope_gradient": 15.0,     # Steep slope
            "sea_level_rise_rate": 1.0, # Low SLR rate
            "time_horizon": 30,
            "migration_potential": 0.9  # High migration potential
        }
        
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["habitat_loss_percentage"] < 25
        assert data["remaining_habitat_area"] > 150.0
        assert "Low" in data["urgency_level"]
        assert "High" in data["migration_feasibility"]
    
    def test_inundation_timeline(self):
        """Test inundation timeline calculation"""
        request_data = {
            "habitat_elevation": 1.0,
            "habitat_area": 75.0,
            "slope_gradient": 3.0,
            "sea_level_rise_rate": 5.0,
            "time_horizon": 50,
            "migration_potential": 0.5
        }
        
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        timeline = data["inundation_timeline"]
        
        # Should have timeline entries
        assert "year_10" in timeline
        assert "year_25" in timeline
        assert "year_50" in timeline
        
        # Loss should increase over time
        if "year_10" in timeline and "year_25" in timeline:
            assert timeline["year_25"] >= timeline["year_10"]
    
    def test_flat_terrain_model(self):
        """Test sea level rise on flat terrain (slope = 0)"""
        request_data = {
            "habitat_elevation": 1.5,
            "habitat_area": 80.0,
            "slope_gradient": 0.0,  # Flat terrain
            "sea_level_rise_rate": 4.0,
            "time_horizon": 75,
            "migration_potential": 0.4
        }
        
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Should still calculate habitat loss for flat terrain
        assert 0 <= data["habitat_loss_percentage"] <= 100
        assert data["remaining_habitat_area"] >= 0

class TestClimateVelocity:
    """Test climate velocity analysis"""
    
    def test_basic_climate_velocity(self):
        """Test basic climate velocity calculation"""
        request_data = {
            "temperature_gradient": 0.5,    # 0.5°C per km
            "climate_change_rate": 2.0,     # 2°C per decade
            "species_dispersal_rate": 1.0,  # 1 km per year
            "habitat_fragmentation": 0.3,   # Moderate fragmentation
            "topographic_complexity": 0.6   # Moderate complexity
        }
        
        response = client.post("/climate-velocity", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "climate_velocity" in data
        assert "dispersal_deficit" in data
        assert "tracking_ability" in data
        assert "fragmentation_impact" in data
        assert "topographic_refugia" in data
        assert "migration_feasibility" in data
        assert "recommendations" in data
        
        # Climate velocity should be 0.4 km/year (2.0/10 / 0.5)
        assert abs(data["climate_velocity"] - 0.4) < 0.01
        # Dispersal deficit should be -0.6 (0.4 - 1.0)
        assert abs(data["dispersal_deficit"] - (-0.6)) < 0.01
        assert data["tracking_ability"] == "Excellent - Can exceed climate velocity"
    
    def test_high_climate_velocity(self):
        """Test scenario with high climate velocity"""
        request_data = {
            "temperature_gradient": 0.2,    # Shallow gradient
            "climate_change_rate": 4.0,     # Rapid change
            "species_dispersal_rate": 0.5,  # Slow dispersal
            "habitat_fragmentation": 0.8,   # High fragmentation
            "topographic_complexity": 0.2   # Low complexity
        }
        
        response = client.post("/climate-velocity", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Climate velocity should be 2.0 km/year (4.0/10 / 0.2)
        assert abs(data["climate_velocity"] - 2.0) < 0.01
        # Large dispersal deficit
        assert data["dispersal_deficit"] > 1.0
        assert "Poor" in data["tracking_ability"] or "Very Poor" in data["tracking_ability"]
        assert "High" in data["fragmentation_impact"]
        assert data["migration_feasibility"] == "Low"
    
    def test_excellent_tracking_conditions(self):
        """Test scenario with excellent tracking conditions"""
        request_data = {
            "temperature_gradient": 1.0,    # Steep gradient
            "climate_change_rate": 1.0,     # Slow change
            "species_dispersal_rate": 2.0,  # Fast dispersal
            "habitat_fragmentation": 0.1,   # Low fragmentation
            "topographic_complexity": 0.9   # High complexity
        }
        
        response = client.post("/climate-velocity", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Climate velocity should be 0.1 km/year (1.0/10 / 1.0)
        assert abs(data["climate_velocity"] - 0.1) < 0.01
        assert data["dispersal_deficit"] < 0  # Can exceed velocity
        assert "Excellent" in data["tracking_ability"]
        assert "Low" in data["fragmentation_impact"]
        assert "Abundant" in data["topographic_refugia"]
        assert data["migration_feasibility"] == "High"
    
    def test_moderate_tracking_scenario(self):
        """Test moderate tracking scenario"""
        request_data = {
            "temperature_gradient": 0.4,
            "climate_change_rate": 2.5,
            "species_dispersal_rate": 0.8,
            "habitat_fragmentation": 0.5,
            "topographic_complexity": 0.5
        }
        
        response = client.post("/climate-velocity", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # This scenario actually gets "High" because dispersal exceeds climate velocity
        assert data["migration_feasibility"] == "High"
        assert "Moderate" in data["fragmentation_impact"]
        assert "Moderate" in data["topographic_refugia"]
    
    def test_climate_velocity_recommendations(self):
        """Test climate velocity recommendations"""
        request_data = {
            "temperature_gradient": 0.3,
            "climate_change_rate": 3.0,
            "species_dispersal_rate": 0.4,
            "habitat_fragmentation": 0.7,
            "topographic_complexity": 0.3
        }
        
        response = client.post("/climate-velocity", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        recommendations_text = " ".join(data["recommendations"])
        
        # Should include connectivity recommendations due to high fragmentation
        assert "connectivity" in recommendations_text.lower() or "corridor" in recommendations_text.lower()
        
        # Should include monitoring recommendations
        assert "monitor" in recommendations_text.lower()

class TestEdgeCasesAndErrorHandling:
    """Test edge cases and error handling across all endpoints"""
    
    def test_malformed_json(self):
        """Test handling of malformed JSON requests"""
        response = client.post("/temperature-tolerance", data="invalid json")
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        # Missing required field
        response = client.post("/temperature-tolerance", json={"current_temp_min": 10})
        assert response.status_code == 422
        
        response = client.post("/phenology-shift", json={"historical_event_day": 100})
        assert response.status_code == 422
        
        response = client.post("/sea-level-rise", json={"habitat_elevation": 2.0})
        assert response.status_code == 422
        
        response = client.post("/climate-velocity", json={"temperature_gradient": 0.5})
        assert response.status_code == 422
    
    def test_boundary_values(self):
        """Test boundary values for various parameters"""
        # Test minimum day of year
        request_data = {
            "historical_event_day": 1,  # Minimum valid day
            "temperature_sensitivity": 1.0,
            "projected_temp_change": 1.0,
            "species_flexibility": 0.5
        }
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        # Test maximum day of year
        request_data["historical_event_day"] = 365  # Maximum valid day
        response = client.post("/phenology-shift", json=request_data)
        assert response.status_code == 200
        
        # Test zero slope gradient
        request_data = {
            "habitat_elevation": 1.0,
            "habitat_area": 50.0,
            "slope_gradient": 0.0,  # Minimum valid slope
            "sea_level_rise_rate": 2.0,
            "time_horizon": 50,
            "migration_potential": 0.5
        }
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
    
    def test_extreme_values(self):
        """Test handling of extreme but valid values"""
        # Very high temperature change
        request_data = {
            "current_temp_min": 0.0,
            "current_temp_max": 10.0,
            "optimal_temp_min": 5.0,
            "optimal_temp_max": 15.0,
            "critical_temp_min": -10.0,
            "critical_temp_max": 25.0,
            "projected_temp_change": 15.0  # Extreme change
        }
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200
        
        # Very high sea level rise rate
        request_data = {
            "habitat_elevation": 5.0,
            "habitat_area": 100.0,
            "slope_gradient": 10.0,
            "sea_level_rise_rate": 50.0,  # Extreme rate
            "time_horizon": 100,
            "migration_potential": 0.1
        }
        response = client.post("/sea-level-rise", json=request_data)
        assert response.status_code == 200
    
    def test_zero_and_negative_values(self):
        """Test handling of zero and negative values where appropriate"""
        # Zero temperature change
        request_data = {
            "current_temp_min": 15.0,
            "current_temp_max": 20.0,
            "optimal_temp_min": 15.0,
            "optimal_temp_max": 20.0,
            "critical_temp_min": 10.0,
            "critical_temp_max": 25.0,
            "projected_temp_change": 0.0  # No change
        }
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200
        
        # Negative temperature change (cooling)
        request_data["projected_temp_change"] = -2.0
        response = client.post("/temperature-tolerance", json=request_data)
        assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=main", "--cov-report=html", "--cov-report=term"])