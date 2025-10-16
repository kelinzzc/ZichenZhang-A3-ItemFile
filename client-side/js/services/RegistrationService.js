charityEventsApp.factory('RegistrationService', ['$http', '$rootScope', function($http, $rootScope) {
    
    var baseUrl = $rootScope.apiBaseUrl + '/registrations';
    
    return {
        // 获取所有注册记录
        getAll: function(params) {
            return $http.get(baseUrl, { params: params });
        },
        
        // 获取活动的注册记录
        getByEventId: function(eventId) {
            return $http.get(baseUrl + '/event/' + eventId);
        },
        
        // 创建注册记录
        create: function(registrationData) {
            return $http.post(baseUrl, registrationData);
        },
        
        // 删除注册记录
        delete: function(id) {
            return $http.delete(baseUrl + '/' + id);
        },
        
        // 获取注册统计
        getStats: function() {
            return $http.get(baseUrl + '/stats');
        }
    };
}]);