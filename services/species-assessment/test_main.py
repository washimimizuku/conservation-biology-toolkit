"""
Comprehensive test suite for Species Assessment Service

Tests IUCN Red List criteria assessment, extinction risk evaluation,
and range size analysis with various scenarios and edge cases.
"""

import pytest
from fastapi.testclient import TestClient
from main import app, assess_iucn_criteria, assess_extinction_risk, calculate_range_metrics
from main import PopulationData, RangeData, ExtinctionRiskFactors, IUCNCategory, ThreatLevel

client = TestClient(app)

class TestIUCNAssessment:
    """Test IUCN Red List criteria assessment"""
    
    def test_critically_endangered_population_decline(self):
        """Test CR classification based on severe population decline"""
        pop_data = PopulationData(decline_rate=0.85)  # 85% decline
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.CR
        assert "A1: ≥80% population decline" in result.criteria_met
        assert "85.0%" in result.justification
    
    def test_endangered_range_size(self):
        """Test EN classification based on small extent of occurrence"""
        pop_data = PopulationData()
        range_data = RangeData(extent_of_occurrence=3000)  # < 5000 km²
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.EN
        assert "B1: EOO < 5,000 km²" in result.criteria_met
        assert "3000.0 km²" in result.justification
    
    def test_vulnerable_population_size(self):
        """Test VU classification based on small population"""
        pop_data = PopulationData(current_population=5000)  # < 10000
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.VU
        assert "C: Population < 10,000 mature individuals" in result.criteria_met
    
    def test_multiple_criteria_most_severe_wins(self):
        """Test that most severe category is selected when multiple criteria are met"""
        pop_data = PopulationData(
            current_population=100,  # Would be EN under criterion C
            decline_rate=0.9  # CR under criterion A
        )
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.CR
        assert len(result.criteria_met) >= 2
    
    def test_area_of_occupancy_criteria(self):
        """Test classification based on area of occupancy"""
        pop_data = PopulationData()
        range_data = RangeData(area_of_occupancy=300)  # < 500 km²
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.EN
        assert "B2: AOO < 500 km²" in result.criteria_met
    
    def test_very_small_population_criterion_d(self):
        """Test criterion D for very small populations"""
        pop_data = PopulationData(current_population=30)  # < 50
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.CR
        assert "D: Population < 50 mature individuals" in result.criteria_met
    
    def test_least_concern_classification(self):
        """Test LC classification when no criteria are met"""
        pop_data = PopulationData(
            current_population=50000,
            decline_rate=0.1  # 10% decline
        )
        range_data = RangeData(extent_of_occurrence=100000)
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.LC
        assert len(result.criteria_met) == 0
    
    def test_confidence_levels(self):
        """Test confidence level calculation based on data availability"""
        # High confidence (3+ data points)
        pop_data = PopulationData(current_population=1000, decline_rate=0.2)
        range_data = RangeData(extent_of_occurrence=15000, area_of_occupancy=800)
        
        result = assess_iucn_criteria(pop_data, range_data)
        assert result.confidence_level == "High"
        
        # Medium confidence (2 data points)
        pop_data = PopulationData(current_population=1000)
        range_data = RangeData(extent_of_occurrence=15000)
        
        result = assess_iucn_criteria(pop_data, range_data)
        assert result.confidence_level == "Medium"
        
        # Low confidence (1 data point)
        pop_data = PopulationData(current_population=1000)
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        assert result.confidence_level == "Low"
class TestExtinctionRiskAssessment:
    """Test extinction risk assessment functionality"""
    
    def test_critical_risk_small_population(self):
        """Test critical risk assessment for very small populations"""
        factors = ExtinctionRiskFactors(
            population_size=25,  # Very small
            population_trend="declining",
            habitat_quality=0.2,  # Poor habitat
            threat_intensity=0.9,  # High threats
            genetic_diversity=0.1  # Low diversity
        )
        
        result = assess_extinction_risk(factors)
        
        assert result.risk_level == ThreatLevel.CRITICAL
        assert result.risk_score >= 0.8
        assert "Immediate conservation action required" in result.recommendations
        assert result.time_to_extinction_years is not None
    
    def test_high_risk_assessment(self):
        """Test high risk assessment"""
        factors = ExtinctionRiskFactors(
            population_size=500,
            population_trend="declining",
            habitat_quality=0.4,
            threat_intensity=0.7
        )
        
        result = assess_extinction_risk(factors)
        
        assert result.risk_level == ThreatLevel.HIGH
        assert 0.6 <= result.risk_score < 0.8
        assert "Establish protected areas or reserves" in result.recommendations
    
    def test_medium_risk_assessment(self):
        """Test medium risk assessment"""
        factors = ExtinctionRiskFactors(
            population_size=2000,
            population_trend="stable",
            habitat_quality=0.6,
            threat_intensity=0.4
        )
        
        result = assess_extinction_risk(factors)
        
        assert result.risk_level == ThreatLevel.MEDIUM
        assert 0.4 <= result.risk_score < 0.6
        assert "Monitor population trends closely" in result.recommendations
    
    def test_low_risk_assessment(self):
        """Test low risk assessment"""
        factors = ExtinctionRiskFactors(
            population_size=20000,
            population_trend="increasing",
            habitat_quality=0.9,
            threat_intensity=0.1,
            genetic_diversity=0.8
        )
        
        result = assess_extinction_risk(factors)
        
        assert result.risk_level == ThreatLevel.LOW
        assert result.risk_score < 0.4
        assert "Continue regular monitoring" in result.recommendations
    
    def test_contributing_factors_calculation(self):
        """Test that contributing factors are properly calculated"""
        factors = ExtinctionRiskFactors(
            population_size=1000,
            habitat_quality=0.5,
            threat_intensity=0.6
        )
        
        result = assess_extinction_risk(factors)
        
        assert "Population Size" in result.contributing_factors
        assert "Habitat Quality" in result.contributing_factors
        assert "Threat Intensity" in result.contributing_factors
        assert len(result.contributing_factors) == 3
    
    def test_population_trend_scoring(self):
        """Test population trend factor scoring"""
        # Declining population
        factors = ExtinctionRiskFactors(population_trend="declining")
        result = assess_extinction_risk(factors)
        assert result.contributing_factors["Population Trend"] == 0.8
        
        # Stable population
        factors = ExtinctionRiskFactors(population_trend="stable")
        result = assess_extinction_risk(factors)
        assert result.contributing_factors["Population Trend"] == 0.4
        
        # Increasing population
        factors = ExtinctionRiskFactors(population_trend="increasing")
        result = assess_extinction_risk(factors)
        assert result.contributing_factors["Population Trend"] == 0.1
    
    def test_minimal_data_assessment(self):
        """Test assessment with minimal data"""
        factors = ExtinctionRiskFactors(population_size=1000)
        
        result = assess_extinction_risk(factors)
        
        assert result.risk_level in [ThreatLevel.LOW, ThreatLevel.MEDIUM, ThreatLevel.HIGH, ThreatLevel.CRITICAL]
        assert 0 <= result.risk_score <= 1
        assert len(result.recommendations) > 0
