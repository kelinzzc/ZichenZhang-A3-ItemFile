const express = require('express');
const WeatherController = require('../controllers/weatherController');

const router = express.Router();

/**
 * @route GET /api/weather
 * @description Get weather information (integrated with Open-Meteo API)
 * @access Public
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @example /api/weather?latitude=-33.87&longitude=151.21
 */
router.get('/', WeatherController.getWeather);

module.exports = router;