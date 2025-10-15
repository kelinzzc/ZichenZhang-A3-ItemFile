const OrganizationModel = require('../models/OrganizationModel');

class OrganizationController {
  /**
   * 获取所有组织
   */
  static async getAllOrganizations(req, res, next) {
    try {
      const result = await OrganizationModel.getAllOrganizations();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取组织列表失败',
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
}

module.exports = OrganizationController;