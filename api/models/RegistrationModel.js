const { db } = require('../config/database');

class RegistrationModel {
  // 创建注册记录（实现A3的唯一性约束）
  static async createRegistration(registrationData) {
    const {
      event_id, full_name, email, phone, ticket_count, special_requirements
    } = registrationData;

    // 检查是否已经注册（A3核心要求）
    const checkSql = 'SELECT id FROM registrations WHERE event_id = ? AND email = ?';
    const checkResult = await db.query(checkSql, [event_id, email]);

    if (!checkResult.success) {
      return { success: false, error: '检查注册记录失败' };
    }

    if (checkResult.data.length > 0) {
      return { 
        success: false, 
        error: '该邮箱已经注册过此活动',
        existingRegistration: checkResult.data[0]
      };
    }

    // 检查活动是否可注册
    const eventSql = `
      SELECT max_attendees, is_active, is_suspended 
      FROM events 
      WHERE id = ?
    `;
    const eventResult = await db.query(eventSql, [event_id]);

    if (!eventResult.success || eventResult.data.length === 0) {
      return { success: false, error: '活动不存在' };
    }

    const event = eventResult.data[0];
    if (!event.is_active || event.is_suspended) {
      return { success: false, error: '活动暂不可注册' };
    }

    // 检查票数是否足够（基于A2的max_attendees）
    const currentRegistrationsSql = `
      SELECT COALESCE(SUM(ticket_count), 0) as current_tickets 
      FROM registrations 
      WHERE event_id = ?
    `;
    const currentResult = await db.query(currentRegistrationsSql, [event_id]);

    if (!currentResult.success) {
      return { success: false, error: '检查当前票数失败' };
    }

    const currentTickets = currentResult.data[0].current_tickets;
    if (currentTickets + ticket_count > event.max_attendees) {
      return { 
        success: false, 
        error: `票数不足，剩余票数: ${event.max_attendees - currentTickets}`
      };
    }

    // 创建注册记录
    const insertSql = `
      INSERT INTO registrations (event_id, full_name, email, phone, ticket_count, special_requirements)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [event_id, full_name, email, phone, ticket_count, special_requirements];
    return await db.query(insertSql, params);
  }

  // 获取活动的所有注册记录（按时间倒序）
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

  // 获取所有注册记录（管理端使用，已移至下方带分页的版本）

  // 删除注册记录
  static async deleteRegistration(id) {
    const sql = 'DELETE FROM registrations WHERE id = ?';
    return await db.query(sql, [id]);
  }

  // 获取注册统计
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
  // 在RegistrationModel类中添加以下方法：

/**
 * 获取所有注册记录（带分页和筛选）
 */
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

  // 事件筛选
  if (options.event_id) {
    sql += ' WHERE r.event_id = ?';
    params.push(options.event_id);
  }

  sql += ' ORDER BY r.registration_date DESC';

  // 分页
  if (options.page && options.limit) {
    const offset = (options.page - 1) * options.limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(options.limit, offset);
  }

  return await db.query(sql, params);
}

/**
 * 获取注册记录总数
 */
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