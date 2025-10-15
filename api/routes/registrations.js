const express = require('express');
const RegistrationController = require('../controllers/registrationController');
const { validateRegistration, validatePagination } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/registrations
 * @description 获取所有注册记录（管理端）
 * @access Private (假设无需认证)
 */
router.get('/', validatePagination, RegistrationController.getAllRegistrations);

/**
 * @route GET /api/registrations/stats
 * @description 获取注册统计
 * @access Private (假设无需认证)
 */
router.get('/stats', RegistrationController.getRegistrationStats);

/**
 * @route GET /api/registrations/event/:eventId
 * @description 获取活动的注册记录（A3要求：按时间倒序）
 * @access Public
 */
router.get('/event/:eventId', RegistrationController.getRegistrationsByEventId);

/**
 * @route POST /api/registrations
 * @description 创建注册记录（A3核心功能）
 * @access Public
 */
router.post('/', validateRegistration, RegistrationController.createRegistration);

/**
 * @route DELETE /api/registrations/:id
 * @description 删除注册记录（管理端）
 * @access Private (假设无需认证)
 */
router.delete('/:id', RegistrationController.deleteRegistration);

module.exports = router;