angular.module('CharityEventsApp')
.factory('WeatherService', ['ApiService', '$q', '$http', function(ApiService, $q, $http) {
    
    return {
        /**
         * 获取天气信息
         */
        getWeather: function(latitude, longitude) {
            if (!latitude || !longitude) {
                return $q.reject({ message: '需要提供经纬度坐标' });
            }

            return ApiService.get('/weather', { latitude: latitude, longitude: longitude })
                .then(response => response.data)
                .catch(error => {
                    console.warn('天气API请求失败:', error);
                    // 返回降级数据
                    return this.getFallbackWeather();
                });
        },

        /**
         * 获取降级天气数据
         */
        getFallbackWeather: function() {
            return $q.resolve({
                date: new Date().toISOString().split('T')[0],
                weatherDescription: '天气信息暂时不可用',
                temperatureMax: 22,
                temperatureMin: 15,
                temperatureUnit: 'celsius',
                note: '这是模拟数据，实际天气可能不同'
            });
        },

        /**
         * 获取天气图标类名
         */
        getWeatherIcon: function(weatherDescription) {
            const iconMap = {
                '晴朗': 'fa-sun',
                '基本晴朗': 'fa-sun',
                '部分多云': 'fa-cloud-sun',
                '阴天': 'fa-cloud',
                '雾': 'fa-smog',
                '冻雾': 'fa-smog',
                '小雨': 'fa-cloud-rain',
                '中雨': 'fa-cloud-rain',
                '大雨': 'fa-cloud-showers-heavy',
                '暴雨': 'fa-cloud-showers-heavy',
                '小雨阵雨': 'fa-cloud-rain',
                '中雨阵雨': 'fa-cloud-rain',
                '暴雨阵雨': 'fa-cloud-showers-heavy',
                '小雪': 'fa-snowflake',
                '中雪': 'fa-snowflake',
                '大雪': 'fa-snowflake',
                '小雪阵雨': 'fa-snowflake',
                '大雪阵雨': 'fa-snowflake',
                '雷暴': 'fa-bolt',
                '雷暴伴有轻微冰雹': 'fa-bolt',
                '雷暴伴有大冰雹': 'fa-bolt'
            };

            return iconMap[weatherDescription] || 'fa-cloud';
        }
    };
}]);