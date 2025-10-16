charityEventsApp.directive('weatherWidget', ['WeatherService', function(WeatherService) {
    return {
        restrict: 'E',
        template: `
            <div class="weather-widget">
                <div class="weather-loading" ng-if="loading">正在获取天气信息...</div>
                <div class="weather-error" ng-if="error">{{error}}</div>
                <div class="weather-content" ng-if="weather && !loading">
                    <div class="weather-main">
                        <div class="weather-icon">
                            <i class="icon-weather-{{weather.data.weatherCode}}"></i>
                        </div>
                        <div class="weather-info">
                            <div class="weather-temp">
                                {{weather.data.temperatureMax}}° / {{weather.data.temperatureMin}}°
                            </div>
                            <div class="weather-desc">{{weather.data.weatherDescription}}</div>
                        </div>
                    </div>
                    <div class="weather-forecast">
                        <div class="forecast-item" ng-repeat="day in weather.data.forecast">
                            <div class="forecast-date">{{day.date | dateFormat:'short'}}</div>
                            <div class="forecast-temp">{{day.temperatureMax}}°</div>
                            <div class="forecast-desc">{{day.weatherDescription}}</div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        link: function(scope, element, attrs) {
            scope.weather = null;
            scope.loading = true;
            scope.error = '';
            
            // 默认坐标 (悉尼)
            var defaultCoords = {
                latitude: -33.8688,
                longitude: 151.2093
            };
            
            // 获取天气信息
            function loadWeather() {
                scope.loading = true;
                
                WeatherService.getWeather(defaultCoords.latitude, defaultCoords.longitude)
                    .then(function(response) {
                        scope.weather = response.data;
                        scope.loading = false;
                    })
                    .catch(function(error) {
                        console.error('获取天气信息失败:', error);
                        scope.error = '无法获取天气信息';
                        scope.loading = false;
                    });
            }
            
            // 初始化
            loadWeather();
        }
    };
}]);