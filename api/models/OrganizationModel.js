const { db } = require('../config/database');

class OrganizationModel {
  /**
   * 获取所有组织
   */
  static async getAllOrganizations() {
    const sql = 'SELECT * FROM organizations ORDER BY name';
    return await db.query(sql);
  }

  /**
   * 根据ID获取组织
   */
  static async getOrganizationById(id) {
    const sql = 'SELECT * FROM organizations WHERE id = ?';
    const result = await db.query(sql, [id]);
    
    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    
    return { success: true, data: null };
  }

  /**
   * 获取组织统计
   */
  static async getOrganizationStats() {
    const sql = `
      SELECT 
        o.id,
        o.name,
        COUNT(e.id) as event_count,
        SUM(e.goal_amount) as total_goal,
        SUM(e.current_amount) as total_raised,
        COUNT(r.id) as total_registrations
      FROM organizations o
      LEFT JOIN events e ON o.id = e.organization_id
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY o.id, o.name
      ORDER BY total_raised DESC
    `;
    return await db.query(sql);
  }
}

module.exports = OrganizationModel;