class TestRangeAnalysis:
    """Test range size analysis functionality"""
    
    def test_fragmentation_index_calculation(self):
        """Test fragmentation index calculation"""
        range_data = RangeData(
            extent_of_occurrence=1000,
            area_of_occupancy=200
        )
        
        result = calculate_range_metrics(range_data)
        
        expected_fragmentation = 1.0 - (200 / 1000)  # 0.8
        assert result.range_fragmentation_index == expected_fragmentation
        assert result.extent_of_occurrence_km2 == 1000
        assert result.area_of_occupancy_km2 == 200
    
    def test_habitat_connectivity_calculation(self):
        """Test habitat connectivity estimation"""
        range_data = RangeData(
            area_of_occupancy=500,
            number_of_locations=5
        )
        
        result = calculate_range_metrics(range_data)
        
        # Average patch size = 500/5 = 100 km²
        # Connectivity = min(1.0, 100/100) = 1.0
        assert result.habitat_connectivity == 1.0
    
    def test_critical_conservation_priority(self):
        """Test critical conservation priority assignment"""
        range_data = RangeData(
            extent_of_occurrence=50,  # < 100 km² (+3 points)
            area_of_occupancy=5,      # < 10 km² (+3 points)
            severely_fragmented=True,  # (+2 points)
            number_of_locations=3     # <= 5 locations (+2 points)
        )
        
        result = calculate_range_metrics(range_data)
        
        assert result.conservation_priority == "Critical"
    
    def test_high_conservation_priority(self):
        """Test high conservation priority assignment"""
        range_data = RangeData(
            extent_of_occurrence=2000,  # < 5000 km² (+2 points)
            area_of_occupancy=300,      # < 500 km² (+2 points)
            severely_fragmented=False,
            number_of_locations=10
        )
        
        result = calculate_range_metrics(range_data)
        
        assert result.conservation_priority == "High"
    
    def test_medium_conservation_priority(self):
        """Test medium conservation priority assignment"""
        range_data = RangeData(
            extent_of_occurrence=15000,  # < 20000 km² (+1 point)
            area_of_occupancy=1500,      # < 2000 km² (+1 point)
            severely_fragmented=False,
            number_of_locations=10
        )
        
        result = calculate_range_metrics(range_data)
        
        assert result.conservation_priority == "Medium"
    
    def test_low_conservation_priority(self):
        """Test low conservation priority assignment"""
        range_data = RangeData(
            extent_of_occurrence=50000,
            area_of_occupancy=5000,
            severely_fragmented=False,
            number_of_locations=20
        )
        
        result = calculate_range_metrics(range_data)
        
        assert result.conservation_priority == "Low"
    
    def test_no_fragmentation_when_missing_data(self):
        """Test fragmentation calculation with missing data"""
        range_data = RangeData(extent_of_occurrence=1000)  # Missing AOO
        
        result = calculate_range_metrics(range_data)
        
        assert result.range_fragmentation_index is None
    
    def test_no_connectivity_when_missing_data(self):
        """Test connectivity calculation with missing data"""
        range_data = RangeData(area_of_occupancy=500)  # Missing number of locations
        
        result = calculate_range_metrics(range_data)
        
        assert result.habitat_connectivity is None

