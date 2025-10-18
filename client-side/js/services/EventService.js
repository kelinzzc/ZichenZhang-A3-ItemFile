

charityEventsApp.factory('EventService', ['$http', '$rootScope', function($http, $rootScope) {
    var baseUrl = $rootScope.apiBaseUrl + '/events';

    function buildParams(params) {
        if (!params || typeof params !== 'object') return {};
        var cleaned = {};
        Object.keys(params).forEach(function(key) {
            var value = params[key];
            if (value !== undefined && value !== null && value !== '') {
                cleaned[key] = value;
            }
        });
        return cleaned;
    }

    return {
        // 获取所有活动
        getAll: function(params) {
            console.log('EventService.getAll 调用，参数:', params);
            return $http.get(baseUrl, { params: buildParams(params) })
                .then(function(response) {
                    console.log('EventService.getAll 响应:', response);
                    return response;
                })
                .catch(function(error) {
                    console.error('EventService.getAll 错误:', error);
                    throw error;
                });
        },

        // 根据 ID 获取活动详情
        getById: function(id) {
            return $http.get(baseUrl + '/' + id);
        },

        // 精选活动
        getFeaturedEvents: function() {
            // 复用列表接口，取前若干条
            return $http.get(baseUrl, { params: { page: 1, limit: 9 } });
        },

        // 获取活动统计信息
        getStats: function() {
            return $http.get(baseUrl + '/stats');
        },

        // 搜索活动
        search: function(params) {
            console.log('EventService.search 调用，参数:', params);
            return $http.get(baseUrl + '/search', { params: buildParams(params) })
                .then(function(response) {
                    console.log('EventService.search 响应:', response);
                    return response;
                })
                .catch(function(error) {
                    console.error('EventService.search 错误:', error);
                    throw error;
                });
        }
    };
}]);


