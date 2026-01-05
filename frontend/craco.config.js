module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    // Remove the problematic onAfterSetupMiddleware
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    }
  }
};