const express = require('express');
const WeatherController = require('../controllers/weatherController');

const router = express.Router();

/**
 * @route GET /api/weather
 * @description 获取天气信息（集成Open-Meteo API）
 * @access Public
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @example /api/weather?latitude=-33.87&longitude=151.21
 */
router.get('/', WeatherController.getWeather);

module.exports = router;