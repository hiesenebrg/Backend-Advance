class RateLimiterMiddleware {
  constructor(options) {
    this.maxRequests = options.maxRequests;
    this.timeWindow = options.timeWindow;
    this.rateLimitStore = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const clientIp = req.ip; // Retrieve the client's IP address
      const currentTime = Date.now();

      // Retrieve or initialize client request data
      let clientData = this.rateLimitStore.get(clientIp);

      if (!clientData) {
        clientData = {
          requestCount: 0,
          firstRequestTime: currentTime,
        };
        this.rateLimitStore.set(clientIp, clientData);
      }

      const elapsedTime = currentTime - clientData.firstRequestTime;

      if (elapsedTime >= this.timeWindow) {
        // Reset the rate limit for the client
        clientData.requestCount = 1;
        clientData.firstRequestTime = currentTime;
      } else {
        // Increment the request count
        clientData.requestCount++;
      }

      // Check if the client has exceeded the rate limit
      if (clientData.requestCount > this.maxRequests) {
        res.setHeader("X-RateLimit-Limit", this.maxRequests);
        res.setHeader("X-RateLimit-Remaining", 0);
        res.setHeader(
          "X-RateLimit-Reset",
          clientData.firstRequestTime + this.timeWindow
        );
        return res
          .status(429)
          .json({ message: "You have exceeded the rate limit. Please try again later." });
      }

      // Update the headers
      res.setHeader("X-RateLimit-Limit", this.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        this.maxRequests - clientData.requestCount
      );
      res.setHeader(
        "X-RateLimit-Reset",
        clientData.firstRequestTime + this.timeWindow
      );

      this.rateLimitStore.set(clientIp, clientData);

      next(); // Proceed to the next middleware or route handler
    };
  }

  reset() {
    // Clear all rate limit data
    this.rateLimitStore.clear();
  }
}

module.exports = RateLimiterMiddleware;
