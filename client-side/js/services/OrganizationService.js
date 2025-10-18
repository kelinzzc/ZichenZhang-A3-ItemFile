// 组织相关 API 服务
charityEventsApp.factory('OrganizationService', ['$http', '$rootScope', function($http, $rootScope) {
    var baseUrl = $rootScope.apiBaseUrl + '/organizations';

    return {
        // 获取所有组织
        getAll: function() {
            return $http.get(baseUrl);
        },

        // 根据 ID 获取组织详情
        getById: function(id) {
            return $http.get(baseUrl + '/' + id);
        }
    };
}]);


