const RegistrationModel = require('../models/RegistrationModel');

/**
 * 注册控制器
 */
class RegistrationController {
  /**
   * 获取所有注册记录（管理端）
   */
  static async getAllRegistrations(req, res, next) {
    try {
      const { page = 1, limit = 20, event_id } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        event_id: event_id ? parseInt(event_id) : null
      };

      const result = await RegistrationModel.getAllRegistrations(options);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取注册记录失败',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.data.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动的注册记录（A3要求：按时间倒序）
   */
  static async getRegistrationsByEventId(req, res, next) {
    try {
      const { eventId } = req.params;

      if (!eventId || isNaN(parseInt(eventId))) {
        return res.status(400).json({
          success: false,
          error: '无效的活动ID',
          message: '请提供有效的活动ID'
        });
      }

      const result = await RegistrationModel.getRegistrationsByEventId(parseInt(eventId));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取注册记录失败',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        eventId: parseInt(eventId),
        total: result.data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建注册记录（A3核心功能）
   */
  static async createRegistration(req, res, next) {
    try {
      const registrationData = req.body;

      // 验证必需字段
      const requiredFields = ['event_id', 'full_name', 'email', 'ticket_count'];
      const missingFields = requiredFields.filter(field => !registrationData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: '缺少必需字段',
          message: `以下字段是必需的: ${missingFields.join(', ')}`,
          missingFields
        });
      }

      // 验证票数
      if (registrationData.ticket_count <= 0) {
        return res.status(400).json({
          success: false,
          error: '无效的票数',
          message: '票数必须大于0'
        });
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrationData.email)) {
        return res.status(400).json({
          success: false,
          error: '无效的邮箱格式',
          message: '请提供有效的邮箱地址'
        });
      }

      const result = await RegistrationModel.createRegistration(registrationData);

      if (!result.success) {
        // 处理特定错误情况
        if (result.error.includes('已经注册')) {
          return res.status(409).json({
            success: false,
            error: '重复注册',
            message: result.error,
            code: 'DUPLICATE_REGISTRATION',
            existingRegistration: result.existingRegistration
          });
        }

        if (result.error.includes('票数不足')) {
          return res.status(409).json({
            success: false,
            error: '票数不足',
            message: result.error,
            code: 'INSUFFICIENT_TICKETS'
          });
        }

        if (result.error.includes('活动不存在') || result.error.includes('暂不可注册')) {
          return res.status(404).json({
            success: false,
            error: '活动不可用',
            message: result.error,
            code: 'EVENT_UNAVAILABLE'
          });
        }

        return res.status(500).json({
          success: false,
          error: '注册失败',
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.data.insertId,
          ...registrationData,
          registration_date: new Date().toISOString()
        },
        message: '注册成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除注册记录（管理端）
   */
  static async deleteRegistration(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: '无效的注册ID',
          message: '请提供有效的注册ID'
        });
      }

      const result = await RegistrationModel.deleteRegistration(parseInt(id));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '删除注册记录失败',
          message: result.error
        });
      }

      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: '注册记录不存在',
          message: `找不到ID为 ${id} 的注册记录`
        });
      }

      res.json({
        success: true,
        message: '注册记录删除成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取注册统计
   */
  static async getRegistrationStats(req, res, next) {
    try {
      const result = await RegistrationModel.getRegistrationStats();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取注册统计失败',
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

module.exports = RegistrationController;