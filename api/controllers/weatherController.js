const fetch = require('node-fetch');

class WeatherController {
  static async getWeather(req, res, next) {
    try {
      const { latitude, longitude } = req.query;

      // Validate parameters
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'Please provide latitude and longitude parameters',
          example: '/api/weather?latitude=-33.87&longitude=151.21'
        });
      }

      // Validate coordinate format
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinate parameters',
          message: 'Please provide valid latitude and longitude'
        });
      }

      // Call Open-Meteo API
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Australia%2FSydney`;

      console.log('🌤️  Requesting weather API:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
      }

      const weatherData = await response.json();

      // Process weather data
      const processedData = WeatherController.processWeatherData(weatherData);

      res.json({
        success: true,
        data: processedData,
        location: { latitude: lat, longitude: lng },
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo API'
      });

    } catch (error) {
      console.error('Weather API error:', error);
      
      // Provide fallback response
      res.status(503).json({
        success: false,
        error: 'Weather service temporarily unavailable',
        message: 'Unable to retrieve weather information, please try again later',
        fallback: WeatherController.getFallbackWeather(),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Process raw weather data
   */
  static processWeatherData(weatherData) {
    const { daily } = weatherData;
    
    if (!daily || !daily.time || daily.time.length === 0) {
      throw new Error('Invalid weather data format');
    }

    // Get today's data
    const todayIndex = 0;
    
    return {
      date: daily.time[todayIndex],
      weatherCode: daily.weather_code[todayIndex],
      weatherDescription: WeatherController.getWeatherDescription(daily.weather_code[todayIndex]),
      temperatureMax: daily.temperature_2m_max[todayIndex],
      temperatureMin: daily.temperature_2m_min[todayIndex],
      temperatureUnit: 'celsius',
      forecast: daily.time.slice(0, 3).map((date, index) => ({
        date,
        weatherCode: daily.weather_code[index],
        weatherDescription: WeatherController.getWeatherDescription(daily.weather_code[index]),
        temperatureMax: daily.temperature_2m_max[index],
        temperatureMin: daily.temperature_2m_min[index]
      }))
    };
  }

  /**
   * Convert weather code to description
   */
  static getWeatherDescription(code) {
    const weatherMap = {
      0: 'Clear sky',
      1: 'Mainly clear', 
      2: 'Partly cloudy', 
      3: 'Overcast',
      45: 'Fog', 
      48: 'Freezing fog',
      51: 'Light drizzle', 
      53: 'Moderate drizzle', 
      55: 'Heavy drizzle',
      56: 'Light freezing drizzle', 
      57: 'Heavy freezing drizzle',
      61: 'Light rain', 
      63: 'Moderate rain', 
      65: 'Heavy rain',
      66: 'Light freezing rain', 
      67: 'Heavy freezing rain',
      71: 'Light snow', 
      73: 'Moderate snow', 
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Light rain showers', 
      81: 'Moderate rain showers', 
      82: 'Heavy rain showers',
      85: 'Light snow showers', 
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with light hail', 
      99: 'Thunderstorm with heavy hail'
    };

    return weatherMap[code] || 'Unknown';
  }

  /**
   * Provide fallback weather data
   */
  static getFallbackWeather() {
    return {
      date: new Date().toISOString().split('T')[0],
      weatherDescription: 'Weather information temporarily unavailable',
      temperatureMax: 22,
      temperatureMin: 15,
      temperatureUnit: 'celsius',
      note: 'This is simulated data, actual weather may differ'
    };
  }
}

module.exports = WeatherController;