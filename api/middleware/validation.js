/**
 * 数据验证中间件
 */

// 事件数据验证
const validateEvent = (req, res, next) => {
  const { title, description, event_date, location, max_attendees } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('活动标题是必需的');
  }

  if (!description || description.trim().length === 0) {
    errors.push('活动描述是必需的');
  }

  if (!event_date) {
    errors.push('活动日期是必需的');
  } else if (new Date(event_date) <= new Date()) {
    errors.push('活动日期必须是将来的时间');
  }

  if (!location || location.trim().length === 0) {
    errors.push('活动地点是必需的');
  }

  if (!max_attendees || max_attendees <= 0) {
    errors.push('最大参与人数必须大于0');
  }

  if (errors.length > 0) {
    const error = new Error('数据验证失败');
    error.name = 'ValidationError';
    error.details = errors;
    return next(error);
  }

  next();
};

// 注册数据验证
const validateRegistration = (req, res, next) => {
  const { event_id, full_name, email, ticket_count } = req.body;
  const errors = [];

  if (!event_id) {
    errors.push('活动ID是必需的');
  }

  if (!full_name || full_name.trim().length === 0) {
    errors.push('参与者姓名是必需的');
  }

  if (!email || email.trim().length === 0) {
    errors.push('邮箱是必需的');
  } else if (!isValidEmail(email)) {
    errors.push('邮箱格式无效');
  }

  if (!ticket_count || ticket_count <= 0) {
    errors.push('票数必须大于0');
  }

  if (errors.length > 0) {
    const error = new Error('数据验证失败');
    error.name = 'ValidationError';
    error.details = errors;
    return next(error);
  }

  next();
};

// 邮箱验证函数
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 分页参数验证
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: '页码必须大于0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: '每页数量必须在1-100之间'
    });
  }

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateEvent,
  validateRegistration,
  validatePagination,
  isValidEmail
};