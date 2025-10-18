const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Request logging
  console.log(' Request received:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Response logging
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(' Response sent:', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });

  next();
};

module.exports = requestLogger;