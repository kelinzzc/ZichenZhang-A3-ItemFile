const { db } = require('../config/database');

class CategoryModel {
  /**
   * 获取所有类别
   */
  static async getAllCategories() {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return await db.query(sql);
  }

  /**
   * 根据ID获取类别
   */
  static async getCategoryById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const result = await db.query(sql, [id]);
    
    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    
    return { success: true, data: null };
  }

  /**
   * 获取类别统计
   */
  static async getCategoryStats() {
    const sql = `
      SELECT 
        c.id,
        c.name,
        COUNT(e.id) as event_count,
        SUM(e.current_amount) as total_raised,
        AVG(e.current_amount / e.goal_amount * 100) as avg_funding_rate
      FROM categories c
      LEFT JOIN events e ON c.id = e.category_id
      GROUP BY c.id, c.name
      ORDER BY event_count DESC
    `;
    return await db.query(sql);
  }
}

module.exports = CategoryModel;