class TestAPIEndpoints:
    """Test API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns service information"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Species Assessment Service"
        assert "endpoints" in data
    
    def test_iucn_assessment_endpoint(self):
        """Test IUCN assessment endpoint"""
        request_data = {
            "population_data": {
                "current_population": 500,
                "decline_rate": 0.6
            },
            "range_data": {
                "extent_of_occurrence": 3000,
                "area_of_occupancy": 200
            }
        }
        
        response = client.post("/iucn-assessment", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "category" in data
        assert "criteria_met" in data
        assert "justification" in data
    
    def test_extinction_risk_endpoint(self):
        """Test extinction risk assessment endpoint"""
        request_data = {
            "population_size": 1000,
            "population_trend": "declining",
            "habitat_quality": 0.5,
            "threat_intensity": 0.7
        }
        
        response = client.post("/extinction-risk", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "risk_level" in data
        assert "risk_score" in data
        assert "recommendations" in data
    
    def test_range_analysis_endpoint(self):
        """Test range analysis endpoint"""
        request_data = {
            "extent_of_occurrence": 5000,
            "area_of_occupancy": 800,
            "number_of_locations": 8,
            "severely_fragmented": False
        }
        
        response = client.post("/range-analysis", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "conservation_priority" in data
        assert "range_fragmentation_index" in data
    
    def test_health_check_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_invalid_decline_rate(self):
        """Test validation of decline rate values"""
        with pytest.raises(ValueError):
            PopulationData(decline_rate=1.5)  # > 1.0
        
        with pytest.raises(ValueError):
            PopulationData(decline_rate=-0.1)  # < 0.0
    
    def test_invalid_score_values(self):
        """Test validation of score values (0-1 range)"""
        with pytest.raises(ValueError):
            ExtinctionRiskFactors(habitat_quality=1.5)
        
        with pytest.raises(ValueError):
            ExtinctionRiskFactors(threat_intensity=-0.1)
        
        with pytest.raises(ValueError):
            ExtinctionRiskFactors(genetic_diversity=2.0)
    
    def test_zero_population_size(self):
        """Test handling of zero population size"""
        pop_data = PopulationData(current_population=0)
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        # Should still classify based on available criteria
        assert result.category in [cat for cat in IUCNCategory]
    
    def test_zero_range_values(self):
        """Test handling of zero range values"""
        range_data = RangeData(
            extent_of_occurrence=0,
            area_of_occupancy=0
        )
        
        result = calculate_range_metrics(range_data)
        
        assert result.conservation_priority == "Critical"  # Zero range is critical
    
    def test_missing_all_data(self):
        """Test assessment with no data provided"""
        pop_data = PopulationData()
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        assert result.category == IUCNCategory.LC  # Default to LC when no criteria met
        assert result.confidence_level == "Low"
        assert "Insufficient data" in result.justification
    
    def test_api_error_handling(self):
        """Test API error handling with invalid data"""
        # Test with invalid JSON structure
        response = client.post("/iucn-assessment", json={"invalid": "data"})
        assert response.status_code == 422  # Validation error
        
        # Test with missing required fields
        response = client.post("/extinction-risk", json={})
        assert response.status_code == 200  # Should handle empty data gracefully
    
    def test_boundary_values(self):
        """Test boundary values for IUCN criteria"""
        # Test exact boundary values
        pop_data = PopulationData(current_population=250)  # Exactly at EN/VU boundary
        range_data = RangeData()
        
        result = assess_iucn_criteria(pop_data, range_data)
        
        # Should be classified as EN (< 250 is CR, >= 250 is EN for this criterion)
        assert result.category in [IUCNCategory.EN, IUCNCategory.VU]
    
    def test_large_population_values(self):
        """Test handling of very large population values"""
        factors = ExtinctionRiskFactors(population_size=1000000)
        
        result = assess_extinction_risk(factors)
        
        assert result.risk_level == ThreatLevel.LOW
        assert result.contributing_factors["Population Size"] == 0.2  # Low risk for large pop

if __name__ == "__main__":
    pytest.main([__file__, "-v"])