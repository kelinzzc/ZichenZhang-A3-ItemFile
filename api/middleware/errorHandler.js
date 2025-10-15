/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 服务器错误:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // MySQL错误处理
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          success: false,
          error: '数据已存在',
          message: '该记录已存在，无法重复创建',
          code: 'DUPLICATE_ENTRY'
        });
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(404).json({
          success: false,
          error: '关联数据不存在',
          message: '引用的数据不存在',
          code: 'REFERENCE_NOT_FOUND'
        });
      case 'ER_ROW_IS_REFERENCED':
      case 'ER_ROW_IS_REFERENCED_2':
        return res.status(409).json({
          success: false,
          error: '数据被引用',
          message: '该数据已被其他数据引用，无法删除',
          code: 'ROW_REFERENCED'
        });
    }
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: '数据验证失败',
      message: err.message,
      details: err.details,
      code: 'VALIDATION_ERROR'
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '令牌无效',
      message: '身份验证令牌无效',
      code: 'INVALID_TOKEN'
    });
  }

  // 默认错误响应
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: '内部服务器错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器遇到错误，请稍后重试',
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // 开发环境下包含堆栈信息
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;