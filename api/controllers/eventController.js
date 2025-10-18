const EventModel = require('../models/EventModel');

/**
 * Event Controller
 */
class EventController {

  static async getAllEvents(req, res, next) {
    try {
      const { category, organization, location, status, page = 1, limit = 10 } = req.query;
      
      const searchParams = {
        category,
        organization, 
        location,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await EventModel.getAllEvents(searchParams);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve event list',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: result.data.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single event details (A3 requirement: including registration records)
   */
  static async getEventById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID',
          message: 'Please provide a valid event ID'
        });
      }

      const result = await EventModel.getEventById(parseInt(id));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve event details',
          message: result.error
        });
      }

      if (!result.data.event) {
        return res.status(404).json({
          success: false,
          error: 'Event does not exist',
          message: `Event with ID ${id} not found`
        });
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new event (admin side)
   */
  static async createEvent(req, res, next) {
    try {
      const eventData = req.body;

      // Set default values
      eventData.is_active = eventData.is_active !== undefined ? eventData.is_active : true;
      eventData.is_suspended = eventData.is_suspended !== undefined ? eventData.is_suspended : false;

      const result = await EventModel.createEvent(eventData);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create event',
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.data.insertId,
          ...eventData
        },
        message: 'Event created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event (admin side)
   */
  static async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const eventData = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID',
          message: 'Please provide a valid event ID'
        });
      }

      const result = await EventModel.updateEvent(parseInt(id), eventData);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update event',
          message: result.error
        });
      }

      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event does not exist',
          message: `Event with ID ${id} not found`
        });
      }

      res.json({
        success: true,
        data: {
          id: parseInt(id),
          ...eventData
        },
        message: 'Event updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete event (A3 requirement: prevent deletion if there are registration records)
   */
  static async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID',
          message: 'Please provide a valid event ID'
        });
      }

      const result = await EventModel.deleteEvent(parseInt(id));

      if (!result.success) {
        // Check if deletion was prevented by registration records
        if (result.registrationsCount > 0) {
          return res.status(409).json({
            success: false,
            error: 'Cannot delete event',
            message: `This event has ${result.registrationsCount} registration records and cannot be deleted`,
            registrationsCount: result.registrationsCount,
            code: 'HAS_REGISTRATIONS'
          });
        }

        return res.status(500).json({
          success: false,
          error: 'Failed to delete event',
          message: result.error
        });
      }

      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event does not exist',
          message: `Event with ID ${id} not found`
        });
      }

      res.json({
        success: true,
        message: 'Event deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search events
   */
  static async searchEvents(req, res, next) {
    try {
      const { q, category, location, date_from, date_to, page = 1, limit = 10 } = req.query;

      const searchParams = {
        search: q,
        category,
        location,
        date_from,
        date_to,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await EventModel.searchEvents(searchParams);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to search events',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: result.data.length,
          search: searchParams.search
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event statistics
   */
  static async getEventStats(req, res, next) {
    try {
      const result = await EventModel.getEventStats();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve event statistics',
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

module.exports = EventController;