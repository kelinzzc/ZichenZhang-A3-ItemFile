charityEventsApp.factory('CategoryService', ['$http', '$rootScope', function($http, $rootScope) {
    
    var baseUrl = $rootScope.apiBaseUrl + '/categories';
    
    return {
        // 获取所有类别
        getAll: function() {
            console.log('CategoryService.getAll 调用');
            return $http.get(baseUrl)
                .then(function(response) {
                    console.log('CategoryService.getAll 响应:', response);
                    return response;
                })
                .catch(function(error) {
                    console.error('CategoryService.getAll 错误:', error);
                    throw error;
                });
        },
        
        // 根据ID获取类别
        getById: function(id) {
            return $http.get(baseUrl + '/' + id);
        }
    };
}]);