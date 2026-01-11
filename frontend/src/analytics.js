// Google Analytics helper functions for Conservation Biology Toolkit

// Track when users use specific conservation tools
export const trackToolUsage = (toolName, category) => {
  if (window.gtag) {
    window.gtag('event', 'tool_usage', {
      event_category: 'Conservation Tools',
      event_label: toolName,
      tool_category: category,
    });
  }
};

// Track calculation completions
export const trackCalculation = (toolName, calculationType) => {
  if (window.gtag) {
    window.gtag('event', 'calculation_completed', {
      event_category: 'Calculations',
      event_label: toolName,
      calculation_type: calculationType,
    });
  }
};

// Track API endpoint usage
export const trackAPIUsage = (endpoint, service) => {
  if (window.gtag) {
    window.gtag('event', 'api_call', {
      event_category: 'API Usage',
      event_label: endpoint,
      service_name: service,
    });
  }
};

// Track research paper downloads (if you add this feature)
export const trackDownload = (fileName, fileType) => {
  if (window.gtag) {
    window.gtag('event', 'file_download', {
      event_category: 'Downloads',
      event_label: fileName,
      file_type: fileType,
    });
  }
};

// Track user engagement with specific conservation categories
export const trackCategoryEngagement = (category, action) => {
  if (window.gtag) {
    window.gtag('event', 'category_engagement', {
      event_category: 'Conservation Categories',
      event_label: category,
      engagement_action: action,
    });
  }
};

// Track navigation patterns from home page
export const trackNavigation = (fromPage, toPage, elementType) => {
  if (window.gtag) {
    window.gtag('event', 'navigation', {
      event_category: 'User Navigation',
      event_label: `${fromPage} → ${toPage}`,
      navigation_type: elementType,
    });
  }
};

// Track user interest in specific tools
export const trackToolInterest = (toolName, categoryName, interactionType) => {
  if (window.gtag) {
    window.gtag('event', 'tool_interest', {
      event_category: 'Tool Interest',
      event_label: toolName,
      tool_category: categoryName,
      interaction_type: interactionType,
    });
  }
};

// Track errors in conservation tools
export const trackError = (toolName, errorType, errorDetails, errorCode = null) => {
  if (window.gtag) {
    window.gtag('event', 'tool_error', {
      event_category: 'Errors',
      event_label: toolName,
      error_type: errorType,
      error_details: errorDetails,
      error_code: errorCode,
      value: 1
    });
  }
};

// Track performance metrics for conservation calculations
export const trackPerformance = (toolName, metricType, duration, additionalData = null) => {
  if (window.gtag) {
    window.gtag('event', 'performance_metric', {
      event_category: 'Performance',
      event_label: toolName,
      metric_type: metricType,
      value: Math.round(duration),
      additional_data: additionalData
    });
  }
};

// Track user abandonment (started but didn't complete)
export const trackAbandonment = (toolName, stage, timeSpent = null) => {
  if (window.gtag) {
    window.gtag('event', 'tool_abandonment', {
      event_category: 'User Behavior',
      event_label: toolName,
      abandonment_stage: stage,
      time_spent: timeSpent ? Math.round(timeSpent) : null,
      value: 1
    });
  }
};

// Track form interactions and validation issues
export const trackFormInteraction = (toolName, fieldName, interactionType, isValid = true) => {
  if (window.gtag) {
    window.gtag('event', 'form_interaction', {
      event_category: 'Form Usage',
      event_label: toolName,
      field_name: fieldName,
      interaction_type: interactionType,
      is_valid: isValid,
      value: isValid ? 0 : 1 // Count invalid interactions
    });
  }
};

// Track user session patterns
export const trackSessionEvent = (eventType, details = null) => {
  if (window.gtag) {
    window.gtag('event', 'session_event', {
      event_category: 'User Session',
      event_label: eventType,
      session_details: details,
      value: 1
    });
  }
};

// Comprehensive API call wrapper with automatic error and performance tracking
export const trackApiCall = async (toolName, apiFunction, inputData = null) => {
  const startTime = performance.now();
  
  try {
    // Track API call start
    trackPerformance(toolName, 'api_call_start', 0);
    
    // Execute the API call
    const result = await apiFunction();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Track successful completion
    trackPerformance(toolName, 'api_response_time', duration);
    trackCalculation(toolName, 'api_success');
    
    return result;
    
  } catch (error) {
    // Calculate duration even for failed calls
    const duration = performance.now() - startTime;
    
    // Track the error with detailed information
    const errorType = error.response?.status ? `http_${error.response.status}` : 'network_error';
    const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
    
    trackError(toolName, errorType, errorMessage, error.response?.status);
    trackPerformance(toolName, 'failed_api_call_time', duration);
    
    // Re-throw the error so the component can handle it
    throw error;
  }
};

// Track user engagement time on pages
let pageStartTime = null;
let currentPage = null;

export const startPageTracking = (pageName) => {
  // Track previous page time if exists
  if (pageStartTime && currentPage) {
    const timeSpent = performance.now() - pageStartTime;
    trackPerformance(currentPage, 'page_time_spent', timeSpent);
  }
  
  // Start tracking new page
  pageStartTime = performance.now();
  currentPage = pageName;
  trackSessionEvent('page_enter', pageName);
};

export const endPageTracking = () => {
  if (pageStartTime && currentPage) {
    const timeSpent = performance.now() - pageStartTime;
    trackPerformance(currentPage, 'page_time_spent', timeSpent);
    trackSessionEvent('page_exit', currentPage);
    pageStartTime = null;
    currentPage = null;
  }
};

// Advanced analytics for conservation research insights
export const trackResearchMetrics = (toolName, researchType, parameters = {}) => {
  if (window.gtag) {
    window.gtag('event', 'research_activity', {
      event_category: 'Conservation Research',
      event_label: toolName,
      research_type: researchType,
      parameter_count: Object.keys(parameters).length,
      complexity_score: calculateComplexityScore(parameters),
      value: 1
    });
  }
};

// Calculate complexity score based on input parameters
const calculateComplexityScore = (parameters) => {
  let score = 0;
  Object.values(parameters).forEach(value => {
    if (Array.isArray(value)) score += value.length;
    else if (typeof value === 'string' && value.includes(',')) score += value.split(',').length;
    else score += 1;
  });
  return Math.min(score, 10); // Cap at 10 for analytics
};

// Track user expertise level based on parameter usage
export const trackUserExpertise = (toolName, advancedFeaturesUsed = 0, totalFeatures = 1) => {
  const expertiseLevel = advancedFeaturesUsed / totalFeatures;
  
  if (window.gtag) {
    window.gtag('event', 'user_expertise', {
      event_category: 'User Behavior',
      event_label: toolName,
      expertise_level: expertiseLevel > 0.7 ? 'advanced' : expertiseLevel > 0.3 ? 'intermediate' : 'beginner',
      advanced_features_used: advancedFeaturesUsed,
      total_features: totalFeatures,
      value: Math.round(expertiseLevel * 100)
    });
  }
};

// Track conservation impact potential
export const trackConservationImpact = (toolName, impactCategory, speciesCount = null, areaSize = null) => {
  if (window.gtag) {
    window.gtag('event', 'conservation_impact', {
      event_category: 'Conservation Impact',
      event_label: toolName,
      impact_category: impactCategory, // 'species_protection', 'habitat_conservation', 'population_management'
      species_count: speciesCount,
      area_size: areaSize,
      value: 1
    });
  }
};