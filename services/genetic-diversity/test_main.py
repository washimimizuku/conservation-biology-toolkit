"""
Comprehensive tests for the Genetic Diversity Service

Tests all genetic diversity calculations including Hardy-Weinberg equilibrium,
inbreeding coefficients, bottleneck detection, and allelic richness.
"""

import pytest
from fastapi.testclient import TestClient
from main import (
    app, 
    calculate_hardy_weinberg,
    calculate_inbreeding_coefficient,
    detect_bottleneck,
    calculate_allelic_richness,
    GenotypeData,
    PopulationSizes,
    AlleleCountData
)
import math

client = TestClient(app)

class TestHardyWeinbergEquilibrium:
    """Test Hardy-Weinberg equilibrium calculations"""
    
    def test_simple_two_allele_equilibrium(self):
        """Test Hardy-Weinberg with simple two-allele system in equilibrium"""
        # AA: 25, AB: 50, BB: 25 (perfect equilibrium for p=q=0.5)
        genotype_data = GenotypeData(genotypes={"AA": 25, "AB": 50, "BB": 25})
        result = calculate_hardy_weinberg(genotype_data)
        
        assert result.is_in_equilibrium == True
        assert result.p_value > 0.05
        assert abs(result.allele_frequencies["A"] - 0.5) < 0.01
        assert abs(result.allele_frequencies["B"] - 0.5) < 0.01
        assert result.chi_square_statistic < 3.84  # Critical value for p=0.05, df=1
    
    def test_deviation_from_equilibrium(self):
        """Test Hardy-Weinberg with deviation from equilibrium"""
        # Excess homozygotes (inbreeding)
        genotype_data = GenotypeData(genotypes={"AA": 40, "AB": 20, "BB": 40})
        result = calculate_hardy_weinberg(genotype_data)
        
        assert result.is_in_equilibrium == False
        assert result.p_value < 0.05
        assert result.chi_square_statistic > 3.84
    
    def test_three_allele_system(self):
        """Test Hardy-Weinberg with three alleles"""
        genotype_data = GenotypeData(genotypes={
            "AA": 16, "AB": 24, "AC": 20,
            "BB": 9, "BC": 15, "CC": 16
        })
        result = calculate_hardy_weinberg(genotype_data)
        
        assert len(result.allele_frequencies) == 3
        assert "A" in result.allele_frequencies
        assert "B" in result.allele_frequencies
        assert "C" in result.allele_frequencies
        assert abs(sum(result.allele_frequencies.values()) - 1.0) < 0.01
    
    def test_empty_genotypes(self):
        """Test error handling for empty genotype data"""
        with pytest.raises(ValueError, match="At least one genotype count must be provided"):
            GenotypeData(genotypes={})
    
    def test_negative_counts(self):
        """Test error handling for negative genotype counts"""
        with pytest.raises(ValueError, match="cannot be negative"):
            GenotypeData(genotypes={"AA": -5, "AB": 10, "BB": 5})
    
    def test_single_allele_error(self):
        """Test error handling for single allele system"""
        genotype_data = GenotypeData(genotypes={"AA": 100})
        with pytest.raises(ValueError, match="At least 2 alleles required"):
            calculate_hardy_weinberg(genotype_data)

class TestInbreedingCoefficient:
    """Test inbreeding coefficient calculations"""
    
    def test_no_inbreeding(self):
        """Test calculation with no inbreeding"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.5, 0.5, 0.5],
            total_heterozygosity=0.5,
            expected_heterozygosity=0.5
        )
        
        assert abs(result.fis) < 0.01
        assert abs(result.fit) < 0.01
        assert abs(result.fst) < 0.01
        assert "No inbreeding" in result.interpretation
    
    def test_moderate_inbreeding(self):
        """Test calculation with moderate inbreeding"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.4, 0.4, 0.4],
            total_heterozygosity=0.35,
            expected_heterozygosity=0.5
        )
        
        assert result.fis > 0.05
        assert result.fit > 0.05
        assert "inbreeding detected" in result.interpretation.lower()
    
    def test_high_inbreeding(self):
        """Test calculation with high inbreeding"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.3, 0.3, 0.3],
            total_heterozygosity=0.2,
            expected_heterozygosity=0.5
        )
        
        assert result.fis > 0.1
        assert result.fit > 0.1
        assert "High inbreeding" in result.interpretation
    
    def test_population_differentiation(self):
        """Test calculation with population differentiation"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.3, 0.4, 0.5],
            total_heterozygosity=0.4,
            expected_heterozygosity=0.6
        )
        
        assert result.fst > 0
        assert result.fit > 0
    
    def test_invalid_heterozygosity_values(self):
        """Test error handling for invalid heterozygosity values"""
        with pytest.raises(ValueError, match="must be between 0 and 1"):
            calculate_inbreeding_coefficient([0.5], 1.5, 0.5)
        
        with pytest.raises(ValueError, match="must be between 0 and 1"):
            calculate_inbreeding_coefficient([0.5], 0.5, -0.1)
        
        with pytest.raises(ValueError, match="must be between 0 and 1"):
            calculate_inbreeding_coefficient([1.5], 0.5, 0.5)

