const rateLimit = require('express-rate-limit');

// development ips to skip
const skipIPs = ['127.0.0.1', '::1'];

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many requests' },
  skip: (req, res) => {
    const clientIP = req.ip;
    return skipIPs.includes(clientIP);
  },
});

module.exports = {
  authLimiter,
};
