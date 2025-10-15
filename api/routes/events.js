const express = require('express');
const EventController = require('../controllers/eventController');
const { validateEvent, validatePagination } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/events
 * @description 获取所有活动
 * @access Public
 */
router.get('/', validatePagination, EventController.getAllEvents);

/**
 * @route GET /api/events/search
 * @description 搜索活动
 * @access Public
 */
router.get('/search', validatePagination, EventController.searchEvents);

/**
 * @route GET /api/events/stats
 * @description 获取活动统计
 * @access Public
 */
router.get('/stats', EventController.getEventStats);

/**
 * @route GET /api/events/:id
 * @description 获取单个活动详情（包含注册记录 - A3要求）
 * @access Public
 */
router.get('/:id', EventController.getEventById);

/**
 * @route POST /api/events
 * @description 创建新活动（管理端）
 * @access Private (假设无需认证)
 */
router.post('/', validateEvent, EventController.createEvent);

/**
 * @route PUT /api/events/:id
 * @description 更新活动（管理端）
 * @access Private (假设无需认证)
 */
router.put('/:id', validateEvent, EventController.updateEvent);

/**
 * @route DELETE /api/events/:id
 * @description 删除活动（A3要求：有注册记录时阻止删除）
 * @access Private (假设无需认证)
 */
router.delete('/:id', EventController.deleteEvent);

module.exports = router;