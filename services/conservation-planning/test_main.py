"""
Comprehensive test suite for the Conservation Planning Service.

Tests cover all API endpoints, mathematical calculations, optimization algorithms,
edge cases, and error handling scenarios.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestRootEndpoint:
    """Test the root endpoint"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns service information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Conservation Planning Service"
        assert "endpoints" in data
        assert len(data["endpoints"]) == 4

class TestConservationPriority:
    """Test conservation priority analysis"""
    
    def test_basic_priority_analysis(self):
        """Test basic conservation priority calculation"""
        request_data = {
            "sites": [
                {"name": "Site A", "biodiversity": 0.8, "threat": 0.3, "feasibility": 0.9},
                {"name": "Site B", "biodiversity": 0.6, "threat": 0.7, "feasibility": 0.5},
                {"name": "Site C", "biodiversity": 0.9, "threat": 0.2, "feasibility": 0.8}
            ],
            "weights": {
                "biodiversity": 0.5,
                "threat": 0.3,
                "feasibility": 0.2
            }
        }
        
        response = client.post("/conservation-priority", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "site_rankings" in data
        assert "priority_scores" in data
        assert "top_sites" in data
        assert "criteria_analysis" in data
        assert "recommendations" in data
        
        # Check that sites are ranked
        assert len(data["site_rankings"]) == 3
        assert len(data["priority_scores"]) == 3
        
        # Verify ranking order (highest score first)
        rankings = data["site_rankings"]
        assert rankings[0]["total_score"] >= rankings[1]["total_score"]
        assert rankings[1]["total_score"] >= rankings[2]["total_score"]
        
        # Check criteria analysis
        criteria = data["criteria_analysis"]
        assert "biodiversity" in criteria
        assert "threat" in criteria
        assert "feasibility" in criteria
        
        for criterion in criteria.values():
            assert "weight" in criterion
            assert "min_value" in criterion
            assert "max_value" in criterion
            assert "average" in criterion
    
    def test_threat_inversion(self):
        """Test that threat scores are properly inverted (lower threat = higher score)"""
        request_data = {
            "sites": [
                {"name": "Low Threat", "threat": 0.1},
                {"name": "High Threat", "threat": 0.9}
            ],
            "weights": {"threat": 1.0}
        }
        
        response = client.post("/conservation-priority", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        rankings = data["site_rankings"]
        
        # Low threat site should rank higher
        low_threat_site = next(s for s in rankings if s["name"] == "Low Threat")
        high_threat_site = next(s for s in rankings if s["name"] == "High Threat")
        
        assert low_threat_site["total_score"] > high_threat_site["total_score"]
    
    def test_equal_values_normalization(self):
        """Test normalization when all sites have equal values"""
        request_data = {
            "sites": [
                {"name": "Site A", "biodiversity": 0.5},
                {"name": "Site B", "biodiversity": 0.5},
                {"name": "Site C", "biodiversity": 0.5}
            ],
            "weights": {"biodiversity": 1.0}
        }
        
        response = client.post("/conservation-priority", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        rankings = data["site_rankings"]
        
        # All sites should have equal scores when values are identical
        scores = [site["total_score"] for site in rankings]
        assert all(abs(score - scores[0]) < 0.001 for score in scores)
    
    def test_priority_validation_errors(self):
        """Test validation errors for priority analysis"""
        # Too few sites
        response = client.post("/conservation-priority", json={
            "sites": [{"name": "Only One"}],
            "weights": {"biodiversity": 1.0}
        })
        assert response.status_code == 422
        
        # Weights don't sum to 1
        response = client.post("/conservation-priority", json={
            "sites": [
                {"name": "Site A", "biodiversity": 0.5},
                {"name": "Site B", "biodiversity": 0.7}
            ],
            "weights": {"biodiversity": 0.5}  # Should sum to 1.0
        })
        assert response.status_code == 422
        
        # Empty weights
        response = client.post("/conservation-priority", json={
            "sites": [
                {"name": "Site A", "biodiversity": 0.5},
                {"name": "Site B", "biodiversity": 0.7}
            ],
            "weights": {}
        })
        assert response.status_code == 422

class TestThreatAssessment:
    """Test threat assessment matrix analysis"""
    
    def test_basic_threat_assessment(self):
        """Test basic threat assessment calculation"""
        request_data = {
            "threats": [
                {"name": "Habitat Loss", "severity": 0.8, "scope": 0.6, "urgency": 0.7},
                {"name": "Climate Change", "severity": 0.7, "scope": 0.9, "urgency": 0.5},
                {"name": "Invasive Species", "severity": 0.5, "scope": 0.4, "urgency": 0.8}
            ],
            "species_vulnerability": {
                "Species A": 0.8,
                "Species B": 0.6,
                "Species C": 0.9
            }
        }
        
        response = client.post("/threat-assessment", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "threat_rankings" in data
        assert "overall_threat_score" in data
        assert "threat_matrix" in data
        assert "priority_threats" in data
        assert "mitigation_strategies" in data
        
        # Check threat rankings
        rankings = data["threat_rankings"]
        assert len(rankings) == 3
        
        # Verify ranking order (highest impact first)
        assert rankings[0]["weighted_impact"] >= rankings[1]["weighted_impact"]
        assert rankings[1]["weighted_impact"] >= rankings[2]["weighted_impact"]
        
        # Check threat matrix dimensions
        matrix = data["threat_matrix"]
        assert len(matrix) == 3  # 3 threats
        assert all(len(row) == 3 for row in matrix)  # 3 species each
        
        # Check overall threat score is reasonable
        assert 0 <= data["overall_threat_score"] <= 1
        
        # Check priority threats
        assert len(data["priority_threats"]) >= 2
        assert isinstance(data["mitigation_strategies"], list)
    
    def test_threat_score_calculation(self):
        """Test threat score calculation formula"""
        request_data = {
            "threats": [
                {"name": "Test Threat", "severity": 0.8, "scope": 0.6, "urgency": 0.4}
            ],
            "species_vulnerability": {"Species A": 1.0}
        }
        
        response = client.post("/threat-assessment", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        threat = data["threat_rankings"][0]
        
        # Base score = severity*0.4 + scope*0.4 + urgency*0.2
        expected_base = 0.8 * 0.4 + 0.6 * 0.4 + 0.4 * 0.2
        assert abs(threat["base_score"] - expected_base) < 0.001
        
        # With species vulnerability of 1.0, weighted impact should equal base score
        assert abs(threat["weighted_impact"] - expected_base) < 0.001
    
    def test_default_urgency(self):
        """Test default urgency value when not provided"""
        request_data = {
            "threats": [
                {"name": "Test Threat", "severity": 0.8, "scope": 0.6}  # No urgency
            ],
            "species_vulnerability": {"Species A": 0.5}
        }
        
        response = client.post("/threat-assessment", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        threat = data["threat_rankings"][0]
        
        # Should use default urgency of 0.5
        assert threat["urgency"] == 0.5
    
    def test_threat_validation_errors(self):
        """Test validation errors for threat assessment"""
        # Missing required threat fields
        response = client.post("/threat-assessment", json={
            "threats": [{"name": "Incomplete"}],  # Missing severity and scope
            "species_vulnerability": {"Species A": 0.5}
        })
        assert response.status_code == 422
        
        # Empty threats list
        response = client.post("/threat-assessment", json={
            "threats": [],
            "species_vulnerability": {"Species A": 0.5}
        })
        assert response.status_code == 422

class TestCostEffectiveness:
    """Test cost-effectiveness analysis"""
    
    def test_basic_cost_effectiveness(self):
        """Test basic cost-effectiveness calculation"""
        request_data = {
            "actions": [
                {"name": "Action A", "cost": 100, "benefit": 300},
                {"name": "Action B", "cost": 200, "benefit": 500},
                {"name": "Action C", "cost": 150, "benefit": 200}
            ],
            "budget_constraint": 400
        }
        
        response = client.post("/cost-effectiveness", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "ranked_actions" in data
        assert "optimal_portfolio" in data
        assert "total_cost" in data
        assert "total_benefit" in data
        assert "efficiency_ratio" in data
        assert "budget_utilization" in data
        assert "recommendations" in data
        
        # Check rankings by cost-effectiveness ratio
        rankings = data["ranked_actions"]
        assert len(rankings) == 3
        
        # Verify CE ratios are calculated correctly
        for action in rankings:
            expected_ce = action["benefit"] / action["cost"]
            assert abs(action["ce_ratio"] - expected_ce) < 0.001
        
        # Verify ranking order (highest CE ratio first)
        assert rankings[0]["ce_ratio"] >= rankings[1]["ce_ratio"]
        assert rankings[1]["ce_ratio"] >= rankings[2]["ce_ratio"]
        
        # Check optimal portfolio
        portfolio = data["optimal_portfolio"]
        portfolio_cost = sum(action["cost"] for action in portfolio)
        assert portfolio_cost <= 400  # Within budget
        
        # Check efficiency metrics
        assert data["efficiency_ratio"] > 0
        assert 0 <= data["budget_utilization"] <= 100
    
    def test_greedy_portfolio_selection(self):
        """Test greedy algorithm for portfolio selection"""
        request_data = {
            "actions": [
                {"name": "High CE", "cost": 50, "benefit": 200},   # CE = 4.0
                {"name": "Medium CE", "cost": 100, "benefit": 250}, # CE = 2.5
                {"name": "Low CE", "cost": 200, "benefit": 300}     # CE = 1.5
            ],
            "budget_constraint": 120
        }
        
        response = client.post("/cost-effectiveness", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        portfolio = data["optimal_portfolio"]
        
        # Should select highest CE action first
        assert any(action["name"] == "High CE" for action in portfolio)
        
        # Should not exceed budget
        total_cost = sum(action["cost"] for action in portfolio)
        assert total_cost <= 120
    
    def test_roi_calculation(self):
        """Test return on investment calculation"""
        request_data = {
            "actions": [
                {"name": "Test Action", "cost": 100, "benefit": 150},
                {"name": "Another Action", "cost": 200, "benefit": 250}
            ],
            "budget_constraint": 400
        }
        
        response = client.post("/cost-effectiveness", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Find the test action in the results
        test_action = next(a for a in data["ranked_actions"] if a["name"] == "Test Action")
        
        # ROI = (benefit - cost) / cost * 100
        expected_roi = (150 - 100) / 100 * 100  # 50%
        assert abs(test_action["roi_percent"] - expected_roi) < 0.01
    
    def test_cost_effectiveness_validation_errors(self):
        """Test validation errors for cost-effectiveness analysis"""
        # Too few actions
        response = client.post("/cost-effectiveness", json={
            "actions": [{"name": "Only One", "cost": 100, "benefit": 200}],
            "budget_constraint": 500
        })
        assert response.status_code == 422
        
        # Negative or zero cost
        response = client.post("/cost-effectiveness", json={
            "actions": [
                {"name": "Action A", "cost": 0, "benefit": 100},
                {"name": "Action B", "cost": 100, "benefit": 200}
            ],
            "budget_constraint": 500
        })
        assert response.status_code == 422
        
        # Missing required fields
        response = client.post("/cost-effectiveness", json={
            "actions": [
                {"name": "Incomplete"},  # Missing cost and benefit
                {"name": "Action B", "cost": 100, "benefit": 200}
            ],
            "budget_constraint": 500
        })
        assert response.status_code == 422

class TestReserveSelection:
    """Test reserve selection optimization"""
    
    def test_basic_reserve_selection(self):
        """Test basic reserve selection optimization"""
        request_data = {
            "sites": [
                {"name": "Site A", "cost": 100, "species": ["Species 1", "Species 2"]},
                {"name": "Site B", "cost": 150, "species": ["Species 2", "Species 3"]},
                {"name": "Site C", "cost": 80, "species": ["Species 1", "Species 3"]},
                {"name": "Site D", "cost": 200, "species": ["Species 1", "Species 2", "Species 3"]}
            ],
            "species_targets": {
                "Species 1": 2,
                "Species 2": 1,
                "Species 3": 1
            },
            "budget_limit": 300
        }
        
        response = client.post("/reserve-selection", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "selected_sites" in data
        assert "total_cost" in data
        assert "species_coverage" in data
        assert "coverage_summary" in data
        assert "efficiency_metrics" in data
        assert "alternative_solutions" in data
        assert "recommendations" in data
        
        # Check selected sites
        selected = data["selected_sites"]
        assert len(selected) > 0
        
        # Check budget constraint
        assert data["total_cost"] <= 300
        
        # Check species coverage
        coverage = data["species_coverage"]
        assert "Species 1" in coverage
        assert "Species 2" in coverage
        assert "Species 3" in coverage
        
        for species_data in coverage.values():
            assert "target" in species_data
            assert "achieved" in species_data
            assert "coverage_percent" in species_data
            assert "covering_sites" in species_data
            assert "gap" in species_data
        
        # Check coverage summary
        summary = data["coverage_summary"]
        assert "total_species" in summary
        assert "fully_covered_species" in summary
        assert "average_coverage" in summary
        
        # Check efficiency metrics
        metrics = data["efficiency_metrics"]
        assert "sites_selected" in metrics
        assert "total_sites_available" in metrics
        assert "selection_efficiency" in metrics
    
    def test_greedy_set_cover_algorithm(self):
        """Test greedy algorithm for set cover problem"""
        request_data = {
            "sites": [
                {"name": "Efficient Site", "cost": 50, "species": ["A", "B", "C"]},
                {"name": "Expensive Site", "cost": 200, "species": ["A"]},
                {"name": "Cheap Site", "cost": 30, "species": ["D"]}
            ],
            "species_targets": {"A": 1, "B": 1, "C": 1, "D": 1}
        }
        
        response = client.post("/reserve-selection", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        selected = data["selected_sites"]
        
        # Should prefer efficient site over expensive site for species A, B, C
        site_names = [site["name"] for site in selected]
        assert "Efficient Site" in site_names
        assert "Expensive Site" not in site_names
        assert "Cheap Site" in site_names  # Needed for species D
    
    def test_budget_constraint_enforcement(self):
        """Test that budget constraints are properly enforced"""
        request_data = {
            "sites": [
                {"name": "Expensive A", "cost": 100, "species": ["Species 1"]},
                {"name": "Expensive B", "cost": 100, "species": ["Species 2"]},
                {"name": "Expensive C", "cost": 100, "species": ["Species 3"]}
            ],
            "species_targets": {"Species 1": 1, "Species 2": 1, "Species 3": 1},
            "budget_limit": 150
        }
        
        response = client.post("/reserve-selection", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_cost"] <= 150
        
        # Should not be able to cover all species within budget
        coverage = data["coverage_summary"]
        assert coverage["fully_covered_species"] < 3
    
    def test_no_budget_constraint(self):
        """Test reserve selection without budget constraint"""
        request_data = {
            "sites": [
                {"name": "Site A", "cost": 1000, "species": ["Species 1"]},
                {"name": "Site B", "cost": 2000, "species": ["Species 2"]}
            ],
            "species_targets": {"Species 1": 1, "Species 2": 1}
            # No budget_limit specified
        }
        
        response = client.post("/reserve-selection", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        # Should be able to select both sites without budget constraint
        assert len(data["selected_sites"]) == 2
        assert data["total_cost"] == 3000
    
    def test_alternative_solutions(self):
        """Test generation of alternative solutions"""
        request_data = {
            "sites": [
                {"name": "Cheap A", "cost": 10, "species": ["Species 1"]},
                {"name": "Expensive A", "cost": 100, "species": ["Species 1", "Species 2"]},
                {"name": "Rich Site", "cost": 50, "species": ["Species 1", "Species 2", "Species 3"]}
            ],
            "species_targets": {"Species 1": 1, "Species 2": 1, "Species 3": 1},
            "budget_limit": 200
        }
        
        response = client.post("/reserve-selection", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        alternatives = data["alternative_solutions"]
        
        # Should have alternative strategies
        assert len(alternatives) > 0
        
        for alt in alternatives:
            assert "strategy" in alt
            assert "sites" in alt
            assert "total_cost" in alt
            assert "species_covered" in alt
    
    def test_reserve_validation_errors(self):
        """Test validation errors for reserve selection"""
        # Too few sites
        response = client.post("/reserve-selection", json={
            "sites": [{"name": "Only One", "cost": 100, "species": ["A"]}],
            "species_targets": {"A": 1}
        })
        assert response.status_code == 422
        
        # Missing required site fields
        response = client.post("/reserve-selection", json={
            "sites": [
                {"name": "Complete", "cost": 100, "species": ["A"]},
                {"name": "Incomplete"}  # Missing cost and species
            ],
            "species_targets": {"A": 1}
        })
        assert response.status_code == 422
        
        # Target species not in any site
        response = client.post("/reserve-selection", json={
            "sites": [
                {"name": "Site A", "cost": 100, "species": ["Species 1"]},
                {"name": "Site B", "cost": 100, "species": ["Species 2"]}
            ],
            "species_targets": {"Species 3": 1}  # Not in any site
        })
        assert response.status_code == 400  # Should be a calculation error

class TestEdgeCasesAndErrorHandling:
    """Test edge cases and error handling across all endpoints"""
    
    def test_malformed_json(self):
        """Test handling of malformed JSON requests"""
        response = client.post("/conservation-priority", data="invalid json")
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        # Missing sites in priority analysis
        response = client.post("/conservation-priority", json={"weights": {"biodiversity": 1.0}})
        assert response.status_code == 422
        
        # Missing species_vulnerability in threat assessment
        response = client.post("/threat-assessment", json={
            "threats": [{"name": "Test", "severity": 0.5, "scope": 0.5}]
        })
        assert response.status_code == 422
        
        # Missing budget_constraint in cost-effectiveness
        response = client.post("/cost-effectiveness", json={
            "actions": [
                {"name": "A", "cost": 100, "benefit": 200},
                {"name": "B", "cost": 150, "benefit": 300}
            ]
        })
        assert response.status_code == 422
    
    def test_empty_data_structures(self):
        """Test handling of empty data structures"""
        # Empty sites list (should fail validation)
        response = client.post("/conservation-priority", json={
            "sites": [],
            "weights": {"biodiversity": 1.0}
        })
        assert response.status_code == 422
        
        # Empty species vulnerability (should work but give zero threat score)
        response = client.post("/threat-assessment", json={
            "threats": [{"name": "Test", "severity": 0.5, "scope": 0.5}],
            "species_vulnerability": {}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["overall_threat_score"] >= 0
    
    def test_extreme_values(self):
        """Test handling of extreme but valid values"""
        # Very high costs in cost-effectiveness
        response = client.post("/cost-effectiveness", json={
            "actions": [
                {"name": "Expensive", "cost": 1000000, "benefit": 2000000},
                {"name": "Cheap", "cost": 1, "benefit": 2}
            ],
            "budget_constraint": 500000
        })
        assert response.status_code == 200
        
        # Very large number of species in reserve selection
        many_species = [f"Species_{i}" for i in range(50)]
        response = client.post("/reserve-selection", json={
            "sites": [
                {"name": "Mega Site", "cost": 1000, "species": many_species},
                {"name": "Small Site", "cost": 100, "species": many_species[:5]}
            ],
            "species_targets": {species: 1 for species in many_species[:10]}
        })
        assert response.status_code == 200
    
    def test_zero_and_negative_boundary_values(self):
        """Test handling of zero and boundary values"""
        # Zero threat values
        response = client.post("/threat-assessment", json={
            "threats": [{"name": "No Threat", "severity": 0.0, "scope": 0.0, "urgency": 0.0}],
            "species_vulnerability": {"Species A": 0.5}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["threat_rankings"][0]["base_score"] == 0.0
        
        # Zero species vulnerability
        response = client.post("/threat-assessment", json={
            "threats": [{"name": "Test", "severity": 0.5, "scope": 0.5}],
            "species_vulnerability": {"Species A": 0.0}
        })
        assert response.status_code == 200

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=main", "--cov-report=html", "--cov-report=term"])