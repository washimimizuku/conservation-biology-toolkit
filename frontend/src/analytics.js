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