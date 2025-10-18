charityEventsApp.factory('WeatherService', ['$http', '$rootScope', function($http, $rootScope) {
    
    var baseUrl = $rootScope.apiBaseUrl + '/weather';
    
    return {
        // 获取天气
        getWeather: function(latitude, longitude) {
            return $http.get(baseUrl, {
                params: {
                    latitude: latitude,
                    longitude: longitude
                }
            });
        }
    };
}]);