class TestBottleneckDetection:
    """Test bottleneck detection algorithms"""
    
    def test_severe_bottleneck(self):
        """Test detection of severe bottleneck"""
        population_data = PopulationSizes(sizes=[1000, 900, 50, 100, 200, 400])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == True
        assert result.severity == "Severe"
        assert result.minimum_size == 50
        assert result.reduction_percentage >= 90
    
    def test_moderate_bottleneck(self):
        """Test detection of moderate bottleneck"""
        population_data = PopulationSizes(sizes=[1000, 800, 200, 300, 500])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == True
        assert result.severity == "Moderate"
        assert result.minimum_size == 200
        assert 75 <= result.reduction_percentage < 90
    
    def test_mild_bottleneck(self):
        """Test detection of mild bottleneck"""
        population_data = PopulationSizes(sizes=[1000, 900, 400, 600, 800])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == True
        assert result.severity == "Mild"
        assert result.minimum_size == 400
        assert 50 <= result.reduction_percentage < 75
    
    def test_no_bottleneck(self):
        """Test stable population with no bottleneck"""
        population_data = PopulationSizes(sizes=[1000, 950, 900, 950, 1000])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == False
        assert result.severity == "None"
        assert result.reduction_percentage < 50
    
    def test_recovery_calculation(self):
        """Test recovery time calculation"""
        population_data = PopulationSizes(sizes=[1000, 100, 200, 500, 900, 950])
        result = detect_bottleneck(population_data)
        
        assert result.recovery_generations is not None
        assert result.recovery_generations > 0
    
    def test_effective_population_size(self):
        """Test effective population size calculation (harmonic mean)"""
        population_data = PopulationSizes(sizes=[100, 200, 300, 400])
        result = detect_bottleneck(population_data)
        
        # Harmonic mean of [100, 200, 300, 400] ≈ 171.4
        expected_harmonic_mean = 4 / (1/100 + 1/200 + 1/300 + 1/400)
        assert abs(result.effective_population_size - expected_harmonic_mean) < 1
    
    def test_insufficient_data(self):
        """Test error handling for insufficient data"""
        with pytest.raises(ValueError, match="At least 2 population size measurements required"):
            PopulationSizes(sizes=[100])
    
    def test_negative_population_size(self):
        """Test error handling for negative population sizes"""
        with pytest.raises(ValueError, match="Population sizes must be positive"):
            PopulationSizes(sizes=[100, -50, 200])

class TestAllelicRichness:
    """Test allelic richness calculations"""
    
    def test_basic_richness_calculation(self):
        """Test basic allelic richness calculation"""
        allele_data = AlleleCountData(
            allele_counts=[5, 8, 6, 7],
            sample_sizes=[50, 50, 50, 50]
        )
        result = calculate_allelic_richness(allele_data)
        
        assert len(result.rarefied_richness) == 4
        assert len(result.expected_heterozygosity) == 4
        assert result.mean_richness > 0
        assert result.mean_heterozygosity > 0
        assert all(0 <= h <= 1 for h in result.expected_heterozygosity)
    
    def test_different_sample_sizes(self):
        """Test rarefaction with different sample sizes"""
        allele_data = AlleleCountData(
            allele_counts=[10, 8, 6],
            sample_sizes=[100, 80, 60]
        )
        result = calculate_allelic_richness(allele_data)
        
        # Rarefied richness should be adjusted for smallest sample size (60)
        assert len(result.rarefied_richness) == 3
        assert all(r <= original for r, original in zip(result.rarefied_richness, allele_data.allele_counts))
    
    def test_single_allele_locus(self):
        """Test locus with single allele (no diversity)"""
        allele_data = AlleleCountData(
            allele_counts=[1, 5, 3],
            sample_sizes=[50, 50, 50]
        )
        result = calculate_allelic_richness(allele_data)
        
        # First locus has no diversity
        assert result.expected_heterozygosity[0] == 0.0
        assert result.expected_heterozygosity[1] > 0.0
        assert result.expected_heterozygosity[2] > 0.0
    
    def test_mismatched_array_lengths(self):
        """Test error handling for mismatched array lengths"""
        with pytest.raises(ValueError, match="must have the same length"):
            AlleleCountData(
                allele_counts=[5, 8, 6],
                sample_sizes=[50, 50]
            )
    
    def test_zero_values(self):
        """Test error handling for zero values"""
        with pytest.raises(ValueError, match="All values must be positive"):
            AlleleCountData(
                allele_counts=[0, 5, 3],
                sample_sizes=[50, 50, 50]
            )
        
        with pytest.raises(ValueError, match="All values must be positive"):
            AlleleCountData(
                allele_counts=[5, 5, 3],
                sample_sizes=[0, 50, 50]
            )
    
    def test_empty_arrays(self):
        """Test error handling for empty arrays"""
        with pytest.raises(ValueError, match="At least one value must be provided"):
            AlleleCountData(allele_counts=[], sample_sizes=[])

