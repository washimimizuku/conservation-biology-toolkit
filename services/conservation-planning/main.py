"""
Conservation Planning Service

This service provides tools for systematic conservation planning and prioritization
for conservation biology applications. Focuses on mathematical models and algorithms
that don't require external data sources or mapping capabilities.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Tuple, Any, Union
import math
import numpy as np
from itertools import combinations

app = FastAPI(
    title="Conservation Planning Service",
    description="Tools for systematic conservation planning and prioritization",
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

class ConservationPriorityRequest(BaseModel):
    """Request model for conservation priority analysis"""
    sites: List[Dict[str, Any]] = Field(..., description="List of sites with attributes")
    weights: Dict[str, float] = Field(..., description="Weights for different criteria")
    
    @field_validator('sites')
    @classmethod
    def validate_sites(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 sites are required for analysis")
        return v
    
    @field_validator('weights')
    @classmethod
    def validate_weights(cls, v):
        if not v:
            raise ValueError("At least one weight must be specified")
        total_weight = sum(v.values())
        if abs(total_weight - 1.0) > 0.01:
            raise ValueError("Weights must sum to approximately 1.0")
        return v

class ConservationPriorityResponse(BaseModel):
    """Response model for conservation priority analysis"""
    site_rankings: List[Dict[str, Any]] = Field(..., description="Sites ranked by priority")
    priority_scores: List[float] = Field(..., description="Normalized priority scores")
    top_sites: List[Dict[str, Any]] = Field(..., description="Top priority sites")
    criteria_analysis: Dict[str, Dict[str, float]] = Field(..., description="Analysis by criteria")
    recommendations: List[str] = Field(..., description="Conservation recommendations")

class ThreatAssessmentRequest(BaseModel):
    """Request model for threat assessment matrix"""
    threats: List[Dict[str, Any]] = Field(..., description="List of threats with attributes")
    species_vulnerability: Dict[str, float] = Field(..., description="Species vulnerability scores")
    
    @field_validator('threats')
    @classmethod
    def validate_threats(cls, v):
        if len(v) < 1:
            raise ValueError("At least 1 threat must be specified")
        for threat in v:
            if 'name' not in threat or 'severity' not in threat or 'scope' not in threat:
                raise ValueError("Each threat must have name, severity, and scope")
        return v

class ThreatAssessmentResponse(BaseModel):
    """Response model for threat assessment matrix"""
    threat_rankings: List[Dict[str, Any]] = Field(..., description="Threats ranked by impact")
    overall_threat_score: float = Field(..., description="Overall threat level (0-1)")
    threat_matrix: List[List[float]] = Field(..., description="Threat impact matrix")
    priority_threats: List[str] = Field(..., description="Highest priority threats")
    mitigation_strategies: List[str] = Field(..., description="Recommended mitigation strategies")

class CostEffectivenessRequest(BaseModel):
    """Request model for cost-effectiveness analysis"""
    actions: List[Dict[str, Any]] = Field(..., description="Conservation actions with costs and benefits")
    budget_constraint: float = Field(..., gt=0, description="Available budget")
    
    @field_validator('actions')
    @classmethod
    def validate_actions(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 actions are required for analysis")
        for action in v:
            if 'name' not in action or 'cost' not in action or 'benefit' not in action:
                raise ValueError("Each action must have name, cost, and benefit")
            if action['cost'] <= 0:
                raise ValueError("Action costs must be positive")
        return v

class CostEffectivenessResponse(BaseModel):
    """Response model for cost-effectiveness analysis"""
    ranked_actions: List[Dict[str, Any]] = Field(..., description="Actions ranked by cost-effectiveness")
    optimal_portfolio: List[Dict[str, Any]] = Field(..., description="Optimal action portfolio within budget")
    total_cost: float = Field(..., description="Total cost of optimal portfolio")
    total_benefit: float = Field(..., description="Total benefit of optimal portfolio")
    efficiency_ratio: float = Field(..., description="Benefit per unit cost")
    budget_utilization: float = Field(..., description="Percentage of budget used")
    recommendations: List[str] = Field(..., description="Investment recommendations")

class ReserveSelectionRequest(BaseModel):
    """Request model for reserve selection optimization"""
    sites: List[Dict[str, Any]] = Field(..., description="Candidate sites with species and costs")
    species_targets: Dict[str, int] = Field(..., description="Target representation for each species")
    budget_limit: Optional[float] = Field(None, description="Budget constraint (optional)")
    
    @field_validator('sites')
    @classmethod
    def validate_sites(cls, v):
        if len(v) < 2:
            raise ValueError("At least 2 sites are required for selection")
        for site in v:
            if 'name' not in site or 'cost' not in site or 'species' not in site:
                raise ValueError("Each site must have name, cost, and species list")
        return v

class ReserveSelectionResponse(BaseModel):
    """Response model for reserve selection optimization"""
    selected_sites: List[Dict[str, Any]] = Field(..., description="Optimal site selection")
    total_cost: float = Field(..., description="Total cost of selected sites")
    species_coverage: Dict[str, Dict[str, Any]] = Field(..., description="Species representation achieved")
    coverage_summary: Dict[str, float] = Field(..., description="Overall coverage statistics")
    efficiency_metrics: Dict[str, float] = Field(..., description="Selection efficiency metrics")
    alternative_solutions: List[Dict[str, Any]] = Field(..., description="Alternative site combinations")
    recommendations: List[str] = Field(..., description="Reserve design recommendations")

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Conservation Planning Service",
        "version": "1.0.0",
        "description": "Tools for systematic conservation planning and prioritization",
        "endpoints": [
            "/conservation-priority",
            "/threat-assessment",
            "/cost-effectiveness",
            "/reserve-selection"
        ]
    }

@app.post("/conservation-priority", response_model=ConservationPriorityResponse)
async def analyze_conservation_priority(request: ConservationPriorityRequest):
    """
    Analyze conservation priority using multi-criteria decision analysis.
    
    Ranks sites based on weighted criteria such as biodiversity value,
    threat level, feasibility, and cost-effectiveness.
    """
    try:
        sites = request.sites
        weights = request.weights
        
        # Calculate priority scores for each site
        site_scores = []
        criteria_stats = {criterion: {'min': float('inf'), 'max': float('-inf'), 'avg': 0} 
                         for criterion in weights.keys()}
        
        # First pass: collect statistics for normalization
        for site in sites:
            for criterion in weights.keys():
                if criterion in site:
                    value = site[criterion]
                    criteria_stats[criterion]['min'] = min(criteria_stats[criterion]['min'], value)
                    criteria_stats[criterion]['max'] = max(criteria_stats[criterion]['max'], value)
        
        # Calculate averages
        for criterion in criteria_stats:
            values = [site.get(criterion, 0) for site in sites]
            criteria_stats[criterion]['avg'] = sum(values) / len(values)
        
        # Second pass: calculate normalized scores
        for i, site in enumerate(sites):
            total_score = 0
            site_analysis = {'site_index': i, 'name': site.get('name', f'Site_{i+1}')}
            
            for criterion, weight in weights.items():
                if criterion in site:
                    raw_value = site[criterion]
                    # Normalize to 0-1 scale
                    min_val = criteria_stats[criterion]['min']
                    max_val = criteria_stats[criterion]['max']
                    
                    if max_val > min_val:
                        normalized_value = (raw_value - min_val) / (max_val - min_val)
                    else:
                        normalized_value = 1.0  # All values are the same
                    
                    # For negative criteria (like threats), invert the score
                    if criterion.lower() in ['threat', 'cost', 'risk', 'difficulty']:
                        normalized_value = 1.0 - normalized_value
                    
                    weighted_score = normalized_value * weight
                    total_score += weighted_score
                    site_analysis[f'{criterion}_score'] = round(weighted_score, 3)
                    site_analysis[f'{criterion}_raw'] = raw_value
            
            site_analysis['total_score'] = round(total_score, 3)
            site_analysis['site_data'] = site
            site_scores.append(site_analysis)
        
        # Sort by total score (descending)
        site_scores.sort(key=lambda x: x['total_score'], reverse=True)
        
        # Extract priority scores and create rankings
        priority_scores = [site['total_score'] for site in site_scores]
        
        # Top sites (top 25% or minimum 3)
        top_count = max(3, len(sites) // 4)
        top_sites = site_scores[:top_count]
        
        # Criteria analysis
        criteria_analysis = {}
        for criterion in weights.keys():
            criterion_values = [site.get(criterion, 0) for site in sites]
            criteria_analysis[criterion] = {
                'weight': weights[criterion],
                'min_value': min(criterion_values),
                'max_value': max(criterion_values),
                'average': sum(criterion_values) / len(criterion_values),
                'range': max(criterion_values) - min(criterion_values)
            }
        
        # Generate recommendations
        recommendations = generate_priority_recommendations(site_scores, criteria_analysis, weights)
        
        return ConservationPriorityResponse(
            site_rankings=site_scores,
            priority_scores=priority_scores,
            top_sites=top_sites,
            criteria_analysis=criteria_analysis,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis error: {str(e)}")

@app.post("/threat-assessment", response_model=ThreatAssessmentResponse)
async def analyze_threat_assessment(request: ThreatAssessmentRequest):
    """
    Conduct systematic threat assessment using threat impact matrix.
    
    Evaluates threats based on severity, scope, and species vulnerability
    to prioritize conservation actions.
    """
    try:
        threats = request.threats
        species_vulnerability = request.species_vulnerability
        
        # Calculate threat impact scores
        threat_impacts = []
        threat_matrix = []
        
        for i, threat in enumerate(threats):
            threat_name = threat['name']
            severity = threat['severity']  # 0-1 scale
            scope = threat['scope']        # 0-1 scale
            urgency = threat.get('urgency', 0.5)  # 0-1 scale, default 0.5
            
            # Calculate base threat score
            base_score = (severity * 0.4 + scope * 0.4 + urgency * 0.2)
            
            # Calculate species-specific impacts
            species_impacts = []
            for species, vulnerability in species_vulnerability.items():
                # Threat impact = base threat score * species vulnerability
                impact = base_score * vulnerability
                species_impacts.append(impact)
            
            threat_matrix.append(species_impacts)
            
            # Overall threat impact (average across species, weighted by vulnerability)
            total_vulnerability = sum(species_vulnerability.values())
            if total_vulnerability > 0:
                weighted_impact = sum(impact * vuln for impact, vuln in 
                                    zip(species_impacts, species_vulnerability.values())) / total_vulnerability
            else:
                weighted_impact = base_score
            
            threat_impacts.append({
                'name': threat_name,
                'severity': severity,
                'scope': scope,
                'urgency': urgency,
                'base_score': round(base_score, 3),
                'weighted_impact': round(weighted_impact, 3),
                'species_impacts': [round(imp, 3) for imp in species_impacts],
                'threat_index': i
            })
        
        # Sort threats by weighted impact (descending)
        threat_impacts.sort(key=lambda x: x['weighted_impact'], reverse=True)
        
        # Calculate overall threat score
        if threat_impacts:
            overall_threat_score = sum(t['weighted_impact'] for t in threat_impacts) / len(threat_impacts)
        else:
            overall_threat_score = 0.0
        
        # Identify priority threats (top 50% or minimum 2)
        priority_count = max(2, len(threats) // 2)
        priority_threats = [t['name'] for t in threat_impacts[:priority_count]]
        
        # Generate mitigation strategies
        mitigation_strategies = generate_mitigation_strategies(threat_impacts, overall_threat_score)
        
        return ThreatAssessmentResponse(
            threat_rankings=threat_impacts,
            overall_threat_score=round(overall_threat_score, 3),
            threat_matrix=[[round(val, 3) for val in row] for row in threat_matrix],
            priority_threats=priority_threats,
            mitigation_strategies=mitigation_strategies
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Assessment error: {str(e)}")

@app.post("/cost-effectiveness", response_model=CostEffectivenessResponse)
async def analyze_cost_effectiveness(request: CostEffectivenessRequest):
    """
    Analyze cost-effectiveness of conservation actions using benefit-cost ratios.
    
    Optimizes conservation investment by ranking actions and selecting
    the most efficient portfolio within budget constraints.
    """
    try:
        actions = request.actions
        budget = request.budget_constraint
        
        # Calculate cost-effectiveness ratios
        action_analysis = []
        for i, action in enumerate(actions):
            name = action['name']
            cost = action['cost']
            benefit = action['benefit']
            
            # Cost-effectiveness ratio (benefit per unit cost)
            ce_ratio = benefit / cost if cost > 0 else 0
            
            # Additional metrics
            roi = ((benefit - cost) / cost * 100) if cost > 0 else 0  # Return on investment %
            
            action_analysis.append({
                'name': name,
                'cost': cost,
                'benefit': benefit,
                'ce_ratio': round(ce_ratio, 4),
                'roi_percent': round(roi, 2),
                'action_index': i,
                'original_data': action
            })
        
        # Sort by cost-effectiveness ratio (descending)
        ranked_actions = sorted(action_analysis, key=lambda x: x['ce_ratio'], reverse=True)
        
        # Greedy algorithm for optimal portfolio selection within budget
        optimal_portfolio = []
        remaining_budget = budget
        total_benefit = 0
        
        # Sort actions by CE ratio for greedy selection
        for action in ranked_actions:
            if action['cost'] <= remaining_budget:
                optimal_portfolio.append(action)
                remaining_budget -= action['cost']
                total_benefit += action['benefit']
        
        total_cost = budget - remaining_budget
        
        # Calculate efficiency metrics
        if total_cost > 0:
            efficiency_ratio = total_benefit / total_cost
        else:
            efficiency_ratio = 0
        
        budget_utilization = (total_cost / budget) * 100
        
        # Generate recommendations
        recommendations = generate_investment_recommendations(
            ranked_actions, optimal_portfolio, budget_utilization, efficiency_ratio
        )
        
        return CostEffectivenessResponse(
            ranked_actions=ranked_actions,
            optimal_portfolio=optimal_portfolio,
            total_cost=round(total_cost, 2),
            total_benefit=round(total_benefit, 2),
            efficiency_ratio=round(efficiency_ratio, 4),
            budget_utilization=round(budget_utilization, 1),
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis error: {str(e)}")

@app.post("/reserve-selection", response_model=ReserveSelectionResponse)
async def optimize_reserve_selection(request: ReserveSelectionRequest):
    """
    Optimize reserve selection using simplified set cover algorithms.
    
    Selects the most efficient combination of sites to achieve species
    representation targets while minimizing costs.
    """
    try:
        sites = request.sites
        species_targets = request.species_targets
        budget_limit = request.budget_limit
        
        # Extract all species mentioned
        all_species = set()
        for site in sites:
            all_species.update(site.get('species', []))
        
        # Validate that all target species exist in sites
        target_species = set(species_targets.keys())
        missing_species = target_species - all_species
        if missing_species:
            raise ValueError(f"Target species not found in any site: {missing_species}")
        
        # Greedy algorithm for set cover problem
        selected_sites = []
        remaining_targets = species_targets.copy()
        available_sites = [(i, site) for i, site in enumerate(sites)]
        total_cost = 0
        
        while remaining_targets and available_sites:
            best_site = None
            best_efficiency = 0
            best_index = -1
            
            for i, (site_idx, site) in enumerate(available_sites):
                site_species = set(site.get('species', []))
                site_cost = site.get('cost', 0)
                
                # Calculate how many remaining targets this site covers
                covered_targets = 0
                for species in site_species:
                    if species in remaining_targets and remaining_targets[species] > 0:
                        covered_targets += 1
                
                # Calculate efficiency (targets covered per unit cost)
                if site_cost > 0 and covered_targets > 0:
                    efficiency = covered_targets / site_cost
                else:
                    efficiency = covered_targets  # Free sites get high priority
                
                # Check budget constraint
                if budget_limit is None or (total_cost + site_cost) <= budget_limit:
                    if efficiency > best_efficiency:
                        best_efficiency = efficiency
                        best_site = site
                        best_index = i
                        best_site_idx = site_idx
            
            if best_site is None:
                break  # No more feasible sites
            
            # Add best site to selection
            selected_sites.append({
                'site_index': best_site_idx,
                'name': best_site.get('name', f'Site_{best_site_idx+1}'),
                'cost': best_site.get('cost', 0),
                'species': best_site.get('species', []),
                'efficiency': round(best_efficiency, 4),
                'site_data': best_site
            })
            
            total_cost += best_site.get('cost', 0)
            
            # Update remaining targets
            for species in best_site.get('species', []):
                if species in remaining_targets:
                    remaining_targets[species] = max(0, remaining_targets[species] - 1)
            
            # Remove species that have met their targets
            remaining_targets = {k: v for k, v in remaining_targets.items() if v > 0}
            
            # Remove selected site from available sites
            available_sites.pop(best_index)
        
        # Calculate species coverage
        species_coverage = {}
        for species in target_species:
            target = species_targets[species]
            achieved = 0
            covering_sites = []
            
            for selected_site in selected_sites:
                if species in selected_site['species']:
                    achieved += 1
                    covering_sites.append(selected_site['name'])
            
            coverage_percent = (achieved / target * 100) if target > 0 else 100
            species_coverage[species] = {
                'target': target,
                'achieved': achieved,
                'coverage_percent': round(coverage_percent, 1),
                'covering_sites': covering_sites,
                'gap': max(0, target - achieved)
            }
        
        # Coverage summary statistics
        coverage_values = [sc['coverage_percent'] for sc in species_coverage.values()]
        coverage_summary = {
            'total_species': len(target_species),
            'fully_covered_species': sum(1 for sc in species_coverage.values() if sc['coverage_percent'] >= 100),
            'average_coverage': round(sum(coverage_values) / len(coverage_values), 1) if coverage_values else 0,
            'min_coverage': min(coverage_values) if coverage_values else 0,
            'species_with_gaps': sum(1 for sc in species_coverage.values() if sc['gap'] > 0)
        }
        
        # Efficiency metrics
        efficiency_metrics = {
            'sites_selected': len(selected_sites),
            'total_sites_available': len(sites),
            'selection_efficiency': round(len(selected_sites) / len(sites) * 100, 1),
            'cost_per_species': round(total_cost / len(target_species), 2) if target_species else 0,
            'average_site_cost': round(total_cost / len(selected_sites), 2) if selected_sites else 0
        }
        
        # Generate alternative solutions (simple heuristic)
        alternative_solutions = generate_alternative_solutions(sites, species_targets, budget_limit, selected_sites)
        
        # Generate recommendations
        recommendations = generate_reserve_recommendations(
            selected_sites, species_coverage, coverage_summary, efficiency_metrics, remaining_targets
        )
        
        return ReserveSelectionResponse(
            selected_sites=selected_sites,
            total_cost=round(total_cost, 2),
            species_coverage=species_coverage,
            coverage_summary=coverage_summary,
            efficiency_metrics=efficiency_metrics,
            alternative_solutions=alternative_solutions,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Optimization error: {str(e)}")

# Helper functions

def generate_priority_recommendations(site_scores, criteria_analysis, weights):
    """Generate conservation priority recommendations"""
    recommendations = []
    
    if site_scores:
        top_site = site_scores[0]
        recommendations.append(f"Prioritize {top_site['name']} with highest score of {top_site['total_score']}")
        
        # Identify most important criteria
        max_weight_criterion = max(weights.items(), key=lambda x: x[1])
        recommendations.append(f"Focus on {max_weight_criterion[0]} (weight: {max_weight_criterion[1]}) as primary criterion")
        
        # Check for low-scoring sites
        low_scoring = [s for s in site_scores if s['total_score'] < 0.3]
        if low_scoring:
            recommendations.append(f"Consider excluding {len(low_scoring)} low-priority sites to focus resources")
        
        # Identify criteria with high variation
        high_variation_criteria = []
        for criterion, stats in criteria_analysis.items():
            if stats['range'] > stats['average']:
                high_variation_criteria.append(criterion)
        
        if high_variation_criteria:
            recommendations.append(f"High variation in {', '.join(high_variation_criteria)} suggests targeted strategies needed")
    
    recommendations.append("Regularly reassess priorities as conditions change")
    recommendations.append("Consider stakeholder input in final site selection")
    
    return recommendations

def generate_mitigation_strategies(threat_impacts, overall_threat_score):
    """Generate threat mitigation strategies"""
    strategies = []
    
    if threat_impacts:
        top_threat = threat_impacts[0]
        strategies.append(f"Address {top_threat['name']} as highest priority threat (impact: {top_threat['weighted_impact']})")
        
        # Strategies based on threat characteristics
        high_severity_threats = [t for t in threat_impacts if t['severity'] > 0.7]
        if high_severity_threats:
            strategies.append("Implement immediate interventions for high-severity threats")
        
        high_scope_threats = [t for t in threat_impacts if t['scope'] > 0.7]
        if high_scope_threats:
            strategies.append("Develop landscape-scale management for widespread threats")
        
        urgent_threats = [t for t in threat_impacts if t.get('urgency', 0.5) > 0.7]
        if urgent_threats:
            strategies.append("Establish rapid response protocols for urgent threats")
    
    if overall_threat_score > 0.7:
        strategies.append("Overall threat level is high - consider emergency conservation measures")
    elif overall_threat_score < 0.3:
        strategies.append("Threat level is manageable - focus on prevention and monitoring")
    
    strategies.append("Develop threat monitoring and early warning systems")
    strategies.append("Engage stakeholders in threat mitigation planning")
    
    return strategies

def generate_investment_recommendations(ranked_actions, optimal_portfolio, budget_utilization, efficiency_ratio):
    """Generate investment recommendations"""
    recommendations = []
    
    if ranked_actions:
        top_action = ranked_actions[0]
        recommendations.append(f"Prioritize {top_action['name']} with highest cost-effectiveness ratio of {top_action['ce_ratio']}")
    
    if budget_utilization < 80:
        recommendations.append(f"Budget utilization is {budget_utilization:.1f}% - consider additional actions")
    elif budget_utilization > 95:
        recommendations.append("Budget is fully utilized - excellent resource allocation")
    
    if efficiency_ratio > 2.0:
        recommendations.append("High efficiency ratio indicates excellent investment choices")
    elif efficiency_ratio < 1.0:
        recommendations.append("Low efficiency ratio suggests reviewing action selection")
    
    # Check for high-ROI actions not in portfolio
    high_roi_excluded = [a for a in ranked_actions if a['roi_percent'] > 50 and a not in optimal_portfolio]
    if high_roi_excluded:
        recommendations.append("Consider reallocating budget to include high-ROI actions")
    
    recommendations.append("Monitor action outcomes to validate benefit estimates")
    recommendations.append("Consider phased implementation for large-scale actions")
    
    return recommendations

def generate_alternative_solutions(sites, species_targets, budget_limit, current_selection):
    """Generate alternative reserve selection solutions"""
    alternatives = []
    
    # Alternative 1: Lowest cost solution
    cost_sorted_sites = sorted(sites, key=lambda x: x.get('cost', 0))
    low_cost_selection = []
    low_cost_total = 0
    covered_species = set()
    
    for site in cost_sorted_sites:
        site_cost = site.get('cost', 0)
        if budget_limit is None or (low_cost_total + site_cost) <= budget_limit:
            site_species = set(site.get('species', []))
            new_species = site_species - covered_species
            if new_species:  # Only add if it covers new species
                low_cost_selection.append({
                    'name': site.get('name', 'Unnamed'),
                    'cost': site_cost,
                    'species_count': len(site_species)
                })
                low_cost_total += site_cost
                covered_species.update(site_species)
                
                if len(low_cost_selection) >= 5:  # Limit to 5 sites
                    break
    
    if low_cost_selection:
        alternatives.append({
            'strategy': 'Lowest Cost',
            'sites': low_cost_selection,
            'total_cost': round(low_cost_total, 2),
            'species_covered': len(covered_species)
        })
    
    # Alternative 2: Maximum species coverage
    species_rich_sites = sorted(sites, key=lambda x: len(x.get('species', [])), reverse=True)
    rich_selection = []
    rich_total = 0
    rich_covered = set()
    
    for site in species_rich_sites[:5]:  # Top 5 species-rich sites
        site_cost = site.get('cost', 0)
        if budget_limit is None or (rich_total + site_cost) <= budget_limit:
            rich_selection.append({
                'name': site.get('name', 'Unnamed'),
                'cost': site_cost,
                'species_count': len(site.get('species', []))
            })
            rich_total += site_cost
            rich_covered.update(site.get('species', []))
    
    if rich_selection:
        alternatives.append({
            'strategy': 'Maximum Species Coverage',
            'sites': rich_selection,
            'total_cost': round(rich_total, 2),
            'species_covered': len(rich_covered)
        })
    
    return alternatives

def generate_reserve_recommendations(selected_sites, species_coverage, coverage_summary, efficiency_metrics, remaining_targets):
    """Generate reserve selection recommendations"""
    recommendations = []
    
    if selected_sites:
        recommendations.append(f"Selected {len(selected_sites)} sites achieving {coverage_summary['average_coverage']:.1f}% average species coverage")
    
    if coverage_summary['species_with_gaps'] > 0:
        recommendations.append(f"{coverage_summary['species_with_gaps']} species have coverage gaps - consider additional sites")
    
    if efficiency_metrics['selection_efficiency'] < 20:
        recommendations.append("Efficient selection using only a small fraction of available sites")
    elif efficiency_metrics['selection_efficiency'] > 50:
        recommendations.append("Large proportion of sites selected - review if all are necessary")
    
    # Species-specific recommendations
    low_coverage_species = [sp for sp, data in species_coverage.items() if data['coverage_percent'] < 50]
    if low_coverage_species:
        recommendations.append(f"Focus additional efforts on {', '.join(low_coverage_species[:3])} with low coverage")
    
    if remaining_targets:
        recommendations.append("Some species targets not fully met - consider expanding reserve network")
    else:
        recommendations.append("All species representation targets achieved - excellent coverage")
    
    recommendations.append("Implement adaptive management to respond to changing conditions")
    recommendations.append("Establish connectivity corridors between selected reserves")
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)