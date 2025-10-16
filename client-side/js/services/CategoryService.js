charityEventsApp.factory('CategoryService', ['$http', '$rootScope', function($http, $rootScope) {
    
    var baseUrl = $rootScope.apiBaseUrl + '/categories';
    
    return {
        // 获取所有类别
        getAll: function() {
            return $http.get(baseUrl);
        },
        
        // 根据ID获取类别
        getById: function(id) {
            return $http.get(baseUrl + '/' + id);
        }
    };
}]);