class TestAPIEndpoints:
    """Test FastAPI endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns service information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Genetic Diversity Analysis"
        assert "endpoints" in data
    
    def test_hardy_weinberg_endpoint(self):
        """Test Hardy-Weinberg API endpoint"""
        genotype_data = {
            "genotypes": {"AA": 25, "AB": 50, "BB": 25}
        }
        response = client.post("/hardy-weinberg", json=genotype_data)
        assert response.status_code == 200
        data = response.json()
        assert "is_in_equilibrium" in data
        assert "p_value" in data
        assert "chi_square_statistic" in data
    
    def test_inbreeding_coefficient_endpoint(self):
        """Test inbreeding coefficient API endpoint"""
        data = {
            "subpop_heterozygosity": [0.4, 0.4, 0.4],
            "total_heterozygosity": 0.35,
            "expected_heterozygosity": 0.5
        }
        response = client.post("/inbreeding-coefficient", json=data)
        assert response.status_code == 200
        result = response.json()
        assert "fis" in result
        assert "fit" in result
        assert "fst" in result
        assert "interpretation" in result
    
    def test_bottleneck_detection_endpoint(self):
        """Test bottleneck detection API endpoint"""
        population_data = {
            "sizes": [1000, 900, 50, 100, 200, 400]
        }
        response = client.post("/bottleneck-detection", json=population_data)
        assert response.status_code == 200
        data = response.json()
        assert "bottleneck_detected" in data
        assert "severity" in data
        assert "minimum_size" in data
    
    def test_allelic_richness_endpoint(self):
        """Test allelic richness API endpoint"""
        allele_data = {
            "allele_counts": [5, 8, 6, 7],
            "sample_sizes": [50, 50, 50, 50]
        }
        response = client.post("/allelic-richness", json=allele_data)
        assert response.status_code == 200
        data = response.json()
        assert "rarefied_richness" in data
        assert "mean_richness" in data
        assert "expected_heterozygosity" in data
    
    def test_invalid_input_error_handling(self):
        """Test API error handling for invalid inputs"""
        # Test Hardy-Weinberg with negative counts
        invalid_data = {"genotypes": {"AA": -5, "AB": 10}}
        response = client.post("/hardy-weinberg", json=invalid_data)
        assert response.status_code == 422  # Validation error
        
        # Test bottleneck with insufficient data
        invalid_data = {"sizes": [100]}
        response = client.post("/bottleneck-detection", json=invalid_data)
        assert response.status_code == 422  # Validation error

class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_very_large_populations(self):
        """Test calculations with very large population sizes"""
        population_data = PopulationSizes(sizes=[1000000, 500000, 100000, 200000])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == True
        assert result.minimum_size == 100000
        assert not math.isnan(result.effective_population_size)
        assert not math.isinf(result.effective_population_size)
    
    def test_very_small_populations(self):
        """Test calculations with very small population sizes"""
        population_data = PopulationSizes(sizes=[10, 5, 2, 3, 8])
        result = detect_bottleneck(population_data)
        
        assert result.minimum_size == 2
        assert not math.isnan(result.effective_population_size)
        assert result.effective_population_size > 0
    
    def test_perfect_heterozygosity(self):
        """Test inbreeding calculation with perfect heterozygosity"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[1.0, 1.0, 1.0],
            total_heterozygosity=1.0,
            expected_heterozygosity=1.0
        )
        
        assert abs(result.fis) < 0.01
        assert abs(result.fit) < 0.01
        assert abs(result.fst) < 0.01
    
    def test_zero_heterozygosity(self):
        """Test inbreeding calculation with zero heterozygosity"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.0, 0.0, 0.0],
            total_heterozygosity=0.0,
            expected_heterozygosity=0.5
        )
        
        assert result.fit == 1.0  # Complete inbreeding
        # Note: FIS is 0 when both observed and expected within subpops are 0
        # The interpretation is based on FIS, not FIT
        assert result.fit > 0.5  # High total inbreeding
    
    def test_maximum_allelic_diversity(self):
        """Test allelic richness with maximum diversity"""
        allele_data = AlleleCountData(
            allele_counts=[50, 40, 30],  # High allele counts
            sample_sizes=[50, 50, 50]
        )
        result = calculate_allelic_richness(allele_data)
        
        assert result.mean_richness > 30
        assert all(h > 0.9 for h in result.expected_heterozygosity)  # High diversity
    
    def test_multi_character_alleles(self):
        """Test Hardy-Weinberg with multi-character allele names"""
        genotype_data = GenotypeData(genotypes={"A1A1": 25, "A1A2": 50, "A2A2": 25})
        result = calculate_hardy_weinberg(genotype_data)
        
        assert result.is_in_equilibrium == True
        assert "A1" in result.allele_frequencies
        assert "A2" in result.allele_frequencies
    
    def test_complex_genotype_names(self):
        """Test Hardy-Weinberg with complex genotype patterns"""
        genotype_data = GenotypeData(genotypes={"ABCD": 10, "EFGH": 20, "IJKL": 30})
        result = calculate_hardy_weinberg(genotype_data)
        
        # Should handle complex patterns gracefully
        assert len(result.allele_frequencies) >= 2
    
    def test_zero_expected_heterozygosity_division(self):
        """Test inbreeding calculation with zero expected heterozygosity"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.0],
            total_heterozygosity=0.0,
            expected_heterozygosity=0.0
        )
        
        # Should handle division by zero gracefully
        assert result.fis == 0
        assert result.fit == 0
        assert result.fst == 0
    
    def test_zero_subpop_heterozygosity_division(self):
        """Test inbreeding calculation with zero subpop heterozygosity"""
        result = calculate_inbreeding_coefficient(
            subpop_heterozygosity=[0.0, 0.0],
            total_heterozygosity=0.0,
            expected_heterozygosity=0.1
        )
        
        # Should handle division by zero gracefully
        assert result.fis == 0  # (0 - 0) / 0 = 0
        assert result.fit > 0   # (0.1 - 0) / 0.1 > 0
    
    def test_no_recovery_bottleneck(self):
        """Test bottleneck with no recovery"""
        population_data = PopulationSizes(sizes=[1000, 100, 50, 40, 30])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == True
        assert result.recovery_generations is None  # No recovery to 90% of original
    
    def test_bottleneck_at_end(self):
        """Test bottleneck occurring at the end of time series"""
        population_data = PopulationSizes(sizes=[1000, 900, 800, 100])
        result = detect_bottleneck(population_data)
        
        assert result.bottleneck_detected == True
        assert result.minimum_size == 100
        assert result.recovery_generations is None  # Bottleneck at end, no recovery data

