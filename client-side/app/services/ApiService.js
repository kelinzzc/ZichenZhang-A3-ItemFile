angular.module('CharityEventsApp')
.factory('ApiService', ['$http', '$q', function($http, $q) {
    
    const API_BASE_URL = 'http://localhost:3000/api';
    
    return {
        /**
         * 通用 GET 请求
         */
        get: function(endpoint, params = {}) {
            return $http.get(`${API_BASE_URL}${endpoint}`, { params: params })
                .then(response => {
                    if (response.data.success) {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }
                })
                .catch(error => {
                    console.error('API GET Error:', error);
                    return $q.reject(this.handleError(error));
                });
        },

        /**
         * 通用 POST 请求
         */
        post: function(endpoint, data = {}) {
            return $http.post(`${API_BASE_URL}${endpoint}`, data)
                .then(response => {
                    if (response.data.success) {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }
                })
                .catch(error => {
                    console.error('API POST Error:', error);
                    return $q.reject(this.handleError(error));
                });
        },

        /**
         * 通用 PUT 请求
         */
        put: function(endpoint, data = {}) {
            return $http.put(`${API_BASE_URL}${endpoint}`, data)
                .then(response => {
                    if (response.data.success) {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }
                })
                .catch(error => {
                    console.error('API PUT Error:', error);
                    return $q.reject(this.handleError(error));
                });
        },

        /**
         * 通用 DELETE 请求
         */
        delete: function(endpoint) {
            return $http.delete(`${API_BASE_URL}${endpoint}`)
                .then(response => {
                    if (response.data.success) {
                        return response.data;
                    } else {
                        return $q.reject(response.data);
                    }
                })
                .catch(error => {
                    console.error('API DELETE Error:', error);
                    return $q.reject(this.handleError(error));
                });
        },

        /**
         * 错误处理
         */
        handleError: function(error) {
            if (error.data) {
                return {
                    message: error.data.message || '请求失败',
                    code: error.data.code,
                    details: error.data.details
                };
            } else if (error.status === 0) {
                return {
                    message: '网络连接失败，请检查网络连接',
                    code: 'NETWORK_ERROR'
                };
            } else if (error.status === 404) {
                return {
                    message: '请求的资源不存在',
                    code: 'NOT_FOUND'
                };
            } else if (error.status >= 500) {
                return {
                    message: '服务器错误，请稍后重试',
                    code: 'SERVER_ERROR'
                };
            } else {
                return {
                    message: '发生未知错误',
                    code: 'UNKNOWN_ERROR'
                };
            }
        }
    };
}]);