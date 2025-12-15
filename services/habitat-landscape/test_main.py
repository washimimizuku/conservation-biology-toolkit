"""
Comprehensive test suite for the Habitat and Landscape Analysis Service.

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
        assert data["service"] == "Habitat and Landscape Analysis Service"
        assert "endpoints" in data
        assert len(data["endpoints"]) == 3

class TestHabitatSuitability:
    """Test habitat suitability index calculations"""
    
    def test_basic_habitat_suitability(self):
        """Test basic HSI calculation with valid parameters"""
        request_data = {
            "parameters": [
                {"name": "Food Availability", "score": 0.8, "weight": 0.3},
                {"name": "Water Access", "score": 0.9, "weight": 0.2},
                {"name": "Cover Quality", "score": 0.7, "weight": 0.3},
                {"name": "Nesting Sites", "score": 0.6, "weight": 0.2}
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "habitat_suitability_index" in data
        assert "suitability_class" in data
        assert "parameter_contributions" in data
        assert "recommendations" in data
        
        # Verify HSI calculation: (0.8*0.3 + 0.9*0.2 + 0.7*0.3 + 0.6*0.2) = 0.75
        expected_hsi = 0.75
        assert abs(data["habitat_suitability_index"] - expected_hsi) < 0.01
        assert data["suitability_class"] == "Good"
    
    def test_excellent_habitat_suitability(self):
        """Test HSI calculation resulting in excellent classification"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 0.9, "weight": 0.5},
                {"name": "Water", "score": 0.8, "weight": 0.5}
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["habitat_suitability_index"] == 0.85
        assert data["suitability_class"] == "Excellent"
    
    def test_poor_habitat_suitability(self):
        """Test HSI calculation resulting in poor classification"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 0.2, "weight": 0.6},
                {"name": "Water", "score": 0.3, "weight": 0.4}
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        expected_hsi = 0.2 * 0.6 + 0.3 * 0.4  # 0.24
        assert abs(data["habitat_suitability_index"] - expected_hsi) < 0.01
        assert data["suitability_class"] == "Poor"
    
    def test_unsuitable_habitat(self):
        """Test HSI calculation resulting in unsuitable classification"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 0.1, "weight": 0.7},
                {"name": "Water", "score": 0.05, "weight": 0.3}
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["suitability_class"] == "Unsuitable"
    
    def test_parameter_contributions(self):
        """Test that parameter contributions are calculated correctly"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 0.8, "weight": 0.6},
                {"name": "Water", "score": 0.4, "weight": 0.4}
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        contributions = data["parameter_contributions"]
        
        # Food contribution: (0.8 * 0.6) / 1.0 = 0.48
        # Water contribution: (0.4 * 0.4) / 1.0 = 0.16
        assert abs(contributions["Food"] - 0.48) < 0.01
        assert abs(contributions["Water"] - 0.16) < 0.01
    
    def test_recommendations_for_limiting_factors(self):
        """Test that recommendations identify limiting factors"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 0.9, "weight": 0.5},
                {"name": "Water", "score": 0.2, "weight": 0.5}  # Limiting factor
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        recommendations = data["recommendations"]
        
        # Should identify Water as a limiting factor
        limiting_factor_mentioned = any("Water" in rec for rec in recommendations)
        assert limiting_factor_mentioned
    
    def test_invalid_weights_sum(self):
        """Test validation error when weights don't sum to ~1.0"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 0.8, "weight": 0.3},
                {"name": "Water", "score": 0.6, "weight": 0.3}  # Total weight = 0.6
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_invalid_score_range(self):
        """Test validation error for scores outside 0-1 range"""
        request_data = {
            "parameters": [
                {"name": "Food", "score": 1.5, "weight": 0.5},  # Invalid score
                {"name": "Water", "score": 0.6, "weight": 0.5}
            ]
        }
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_empty_parameters_list(self):
        """Test validation error for empty parameters list"""
        request_data = {"parameters": []}
        
        response = client.post("/habitat-suitability", json=request_data)
        assert response.status_code == 422  # Validation error

class TestSpeciesAreaRelationship:
    """Test species-area relationship calculations"""
    
    def test_basic_species_area_calculation(self):
        """Test basic species-area relationship calculation"""
        request_data = {
            "areas": [1, 10, 100, 1000],
            "species_counts": [5, 15, 35, 80],
            "prediction_area": 500
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "z_value" in data
        assert "c_value" in data
        assert "r_squared" in data
        assert "equation" in data
        assert "predicted_species" in data
        assert "relationship_strength" in data
        
        # Z value should be positive for typical species-area relationships
        assert data["z_value"] > 0
        assert data["c_value"] > 0
        assert 0 <= data["r_squared"] <= 1
        assert data["predicted_species"] > 0
    
    def test_perfect_species_area_relationship(self):
        """Test species-area calculation with perfect power law relationship"""
        # S = 2 * A^0.25
        areas = [1, 4, 16, 64, 256]
        species_counts = [2, 4, 8, 16, 32]
        
        request_data = {
            "areas": areas,
            "species_counts": species_counts
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Should have very high R-squared for perfect relationship
        assert data["r_squared"] > 0.99
        assert data["relationship_strength"] == "Very Strong"
        
        # Z value should be close to 0.5 (since S = 2 * A^0.5 for this data)
        assert abs(data["z_value"] - 0.5) < 0.01
        
        # C value should be close to 2
        assert abs(data["c_value"] - 2.0) < 0.1
    
    def test_species_prediction(self):
        """Test species count prediction for given area"""
        request_data = {
            "areas": [10, 100, 1000],
            "species_counts": [10, 30, 80],
            "prediction_area": 500
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["predicted_species"] is not None
        assert isinstance(data["predicted_species"], int)
        assert data["predicted_species"] > 0
    
    def test_no_prediction_area(self):
        """Test calculation without prediction area"""
        request_data = {
            "areas": [1, 10, 100],
            "species_counts": [5, 15, 35]
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["predicted_species"] is None
    
    def test_weak_relationship(self):
        """Test identification of weak species-area relationship"""
        # Random-ish data with weak relationship
        request_data = {
            "areas": [1, 10, 100, 1000],
            "species_counts": [20, 15, 25, 22]  # No clear pattern
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["r_squared"] < 0.5
        assert data["relationship_strength"] in ["Very Weak", "Weak"]
    
    def test_mismatched_array_lengths(self):
        """Test validation error for mismatched array lengths"""
        request_data = {
            "areas": [1, 10, 100],
            "species_counts": [5, 15]  # Different length
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_insufficient_data_points(self):
        """Test error handling for insufficient data points"""
        request_data = {
            "areas": [10],
            "species_counts": [5]
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_zero_values_handling(self):
        """Test handling of zero values in data"""
        request_data = {
            "areas": [0, 10, 100],  # Zero area
            "species_counts": [0, 15, 35]
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200  # Should handle by filtering out zeros
        
        data = response.json()
        assert data["z_value"] is not None
        assert data["c_value"] is not None
    
    def test_negative_prediction_area(self):
        """Test validation error for negative prediction area"""
        request_data = {
            "areas": [1, 10, 100],
            "species_counts": [5, 15, 35],
            "prediction_area": -50  # Invalid
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 422  # Validation error

class TestFragmentationMetrics:
    """Test fragmentation metrics calculations"""
    
    def test_basic_fragmentation_metrics(self):
        """Test basic fragmentation metrics calculation"""
        request_data = {
            "patches": [
                {"area": 10.0, "perimeter": 1200},
                {"area": 5.0, "perimeter": 900},
                {"area": 15.0, "perimeter": 1500}
            ],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["number_of_patches"] == 3
        assert data["total_habitat_area"] == 30.0
        assert data["habitat_proportion"] == 0.3
        assert data["mean_patch_size"] == 10.0
        assert data["patch_density"] == 3.0  # 3 patches per 100 ha
        
        # Edge density should be total perimeter / landscape area
        expected_edge_density = (1200 + 900 + 1500) / 100.0
        assert abs(data["edge_density"] - expected_edge_density) < 0.01
        
        assert "mean_shape_index" in data
        assert "fragmentation_index" in data
        assert "fragmentation_class" in data
    
    def test_single_patch(self):
        """Test fragmentation metrics with single large patch"""
        request_data = {
            "patches": [
                {"area": 80.0, "perimeter": 3600}  # Large, relatively compact patch
            ],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["number_of_patches"] == 1
        assert data["total_habitat_area"] == 80.0
        assert data["habitat_proportion"] == 0.8
        assert data["mean_patch_size"] == 80.0
        assert data["patch_density"] == 1.0
        
        # Should have low fragmentation
        assert data["fragmentation_index"] < 0.5
        assert "Low" in data["fragmentation_class"] or "Moderate" in data["fragmentation_class"]
    
    def test_highly_fragmented_landscape(self):
        """Test fragmentation metrics with many small patches"""
        # Create many small patches
        patches = [{"area": 0.5, "perimeter": 300} for _ in range(20)]
        
        request_data = {
            "patches": patches,
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["number_of_patches"] == 20
        assert data["total_habitat_area"] == 10.0  # 20 * 0.5
        assert data["habitat_proportion"] == 0.1
        assert data["mean_patch_size"] == 0.5
        assert data["patch_density"] == 20.0
        
        # Should have high fragmentation
        assert data["fragmentation_index"] > 0.5
        assert "High" in data["fragmentation_class"] or "Very High" in data["fragmentation_class"] or "Extreme" in data["fragmentation_class"]
    
    def test_shape_index_calculation(self):
        """Test shape index calculation for different patch shapes"""
        # Circular patch: area = π*r², perimeter = 2*π*r
        # For 1 hectare circle: r = sqrt(10000/π) ≈ 56.4m, perimeter ≈ 354m
        circular_patch = {"area": 1.0, "perimeter": 354}
        
        # Elongated patch with same area but longer perimeter
        elongated_patch = {"area": 1.0, "perimeter": 800}
        
        request_data = {
            "patches": [circular_patch, elongated_patch],
            "total_landscape_area": 10.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Mean shape index should be > 1 due to elongated patch
        assert data["mean_shape_index"] > 1.0
    
    def test_fragmentation_classification_boundaries(self):
        """Test fragmentation classification at different levels"""
        # Test low fragmentation (single large patch)
        request_data_low = {
            "patches": [{"area": 90.0, "perimeter": 3800}],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data_low)
        assert response.status_code == 200
        data = response.json()
        assert data["fragmentation_index"] <= 0.4
    
    def test_zero_area_patch_handling(self):
        """Test error handling for zero area patches"""
        request_data = {
            "patches": [
                {"area": 0.0, "perimeter": 100},  # Invalid
                {"area": 10.0, "perimeter": 1200}
            ],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_negative_values_handling(self):
        """Test validation for negative values"""
        request_data = {
            "patches": [
                {"area": -5.0, "perimeter": 1200}  # Invalid
            ],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_empty_patches_list(self):
        """Test validation error for empty patches list"""
        request_data = {
            "patches": [],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_patches_larger_than_landscape(self):
        """Test handling when total patch area exceeds landscape area"""
        request_data = {
            "patches": [
                {"area": 60.0, "perimeter": 3000},
                {"area": 50.0, "perimeter": 2800}  # Total = 110 > 100
            ],
            "total_landscape_area": 100.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 200  # Should still calculate metrics
        
        data = response.json()
        assert data["habitat_proportion"] > 1.0  # Will be > 1 in this case

class TestEdgeCasesAndErrorHandling:
    """Test edge cases and error handling across all endpoints"""
    
    def test_malformed_json(self):
        """Test handling of malformed JSON requests"""
        response = client.post("/habitat-suitability", data="invalid json")
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        # Missing 'parameters' field
        response = client.post("/habitat-suitability", json={})
        assert response.status_code == 422
        
        # Missing 'areas' field
        response = client.post("/species-area-relationship", json={"species_counts": [1, 2, 3]})
        assert response.status_code == 422
        
        # Missing 'patches' field
        response = client.post("/fragmentation-metrics", json={"total_landscape_area": 100})
        assert response.status_code == 422
    
    def test_extreme_values(self):
        """Test handling of extreme but valid values"""
        # Very large areas
        request_data = {
            "areas": [1000000, 10000000, 100000000],
            "species_counts": [1000, 5000, 15000]
        }
        
        response = client.post("/species-area-relationship", json=request_data)
        assert response.status_code == 200
        
        # Very small patches
        request_data = {
            "patches": [{"area": 0.001, "perimeter": 10}],
            "total_landscape_area": 1.0
        }
        
        response = client.post("/fragmentation-metrics", json=request_data)
        assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=main", "--cov-report=html", "--cov-report=term"])