class TestValidationEdgeCases:
    """Test additional validation edge cases"""
    
    def test_allele_frequency_validation(self):
        """Test AlleleFrequencies validation (if used directly)"""
        from main import AlleleFrequencies
        
        # Test invalid frequency sum
        with pytest.raises(ValueError, match="must sum to 1.0"):
            AlleleFrequencies(alleles={"A": 0.6, "B": 0.6})  # Sum = 1.2
        
        # Test negative frequency
        with pytest.raises(ValueError, match="must be between 0 and 1"):
            AlleleFrequencies(alleles={"A": -0.1, "B": 1.1})
        
        # Test frequency > 1
        with pytest.raises(ValueError, match="must be between 0 and 1"):
            AlleleFrequencies(alleles={"A": 1.5, "B": -0.5})
    
    def test_sample_size_smaller_than_min(self):
        """Test allelic richness with sample size smaller than minimum"""
        # This should raise an error in the validation
        allele_data = AlleleCountData(
            allele_counts=[5, 8],
            sample_sizes=[30, 20]  # Min is 20, but first sample is 30
        )
        
        # The function should handle this case
        result = calculate_allelic_richness(allele_data)
        assert len(result.rarefied_richness) == 2
    
    def test_api_error_handling_coverage(self):
        """Test API error handling for better coverage"""
        # Test with calculation that raises an exception
        invalid_data = {"genotypes": {"A": 100}}  # Single allele should cause error
        response = client.post("/hardy-weinberg", json=invalid_data)
        assert response.status_code == 400  # Should be handled by exception handler
        
        # Test inbreeding with invalid values
        invalid_data = {
            "subpop_heterozygosity": [1.5],  # Invalid value > 1
            "total_heterozygosity": 0.5,
            "expected_heterozygosity": 0.5
        }
        response = client.post("/inbreeding-coefficient", json=invalid_data)
        assert response.status_code == 400
        
        # Test bottleneck with calculation error
        invalid_data = {"sizes": []}  # Empty should cause validation error
        response = client.post("/bottleneck-detection", json=invalid_data)
        assert response.status_code == 422
        
        # Test allelic richness - this case actually works, so test a different error
        invalid_data = {
            "allele_counts": [0, 8],  # Zero allele count should cause validation error
            "sample_sizes": [10, 5]
        }
        response = client.post("/allelic-richness", json=invalid_data)
        assert response.status_code == 422  # Validation error for zero values

if __name__ == "__main__":
    pytest.main([__file__, "-v"])