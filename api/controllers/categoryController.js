const CategoryModel = require('../models/CategoryModel');

class CategoryController {
  /**
   * 获取所有类别
   */
  static async getAllCategories(req, res, next) {
    try {
      const result = await CategoryModel.getAllCategories();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取类别列表失败',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        total: result.data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个类别详情
   */
  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: '无效的类别ID'
        });
      }

      const result = await CategoryModel.getCategoryById(parseInt(id));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取类别详情失败',
          message: result.error
        });
      }

      if (!result.data) {
        return res.status(404).json({
          success: false,
          error: '类别不存在'
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
}

module.exports = CategoryController;