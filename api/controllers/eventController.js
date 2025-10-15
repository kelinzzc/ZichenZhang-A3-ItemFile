const EventModel = require('../models/EventModel');

/**
 * 事件控制器
 */
class EventController {
  /**
   * 获取所有活动
   */
  static async getAllEvents(req, res, next) {
    try {
      const { category, organization, location, status, page = 1, limit = 10 } = req.query;
      
      const searchParams = {
        category,
        organization, 
        location,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await EventModel.getAllEvents(searchParams);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取活动列表失败',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: result.data.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个活动详情（A3要求：包含注册记录）
   */
  static async getEventById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: '无效的活动ID',
          message: '请提供有效的活动ID'
        });
      }

      const result = await EventModel.getEventById(parseInt(id));

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取活动详情失败',
          message: result.error
        });
      }

      if (!result.data.event) {
        return res.status(404).json({
          success: false,
          error: '活动不存在',
          message: `找不到ID为 ${id} 的活动`
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

  /**
   * 创建新活动（管理端）
   */
  static async createEvent(req, res, next) {
    try {
      const eventData = req.body;

      // 设置默认值
      eventData.is_active = eventData.is_active !== undefined ? eventData.is_active : true;
      eventData.is_suspended = eventData.is_suspended !== undefined ? eventData.is_suspended : false;

      const result = await EventModel.createEvent(eventData);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '创建活动失败',
          message: result.error
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.data.insertId,
          ...eventData
        },
        message: '活动创建成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新活动（管理端）
   */
  static async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const eventData = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: '无效的活动ID',
          message: '请提供有效的活动ID'
        });
      }

      const result = await EventModel.updateEvent(parseInt(id), eventData);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '更新活动失败',
          message: result.error
        });
      }

      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: '活动不存在',
          message: `找不到ID为 ${id} 的活动`
        });
      }

      res.json({
        success: true,
        data: {
          id: parseInt(id),
          ...eventData
        },
        message: '活动更新成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除活动（A3要求：有注册记录时阻止删除）
   */
  static async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: '无效的活动ID',
          message: '请提供有效的活动ID'
        });
      }

      const result = await EventModel.deleteEvent(parseInt(id));

      if (!result.success) {
        // 检查是否是注册记录阻止删除
        if (result.registrationsCount > 0) {
          return res.status(409).json({
            success: false,
            error: '无法删除活动',
            message: `该活动有 ${result.registrationsCount} 个注册记录，无法删除`,
            registrationsCount: result.registrationsCount,
            code: 'HAS_REGISTRATIONS'
          });
        }

        return res.status(500).json({
          success: false,
          error: '删除活动失败',
          message: result.error
        });
      }

      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: '活动不存在',
          message: `找不到ID为 ${id} 的活动`
        });
      }

      res.json({
        success: true,
        message: '活动删除成功',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 搜索活动
   */
  static async searchEvents(req, res, next) {
    try {
      const { q, category, location, date_from, date_to, page = 1, limit = 10 } = req.query;

      const searchParams = {
        search: q,
        category,
        location,
        date_from,
        date_to,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await EventModel.searchEvents(searchParams);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '搜索活动失败',
          message: result.error
        });
      }

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: result.data.length,
          search: searchParams.search
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动统计
   */
  static async getEventStats(req, res, next) {
    try {
      const result = await EventModel.getEventStats();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: '获取活动统计失败',
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

module.exports = EventController;