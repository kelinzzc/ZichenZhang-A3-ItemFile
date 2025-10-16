angular.module('CharityEventsApp')
.directive('weatherWidget', ['WeatherService', function(WeatherService) {
    return {
        restrict: 'E',
        scope: {
            weather: '='
        },
        template: `
            <div class="weather-widget" ng-if="weather">
                <div class="weather-header">
                    <i class="fas" ng-class="getWeatherIcon()"></i>
                    <div class="weather-info">
                        <div class="weather-description">{{weather.weatherDescription}}</div>
                        <div class="weather-date">{{weather.date | date:'MM月dd日'}}</div>
                    </div>
                </div>
                
                <div class="weather-temp">
                    <span class="temp-max">{{weather.temperatureMax}}°</span>
                    <span class="temp-separator">/</span>
                    <span class="temp-min">{{weather.temperatureMin}}°</span>
                </div>
                
                <div class="weather-forecast" ng-if="weather.forecast">
                    <div class="forecast-item" ng-repeat="day in weather.forecast">
                        <div class="forecast-date">{{day.date | date:'MM/dd'}}</div>
                        <i class="fas" ng-class="getForecastIcon(day.weatherCode)"></i>
                        <div class="forecast-temp">
                            <span>{{day.temperatureMax}}°</span>
                            <span>{{day.temperatureMin}}°</span>
                        </div>
                    </div>
                </div>
                
                <div class="weather-note" ng-if="weather.note">
                    <small>{{weather.note}}</small>
                </div>
            </div>
        `,
        link: function(scope, element, attrs) {
            /**
             * 获取天气图标
             */
            scope.getWeatherIcon = function() {
                return WeatherService.getWeatherIcon(scope.weather.weatherDescription);
            };

            /**
             * 获取预报图标
             */
            scope.getForecastIcon = function(weatherCode) {
                // 简化处理，实际应该根据天气代码返回对应图标
                const iconMap = {
                    0: 'fa-sun',
                    1: 'fa-sun',
                    2: 'fa-cloud-sun',
                    3: 'fa-cloud',
                    45: 'fa-smog',
                    48: 'fa-smog',
                    51: 'fa-cloud-rain',
                    53: 'fa-cloud-rain',
                    55: 'fa-cloud-showers-heavy',
                    61: 'fa-cloud-rain',
                    63: 'fa-cloud-rain',
                    65: 'fa-cloud-showers-heavy',
                    80: 'fa-cloud-rain',
                    81: 'fa-cloud-rain',
                    82: 'fa-cloud-showers-heavy',
                    95: 'fa-bolt'
                };
                return iconMap[weatherCode] || 'fa-cloud';
            };
        }
    };
}]);