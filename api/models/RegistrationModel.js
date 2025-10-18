const { db } = require('../config/database');

class RegistrationModel {
  // Create registration record
  static async createRegistration(registrationData) {
    const {
      event_id, full_name, email, phone, ticket_count, special_requirements
    } = registrationData;

    // Check if already registered
    const checkSql = 'SELECT id FROM registrations WHERE event_id = ? AND email = ?';
    const checkResult = await db.query(checkSql, [event_id, email]);

    if (!checkResult.success) {
      return { success: false, error: 'Failed to check registration records' };
    }

    if (checkResult.data.length > 0) {
      return { 
        success: false, 
        error: 'This email has already registered for this event',
        existingRegistration: checkResult.data[0]
      };
    }

    // Check event registration status
    const eventSql = `
      SELECT max_attendees, is_active, is_suspended 
      FROM events 
      WHERE id = ?
    `;
    const eventResult = await db.query(eventSql, [event_id]);

    if (!eventResult.success || eventResult.data.length === 0) {
      return { success: false, error: 'Event does not exist' };
    }

    const event = eventResult.data[0];
    if (!event.is_active || event.is_suspended) {
      return { success: false, error: 'Event registration is temporarily unavailable' };
    }

    // Check if enough tickets available
    const currentRegistrationsSql = `
      SELECT COALESCE(SUM(ticket_count), 0) as current_tickets 
      FROM registrations 
      WHERE event_id = ?
    `;
    const currentResult = await db.query(currentRegistrationsSql, [event_id]);

    if (!currentResult.success) {
      return { success: false, error: 'Failed to check current ticket count' };
    }

    const currentTickets = currentResult.data[0].current_tickets;
    if (currentTickets + ticket_count > event.max_attendees) {
      return { 
        success: false, 
        error: `Not enough tickets available, remaining tickets: ${event.max_attendees - currentTickets}`
      };
    }

    // Create registration record
    const insertSql = `
      INSERT INTO registrations (event_id, full_name, email, phone, ticket_count, special_requirements)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [event_id, full_name, email, phone, ticket_count, special_requirements];
    return await db.query(insertSql, params);
  }

  // Get event registration records
  static async getRegistrationsByEventId(eventId) {
    const sql = `
      SELECT r.*, e.title as event_title
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.event_id = ?
      ORDER BY r.registration_date DESC
    `;
    return await db.query(sql, [eventId]);
  }

  // Delete registration
  static async deleteRegistration(id) {
    const sql = 'DELETE FROM registrations WHERE id = ?';
    return await db.query(sql, [id]);
  }

  // Get statistics
  static async getRegistrationStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_registrations,
        SUM(ticket_count) as total_tickets,
        AVG(ticket_count) as avg_tickets_per_registration,
        COUNT(DISTINCT email) as unique_attendees,
        COUNT(DISTINCT event_id) as events_with_registrations
      FROM registrations
    `;
    return await db.query(sql);
  }

  static async getAllRegistrations(options = {}) {
    let sql = `
      SELECT 
        r.*, 
        e.title as event_title, 
        e.event_date,
        c.name as category_name,
        o.name as organization_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN organizations o ON e.organization_id = o.id
    `;
    
    const params = [];

    // Event filtering
    if (options.event_id) {
      sql += ' WHERE r.event_id = ?';
      params.push(options.event_id);
    }

    sql += ' ORDER BY r.registration_date DESC';

    // Pagination
    if (options.page && options.limit) {
      const offset = (options.page - 1) * options.limit;
      sql += ' LIMIT ? OFFSET ?';
      params.push(options.limit, offset);
    }

    return await db.query(sql, params);
  }

  static async getRegistrationCount(eventId = null) {
    let sql = 'SELECT COUNT(*) as total FROM registrations r';
    const params = [];

    if (eventId) {
      sql += ' WHERE r.event_id = ?';
      params.push(eventId);
    }

    return await db.query(sql, params);
  }
}

module.exports = RegistrationModel;