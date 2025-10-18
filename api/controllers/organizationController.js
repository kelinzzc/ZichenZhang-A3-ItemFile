const OrganizationModel = require('../models/OrganizationModel');

class OrganizationController {
  /**
   * Get all organizations
   */
  static async getAllOrganizations(req, res, next) {
    try {
      const result = await OrganizationModel.getAllOrganizations();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve organization list',
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