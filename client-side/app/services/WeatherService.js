angular.module('CharityEventsApp')
.factory('WeatherService', ['ApiService', '$q', '$http', function(ApiService, $q, $http) {
    
    return {
        /**
         * Get weather information
         */
        getWeather: function(latitude, longitude) {
            if (!latitude || !longitude) {
                return $q.reject({ message: 'Latitude and longitude coordinates are required' });
            }

            return ApiService.get('/weather', { latitude: latitude, longitude: longitude })
                .then(response => response.data)
                .catch(error => {
                    console.warn('Weather API request failed:', error);
                    return this.getFallbackWeather();
                });
        },

        /**
         * Get fallback weather data
         */
        getFallbackWeather: function() {
            return $q.resolve({
                date: new Date().toISOString().split('T')[0],
                weatherDescription: 'Weather information temporarily unavailable',
                temperatureMax: 22,
                temperatureMin: 15,
                temperatureUnit: 'celsius',
                note: 'This is simulated data, actual weather may differ'
            });
        },

        /**
         * Get weather icon class name
         */
        getWeatherIcon: function(weatherDescription) {
            const iconMap = {
                'Clear': 'fa-sun',
                'Mainly Clear': 'fa-sun',
                'Partly Cloudy': 'fa-cloud-sun',
                'Overcast': 'fa-cloud',
                'Fog': 'fa-smog',
                'Freezing Fog': 'fa-smog',
                'Light Drizzle': 'fa-cloud-rain',
                'Moderate Drizzle': 'fa-cloud-rain',
                'Heavy Drizzle': 'fa-cloud-showers-heavy',
                'Heavy Rain': 'fa-cloud-showers-heavy',
                'Light Rain Showers': 'fa-cloud-rain',
                'Moderate Rain Showers': 'fa-cloud-rain',
                'Heavy Rain Showers': 'fa-cloud-showers-heavy',
                'Light Snow': 'fa-snowflake',
                'Moderate Snow': 'fa-snowflake',
                'Heavy Snow': 'fa-snowflake',
                'Light Snow Showers': 'fa-snowflake',
                'Heavy Snow Showers': 'fa-snowflake',
                'Thunderstorm': 'fa-bolt',
                'Thunderstorm with Light Hail': 'fa-bolt',
                'Thunderstorm with Heavy Hail': 'fa-bolt'
            };

            return iconMap[weatherDescription] || 'fa-cloud';
        }
    };
}]);