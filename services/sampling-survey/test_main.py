import pytest
import numpy as np
import scipy.stats as stats
from fastapi.testclient import TestClient
from main import app
from math import sqrt, log, exp

client = TestClient(app)


class TestSampleSize:
    """Test sample size calculations."""
    
    def test_infinite_population_basic(self):
        """Test sample size calculation for infinite population."""
        response = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.05,
            "confidence_level": 0.95
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "sample_size" in data
        assert "finite_population_correction" in data
        assert data["population_size"] is None
        assert data["finite_population_correction"] is False
        
        # For 95% confidence, 5% margin, 50% proportion: n ≈ 384
        assert 380 <= data["sample_size"] <= 390
    
    def test_finite_population_correction(self):
        """Test sample size with finite population correction."""
        response = client.post("/sample-size", json={
            "population_size": 1000,
            "expected_proportion": 0.5,
            "margin_of_error": 0.05,
            "confidence_level": 0.95
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["finite_population_correction"] is True
        assert data["population_size"] == 1000
        # Should be smaller than infinite population case
        assert data["sample_size"] < 384
    
    def test_different_confidence_levels(self):
        """Test sample size with different confidence levels."""
        # 90% confidence should require smaller sample
        response_90 = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.05,
            "confidence_level": 0.90
        })
        
        # 99% confidence should require larger sample
        response_99 = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.05,
            "confidence_level": 0.99
        })
        
        assert response_90.status_code == 200
        assert response_99.status_code == 200
        
        data_90 = response_90.json()
        data_99 = response_99.json()
        
        # Higher confidence should require larger sample
        assert data_99["sample_size"] > data_90["sample_size"]
    
    def test_different_margins_of_error(self):
        """Test sample size with different margins of error."""
        # Smaller margin should require larger sample
        response_small = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.03,  # 3%
            "confidence_level": 0.95
        })
        
        # Larger margin should require smaller sample
        response_large = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.10,  # 10%
            "confidence_level": 0.95
        })
        
        assert response_small.status_code == 200
        assert response_large.status_code == 200
        
        data_small = response_small.json()
        data_large = response_large.json()
        
        # Smaller margin should require larger sample
        assert data_small["sample_size"] > data_large["sample_size"]
    
    def test_extreme_proportions(self):
        """Test sample size with extreme proportions."""
        # p = 0.1 (rare event)
        response_rare = client.post("/sample-size", json={
            "expected_proportion": 0.1,
            "margin_of_error": 0.05,
            "confidence_level": 0.95
        })
        
        # p = 0.5 (maximum variance)
        response_max = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.05,
            "confidence_level": 0.95
        })
        
        assert response_rare.status_code == 200
        assert response_max.status_code == 200
        
        data_rare = response_rare.json()
        data_max = response_max.json()
        
        # p = 0.5 should require largest sample (maximum variance)
        assert data_max["sample_size"] > data_rare["sample_size"]


