const RegistrationModel = require('../models/RegistrationModel');

/**
 * Registration Controller
 */
class RegistrationController {
  /**
   * Get all registration records (admin side)
   */
  static async getAllRegistrations(req, res, next) {
    try {
      const { page = 1, limit = 20, event_id } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        event_id: event_id ? parseInt(event_id) : null
      };

      const result = await RegistrationModel.getAllRegistrations(options);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve registration records',
          message: result.error
        });
      }

      // Get total count (without pagination)
      const countResult = await RegistrationModel.getRegistrationCount(options.event_id);
      const total = countResult.success ? countResult.data[0].total : result.data.length;

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: total
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event registration records (A3 requirement: sorted by time in descending order)
   */
  static async getRegistrationsByEventId(req, res, next) {
    try {
      const { eventId } = req.params;

      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID',
          message: 'Please provide a valid event ID'
        });
      }

      const result = await RegistrationModel.getRegistrationsByEventId(parseInt(eventId));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve registration records',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        eventId: parseInt(eventId),
        total: result.data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create registration record (A3 core functionality)
   */
  static async createRegistration(req, res, next) {
    try {
      const registrationData = req.body;

      // Validate required fields
      const requiredFields = ['event_id', 'full_name', 'email', 'ticket_count'];
      const missingFields = requiredFields.filter(field => !registrationData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: `The following fields are required: ${missingFields.join(', ')}`,
          missingFields
        });
      }

      // Validate ticket count
      if (registrationData.ticket_count <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ticket count',
          message: 'Ticket count must be greater than 0'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
      }

      const result = await RegistrationModel.createRegistration(registrationData);

      if (!result.success) {
        // Handle specific error cases
        if (result.error.includes('already registered')) {
          return res.status(409).json({
            success: false,
            error: 'Duplicate registration',
            message: result.error,
            code: 'DUPLICATE_REGISTRATION',
            existingRegistration: result.existingRegistration
          });
        }

        if (result.error.includes('Not enough tickets')) {
          return res.status(409).json({
            success: false,
            error: 'Insufficient tickets',
            message: result.error,
            code: 'INSUFFICIENT_TICKETS'
          });
        }

        if (result.error.includes('Event does not exist') || result.error.includes('registration is temporarily unavailable')) {
          return res.status(404).json({
            success: false,
            error: 'Event unavailable',
            message: result.error,
            code: 'EVENT_UNAVAILABLE'
          });
        }

        return res.status(500).json({
          success: false,
          error: 'Registration failed',
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.data.insertId,
          ...registrationData,
          registration_date: new Date().toISOString()
        },
        message: 'Registration successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete registration record (admin side)
   */
  static async deleteRegistration(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid registration ID',
          message: 'Please provide a valid registration ID'
        });
      }

      const result = await RegistrationModel.deleteRegistration(parseInt(id));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete registration record',
          message: result.error
        });
      }

      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Registration record not found',
          message: `Registration record with ID ${id} not found`
        });
      }

      res.json({
        success: true,
        message: 'Registration record deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get registration statistics
   */
  static async getRegistrationStats(req, res, next) {
    try {
      const result = await RegistrationModel.getRegistrationStats();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve registration statistics',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data[0],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RegistrationController;