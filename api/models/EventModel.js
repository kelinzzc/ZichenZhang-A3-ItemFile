const { db } = require('../config/database');

class EventModel {
  // 获取所有活动（基于A2结构）
  static async getAllEvents() {
    const sql = `
      SELECT 
        e.*,
        o.name as organization_name,
        c.name as category_name,
        COUNT(r.id) as registration_count,
        SUM(r.ticket_count) as total_tickets_sold,
        (e.current_amount / e.goal_amount * 100) as funding_progress
      FROM events e
      LEFT JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.is_active = TRUE AND e.is_suspended = FALSE
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `;
    return await db.query(sql);
  }

  // 根据ID获取活动详情（包含注册记录）
  static async getEventById(id) {
    const eventSql = `
      SELECT 
        e.*,
        o.name as organization_name,
        o.contact_email as organization_contact,
        o.contact_phone as organization_phone,
        c.name as category_name
      FROM events e
      LEFT JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `;
    
    const registrationsSql = `
      SELECT * FROM registrations 
      WHERE event_id = ? 
      ORDER BY registration_date DESC
    `;

    const [eventResult, registrationsResult] = await Promise.all([
      db.query(eventSql, [id]),
      db.query(registrationsSql, [id])
    ]);

    if (!eventResult.success || !registrationsResult.success) {
      return { success: false, error: '查询失败' };
    }

    return {
      success: true,
      data: {
        event: eventResult.data[0] || null,
        registrations: registrationsResult.data
      }
    };
  }

  // 创建新活动（管理端使用）
  static async createEvent(eventData) {
    const {
      title, description, full_description, category_id, organization_id,
      event_date, location, venue_details, ticket_price, goal_amount,
      max_attendees, image_url, latitude, longitude
    } = eventData;

    const sql = `
      INSERT INTO events (
        title, description, full_description, category_id, organization_id,
        event_date, location, venue_details, ticket_price, goal_amount,
        max_attendees, image_url, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      title, description, full_description, category_id, organization_id,
      event_date, location, venue_details, ticket_price, goal_amount,
      max_attendees, image_url, latitude, longitude
    ];
    
    return await db.query(sql, params);
  }

  // 更新活动
  static async updateEvent(id, eventData) {
    const {
      title, description, full_description, category_id, organization_id,
      event_date, location, venue_details, ticket_price, goal_amount,
      max_attendees, image_url, latitude, longitude, is_active, is_suspended
    } = eventData;

    const sql = `
      UPDATE events 
      SET title=?, description=?, full_description=?, category_id=?, organization_id=?,
          event_date=?, location=?, venue_details=?, ticket_price=?, goal_amount=?,
          max_attendees=?, image_url=?, latitude=?, longitude=?, is_active=?, is_suspended=?,
          updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `;
    
    const params = [
      title, description, full_description, category_id, organization_id,
      event_date, location, venue_details, ticket_price, goal_amount,
      max_attendees, image_url, latitude, longitude, is_active, is_suspended, id
    ];
    
    return await db.query(sql, params);
  }

  // 删除活动（检查是否有注册记录）
  static async deleteEvent(id) {
    // 检查是否有注册记录
    const checkSql = 'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?';
    const checkResult = await db.query(checkSql, [id]);

    if (!checkResult.success) {
      return { success: false, error: '检查注册记录失败' };
    }

    if (checkResult.data[0].count > 0) {
      return { 
        success: false, 
        error: '无法删除有注册记录的活动',
        registrationsCount: checkResult.data[0].count
      };
    }

    // 删除活动
    const deleteSql = 'DELETE FROM events WHERE id = ?';
    return await db.query(deleteSql, [id]);
  }

  // 搜索活动
  static async searchEvents(searchParams) {
    let sql = `
      SELECT 
        e.*,
        o.name as organization_name,
        c.name as category_name,
        COUNT(r.id) as registration_count
      FROM events e
      LEFT JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.is_active = TRUE AND e.is_suspended = FALSE
    `;
    const params = [];

    if (searchParams.category) {
      sql += ' AND e.category_id = ?';
      params.push(searchParams.category);
    }

    if (searchParams.organization) {
      sql += ' AND e.organization_id = ?';
      params.push(searchParams.organization);
    }

    if (searchParams.location) {
      sql += ' AND e.location LIKE ?';
      params.push(`%${searchParams.location}%`);
    }

    if (searchParams.date_from) {
      sql += ' AND e.event_date >= ?';
      params.push(searchParams.date_from);
    }

    if (searchParams.date_to) {
      sql += ' AND e.event_date <= ?';
      params.push(searchParams.date_to);
    }

    sql += ' GROUP BY e.id ORDER BY e.event_date ASC';
    return await db.query(sql, params);
  }

  // 获取组织列表
  static async getOrganizations() {
    const sql = 'SELECT * FROM organizations ORDER BY name';
    return await db.query(sql);
  }

  // 获取类别列表
  static async getCategories() {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return await db.query(sql);
  }
}

module.exports = EventModel;