class TestDetectionProbability:
    """Test detection probability calculations."""
    
    def test_perfect_detection(self):
        """Test detection probability with perfect detection."""
        response = client.post("/detection-probability", json={
            "detections": 20,
            "surveys": 20,
            "confidence_level": 0.95
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "detection_probability" in data
        assert "confidence_interval_lower" in data
        assert "confidence_interval_upper" in data
        
        # Perfect detection
        assert data["detection_probability"] == 1.0
        assert data["confidence_interval_lower"] < 1.0  # Should have some uncertainty
        assert data["confidence_interval_upper"] == 1.0
    
    def test_no_detection(self):
        """Test detection probability with no detections."""
        response = client.post("/detection-probability", json={
            "detections": 0,
            "surveys": 10,
            "confidence_level": 0.95
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["detection_probability"] == 0.0
        assert data["confidence_interval_lower"] == 0.0
        assert data["confidence_interval_upper"] > 0.0  # Should have upper bound
    
    def test_partial_detection(self):
        """Test detection probability with partial detection."""
        response = client.post("/detection-probability", json={
            "detections": 15,
            "surveys": 20,
            "confidence_level": 0.95
        })
        assert response.status_code == 200
        data = response.json()
        
        # Should be 75% detection
        assert abs(data["detection_probability"] - 0.75) < 0.01
        assert 0 < data["confidence_interval_lower"] < 0.75
        assert 0.75 < data["confidence_interval_upper"] < 1.0
    
    def test_different_confidence_levels(self):
        """Test detection probability with different confidence levels."""
        # 90% confidence
        response_90 = client.post("/detection-probability", json={
            "detections": 8,
            "surveys": 10,
            "confidence_level": 0.90
        })
        
        # 99% confidence
        response_99 = client.post("/detection-probability", json={
            "detections": 8,
            "surveys": 10,
            "confidence_level": 0.99
        })
        
        assert response_90.status_code == 200
        assert response_99.status_code == 200
        
        data_90 = response_90.json()
        data_99 = response_99.json()
        
        # Same point estimate
        assert data_90["detection_probability"] == data_99["detection_probability"]
        
        # 99% CI should be wider
        width_90 = data_90["confidence_interval_upper"] - data_90["confidence_interval_lower"]
        width_99 = data_99["confidence_interval_upper"] - data_99["confidence_interval_lower"]
        assert width_99 > width_90
    
    def test_single_survey(self):
        """Test detection probability with single survey."""
        # Detected
        response_detected = client.post("/detection-probability", json={
            "detections": 1,
            "surveys": 1,
            "confidence_level": 0.95
        })
        
        # Not detected
        response_not_detected = client.post("/detection-probability", json={
            "detections": 0,
            "surveys": 1,
            "confidence_level": 0.95
        })
        
        assert response_detected.status_code == 200
        assert response_not_detected.status_code == 200
        
        data_detected = response_detected.json()
        data_not_detected = response_not_detected.json()
        
        assert data_detected["detection_probability"] == 1.0
        assert data_not_detected["detection_probability"] == 0.0


class TestCaptureRecapture:
    """Test capture-recapture analysis."""
    
    def test_lincoln_petersen_basic(self):
        """Test basic Lincoln-Petersen estimator."""
        response = client.post("/capture-recapture", json={
            "marked_first_sample": 50,
            "total_second_sample": 40,
            "marked_in_second": 8
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "population_estimate" in data
        assert "confidence_interval_lower" in data
        assert "confidence_interval_upper" in data
        assert "standard_error" in data
        
        # Lincoln-Petersen: N = (M * C) / R = (50 * 40) / 8 = 250
        expected_estimate = (50 * 40) / 8
        assert abs(data["population_estimate"] - expected_estimate) < 0.01
        
        # Should have reasonable confidence interval
        assert data["confidence_interval_lower"] < data["population_estimate"]
        assert data["confidence_interval_upper"] > data["population_estimate"]
    
    def test_high_recapture_rate(self):
        """Test with high recapture rate (small population)."""
        response = client.post("/capture-recapture", json={
            "marked_first_sample": 20,
            "total_second_sample": 25,
            "marked_in_second": 10  # 50% recapture rate
        })
        assert response.status_code == 200
        data = response.json()
        
        # N = (20 * 25) / 10 = 50
        expected_estimate = (20 * 25) / 10
        assert abs(data["population_estimate"] - expected_estimate) < 0.01
        
        # High recapture rate should give tighter confidence interval
        ci_width = data["confidence_interval_upper"] - data["confidence_interval_lower"]
        assert ci_width > 0  # Should have some uncertainty
    
    def test_low_recapture_rate(self):
        """Test with low recapture rate (large population)."""
        response = client.post("/capture-recapture", json={
            "marked_first_sample": 100,
            "total_second_sample": 100,
            "marked_in_second": 2  # 2% recapture rate
        })
        assert response.status_code == 200
        data = response.json()
        
        # N = (100 * 100) / 2 = 5000
        expected_estimate = (100 * 100) / 2
        assert abs(data["population_estimate"] - expected_estimate) < 0.01
        
        # Low recapture rate should give wider confidence interval
        ci_width = data["confidence_interval_upper"] - data["confidence_interval_lower"]
        assert ci_width > 1000  # Should be quite uncertain
    
    def test_single_recapture(self):
        """Test with single recapture (edge case)."""
        response = client.post("/capture-recapture", json={
            "marked_first_sample": 30,
            "total_second_sample": 50,
            "marked_in_second": 1
        })
        assert response.status_code == 200
        data = response.json()
        
        # N = (30 * 50) / 1 = 1500
        expected_estimate = (30 * 50) / 1
        assert abs(data["population_estimate"] - expected_estimate) < 0.01
        
        # Single recapture should have very wide confidence interval
        # When R=1, lower bound equals the estimate (no lower uncertainty)
        assert data["confidence_interval_lower"] <= data["population_estimate"]
        # Upper bound should be very large (representing high uncertainty)
        assert data["confidence_interval_upper"] > data["population_estimate"] * 2
    
    def test_equal_samples(self):
        """Test with equal sample sizes."""
        response = client.post("/capture-recapture", json={
            "marked_first_sample": 25,
            "total_second_sample": 25,
            "marked_in_second": 5
        })
        assert response.status_code == 200
        data = response.json()
        
        # N = (25 * 25) / 5 = 125
        expected_estimate = (25 * 25) / 5
        assert abs(data["population_estimate"] - expected_estimate) < 0.01


class TestDistanceSampling:
    """Test distance sampling analysis."""
    
    def test_basic_distance_sampling(self):
        """Test basic distance sampling calculation."""
        response = client.post("/distance-sampling", json={
            "distances": [5.2, 12.1, 8.7, 15.3, 3.4, 9.8, 18.2, 6.5],
            "transect_length": 1000,
            "transect_width": 25
        })
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "density_estimate" in data
        assert "detection_function_parameter" in data
        assert "effective_strip_width" in data
        assert "encounter_rate" in data
        assert "total_detections" in data
        assert "surveyed_area" in data
        
        # Basic checks
        assert data["total_detections"] == 8
        assert data["density_estimate"] > 0
        assert data["effective_strip_width"] > 0
        assert data["effective_strip_width"] <= 25  # Should be less than max width
        assert data["encounter_rate"] == 8 / 1000  # detections per meter
    
    def test_close_detections(self):
        """Test distance sampling with all close detections."""
        response = client.post("/distance-sampling", json={
            "distances": [1.0, 2.0, 1.5, 2.5, 1.8],  # All very close
            "transect_length": 500,
            "transect_width": 20
        })
        assert response.status_code == 200
        data = response.json()
        
        # Close detections should give small detection function parameter
        assert data["detection_function_parameter"] < 5
        # And smaller effective strip width
        assert data["effective_strip_width"] < 10
    
    def test_far_detections(self):
        """Test distance sampling with distant detections."""
        response = client.post("/distance-sampling", json={
            "distances": [15.0, 18.0, 20.0, 22.0, 19.5],  # All far
            "transect_length": 800,
            "transect_width": 25
        })
        assert response.status_code == 200
        data = response.json()
        
        # Distant detections should give larger detection function parameter
        assert data["detection_function_parameter"] > 10
        # And larger effective strip width
        assert data["effective_strip_width"] > 15
    
    def test_single_detection(self):
        """Test distance sampling with single detection."""
        response = client.post("/distance-sampling", json={
            "distances": [10.0],
            "transect_length": 1000,
            "transect_width": 20
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_detections"] == 1
        assert data["encounter_rate"] == 1 / 1000
        assert data["density_estimate"] > 0
    
    def test_many_detections(self):
        """Test distance sampling with many detections."""
        # Generate 20 random distances
        distances = [5.0, 8.2, 12.1, 3.4, 15.6, 7.8, 11.2, 4.5, 9.7, 13.8,
                    6.3, 14.2, 2.1, 16.5, 8.9, 10.4, 5.7, 12.8, 7.1, 9.3]
        
        response = client.post("/distance-sampling", json={
            "distances": distances,
            "transect_length": 2000,
            "transect_width": 20
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_detections"] == 20
        assert data["encounter_rate"] == 20 / 2000
        assert data["density_estimate"] > 0
    
    def test_mathematical_properties(self):
        """Test mathematical properties of distance sampling."""
        response = client.post("/distance-sampling", json={
            "distances": [5.0, 10.0, 15.0],
            "transect_length": 1000,
            "transect_width": 20
        })
        assert response.status_code == 200
        data = response.json()
        
        # Density = encounters / (2 * L * ESW)
        expected_density = data["encounter_rate"] / (2 * data["effective_strip_width"])
        assert abs(data["density_estimate"] - expected_density) < 1e-10
        
        # Surveyed area = 2 * L * ESW
        expected_area = 2 * 1000 * data["effective_strip_width"]
        assert abs(data["surveyed_area"] - expected_area) < 1e-10


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
        assert data["message"] == "Sampling & Survey Design API"


# Mathematical validation tests
class TestMathematicalAccuracy:
    """Test mathematical accuracy of calculations."""
    
    def test_sample_size_formula(self):
        """Verify sample size follows n = Z²pq/e² formula."""
        p = 0.3
        e = 0.05
        z = 1.96  # 95% confidence
        
        response = client.post("/sample-size", json={
            "expected_proportion": p,
            "margin_of_error": e,
            "confidence_level": 0.95
        })
        
        data = response.json()
        
        # Calculate expected sample size
        expected_n = (z**2 * p * (1 - p)) / (e**2)
        
        # Should match (within rounding)
        assert abs(data["sample_size"] - expected_n) <= 1
    
    def test_finite_population_correction_formula(self):
        """Verify finite population correction formula."""
        N = 500  # Population size
        p = 0.4
        e = 0.05
        z = 1.96
        
        response = client.post("/sample-size", json={
            "population_size": N,
            "expected_proportion": p,
            "margin_of_error": e,
            "confidence_level": 0.95
        })
        
        data = response.json()
        
        # Calculate expected with finite correction
        n_infinite = (z**2 * p * (1 - p)) / (e**2)
        n_corrected = n_infinite / (1 + (n_infinite - 1) / N)
        
        assert abs(data["sample_size"] - n_corrected) <= 1
    
    def test_lincoln_petersen_formula(self):
        """Verify Lincoln-Petersen estimator formula."""
        test_cases = [
            (30, 25, 6, 125.0),    # N = (30 * 25) / 6 = 125
            (100, 80, 16, 500.0),  # N = (100 * 80) / 16 = 500
            (20, 30, 3, 200.0),    # N = (20 * 30) / 3 = 200
        ]
        
        for M, C, R, expected_N in test_cases:
            response = client.post("/capture-recapture", json={
                "marked_first_sample": M,
                "total_second_sample": C,
                "marked_in_second": R
            })
            
            data = response.json()
            assert abs(data["population_estimate"] - expected_N) < 0.01
    
    def test_detection_probability_properties(self):
        """Verify detection probability properties."""
        # Test that confidence intervals have correct coverage properties
        response = client.post("/detection-probability", json={
            "detections": 7,
            "surveys": 10,
            "confidence_level": 0.95
        })
        
        data = response.json()
        
        # Point estimate should be within confidence interval
        assert data["confidence_interval_lower"] <= data["detection_probability"]
        assert data["detection_probability"] <= data["confidence_interval_upper"]
        
        # Confidence interval should be valid probability range
        assert 0 <= data["confidence_interval_lower"] <= 1
        assert 0 <= data["confidence_interval_upper"] <= 1
    
    def test_distance_sampling_half_normal(self):
        """Verify half-normal detection function properties."""
        # For half-normal: ESW = σ * sqrt(π/2)
        response = client.post("/distance-sampling", json={
            "distances": [7.07, 10.0, 14.14],  # Specific values for testing
            "transect_length": 1000,
            "transect_width": 20
        })
        
        data = response.json()
        
        # Verify ESW calculation
        sigma = data["detection_function_parameter"]
        expected_esw = sigma * sqrt(np.pi / 2)
        assert abs(data["effective_strip_width"] - expected_esw) < 0.01


# Edge cases and error handling
class TestEdgeCases:
    """Test edge cases and boundary conditions."""
    
    def test_sample_size_extreme_confidence(self):
        """Test sample size with extreme confidence levels."""
        # Very low confidence (should give small sample)
        response_low = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.1,
            "confidence_level": 0.50
        })
        
        # Very high confidence (should give large sample)
        response_high = client.post("/sample-size", json={
            "expected_proportion": 0.5,
            "margin_of_error": 0.1,
            "confidence_level": 0.999
        })
        
        assert response_low.status_code == 200
        assert response_high.status_code == 200
        
        data_low = response_low.json()
        data_high = response_high.json()
        
        assert data_high["sample_size"] > data_low["sample_size"]
    
    def test_capture_recapture_boundary_cases(self):
        """Test capture-recapture boundary cases."""
        # All individuals recaptured (small population)
        response = client.post("/capture-recapture", json={
            "marked_first_sample": 10,
            "total_second_sample": 15,
            "marked_in_second": 10  # All marked individuals recaptured
        })
        assert response.status_code == 200
        data = response.json()
        
        # Should give reasonable estimate
        assert data["population_estimate"] >= 15  # At least as large as second sample
    
    def test_distance_sampling_zero_distances(self):
        """Test distance sampling with animals on the transect line."""
        response = client.post("/distance-sampling", json={
            "distances": [0.0, 0.1, 0.2],  # Very close to transect
            "transect_length": 1000,
            "transect_width": 10
        })
        assert response.status_code == 200
        data = response.json()
        
        # Should handle zero distances gracefully
        assert data["density_estimate"] > 0
        assert data["detection_function_parameter"] > 0


if __name__ == "__main__":
    pytest.main([__file__])