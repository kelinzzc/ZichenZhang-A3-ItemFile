const errorHandler = (err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // MySQL error handling
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          success: false,
          error: 'Data already exists',
          message: 'This record already exists and cannot be created again',
          code: 'DUPLICATE_ENTRY'
        });
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(404).json({
          success: false,
          error: 'Related data does not exist',
          message: 'The referenced data does not exist',
          code: 'REFERENCE_NOT_FOUND'
        });
      case 'ER_ROW_IS_REFERENCED':
      case 'ER_ROW_IS_REFERENCED_2':
        return res.status(409).json({
          success: false,
          error: 'Data is referenced',
          message: 'This data is referenced by other data and cannot be deleted',
          code: 'ROW_REFERENCED'
        });
    }
  }

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Data validation failed',
      message: err.message,
      details: err.details,
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication token is invalid',
      code: 'INVALID_TOKEN'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'The server encountered an error, please try again later',
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;