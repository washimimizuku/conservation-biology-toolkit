import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { trackError } from '../analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Track the error in Google Analytics
    const errorMessage = error.message || 'Unknown React error';
    const componentStack = errorInfo.componentStack || 'Unknown component';
    
    trackError(
      this.props.toolName || 'React Application',
      'react_error',
      errorMessage,
      null
    );

    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Track recovery attempt
    trackError(
      this.props.toolName || 'React Application',
      'error_recovery_attempt',
      'User clicked reload',
      null
    );
    
    // Reset error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Reload the page if needed
    if (this.props.reloadOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong with this conservation tool
            </Typography>
            <Typography variant="body2" paragraph>
              We've recorded this error and will work to fix it. You can try reloading the tool or 
              navigate to a different conservation tool.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={this.handleReload}
                sx={{ mr: 1 }}
              >
                Try Again
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;