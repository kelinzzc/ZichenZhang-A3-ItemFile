const CategoryModel = require('../models/CategoryModel');

class CategoryController {
  /**
   * Get all categories
   */
  static async getAllCategories(req, res, next) {
    try {
      const result = await CategoryModel.getAllCategories();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve category list',
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
   * Get single category details
   */
  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID'
        });
      }

      const result = await CategoryModel.getCategoryById(parseInt(id));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve category details',
          message: result.error
        });
      }

      if (!result.data) {
        return res.status(404).json({
          success: false,
          error: 'Category does not exist'
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