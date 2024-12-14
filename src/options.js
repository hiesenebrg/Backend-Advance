const rateLimiterOptions = {
    maxRequests: 5, // Maximum requests allowed within the time window
    timeWindow: 1000, // Time window in milliseconds (1 second)
  };
  
  module.exports = rateLimiterOptions;
  
