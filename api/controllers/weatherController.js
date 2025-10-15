const fetch = require('node-fetch');

/**
 * 天气控制器 - 集成Open-Meteo API
 */
class WeatherController {
  /**
   * 获取天气信息
   */
  static async getWeather(req, res, next) {
    try {
      const { latitude, longitude } = req.query;

      // 验证参数
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: '缺少必需参数',
          message: '请提供纬度和经度参数',
          example: '/api/weather?latitude=-33.87&longitude=151.21'
        });
      }

      // 验证坐标格式
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: '无效的坐标参数',
          message: '请提供有效的纬度和经度'
        });
      }

      // 构建API URL
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Australia%2FSydney`;

      console.log('🌤️  请求天气API:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`天气API请求失败: ${response.status} ${response.statusText}`);
      }

      const weatherData = await response.json();

      // 处理天气数据
      const processedData = this.processWeatherData(weatherData);

      res.json({
        success: true,
        data: processedData,
        location: { latitude: lat, longitude: lng },
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo API'
      });

    } catch (error) {
      console.error('天气API错误:', error);
      
      // 提供降级响应
      res.status(503).json({
        success: false,
        error: '天气服务暂时不可用',
        message: '无法获取天气信息，请稍后重试',
        fallback: this.getFallbackWeather(),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 处理原始天气数据
   */
  static processWeatherData(weatherData) {
    const { daily } = weatherData;
    
    if (!daily || !daily.time || daily.time.length === 0) {
      throw new Error('天气数据格式无效');
    }

    // 获取今天的数据（索引0）
    const todayIndex = 0;
    
    return {
      date: daily.time[todayIndex],
      weatherCode: daily.weather_code[todayIndex],
      weatherDescription: this.getWeatherDescription(daily.weather_code[todayIndex]),
      temperatureMax: daily.temperature_2m_max[todayIndex],
      temperatureMin: daily.temperature_2m_min[todayIndex],
      temperatureUnit: 'celsius',
      forecast: daily.time.slice(0, 3).map((date, index) => ({
        date,
        weatherCode: daily.weather_code[index],
        weatherDescription: this.getWeatherDescription(daily.weather_code[index]),
        temperatureMax: daily.temperature_2m_max[index],
        temperatureMin: daily.temperature_2m_min[index]
      }))
    };
  }

  /**
   * 将天气代码转换为描述
   */
  static getWeatherDescription(code) {
    const weatherMap = {
      0: '晴朗',
      1: '基本晴朗', 
      2: '部分多云', 
      3: '阴天',
      45: '雾', 
      48: '冻雾',
      51: '小雨', 
      53: '中雨', 
      55: '大雨',
      56: '冻毛毛雨', 
      57: '密集冻毛毛雨',
      61: '小雨', 
      63: '中雨', 
      65: '暴雨',
      66: '冻雨', 
      67: '大冻雨',
      71: '小雪', 
      73: '中雪', 
      75: '大雪',
      77: '雪粒',
      80: '小雨阵雨', 
      81: '中雨阵雨', 
      82: '暴雨阵雨',
      85: '小雪阵雨', 
      86: '大雪阵雨',
      95: '雷暴',
      96: '雷暴伴有轻微冰雹', 
      99: '雷暴伴有大冰雹'
    };

    return weatherMap[code] || '未知';
  }

  /**
   * 提供降级天气数据
   */
  static getFallbackWeather() {
    return {
      date: new Date().toISOString().split('T')[0],
      weatherDescription: '天气信息暂时不可用',
      temperatureMax: 22,
      temperatureMin: 15,
      temperatureUnit: 'celsius',
      note: '这是模拟数据，实际天气可能不同'
    };
  }
}

module.exports = WeatherController;