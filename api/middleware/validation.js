const validateEvent = (req, res, next) => {
  const { title, description, event_date, location, max_attendees } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Event title is required');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Event description is required');
  }

  if (!event_date) {
    errors.push('Event date is required');
  } else if (new Date(event_date) <= new Date()) {
    errors.push('Event date must be in the future');
  }

  if (!location || location.trim().length === 0) {
    errors.push('Event location is required');
  }

  if (!max_attendees || max_attendees <= 0) {
    errors.push('Maximum attendees must be greater than 0');
  }

  if (errors.length > 0) {
    const error = new Error('Data validation failed');
    error.name = 'ValidationError';
    error.details = errors;
    return next(error);
  }

  next();
};

// Registration data validation
const validateRegistration = (req, res, next) => {
  const { event_id, full_name, email, ticket_count } = req.body;
  const errors = [];

  if (!event_id) {
    errors.push('Event ID is required');
  }

  if (!full_name || full_name.trim().length === 0) {
    errors.push('Participant name is required');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!ticket_count || ticket_count <= 0) {
    errors.push('Ticket count must be greater than 0');
  }

  if (errors.length > 0) {
    const error = new Error('Data validation failed');
    error.name = 'ValidationError';
    error.details = errors;
    return next(error);
  }

  next();
};

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Pagination parameter validation
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page number must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Items per page must be between 1 and 100'
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