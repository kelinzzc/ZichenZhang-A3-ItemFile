angular.module('CharityEventsApp')
.factory('ApiService', ['$http', '$q', function($http, $q) {
    
    const API_BASE_URL = 'http://localhost:3000/api';
    
    return {
        /**
         * Generic GET request
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
         * Generic POST request
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
         * Generic PUT request
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
         * Generic DELETE request
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
         * Error handling
         */
        handleError: function(error) {
            if (error.data) {
                return {
                    message: error.data.message || 'Request failed',
                    code: error.data.code,
                    details: error.data.details
                };
            } else if (error.status === 0) {
                return {
                    message: 'Network connection failed, please check your network connection',
                    code: 'NETWORK_ERROR'
                };
            } else if (error.status === 404) {
                return {
                    message: 'Requested resource not found',
                    code: 'NOT_FOUND'
                };
            } else if (error.status >= 500) {
                return {
                    message: 'Server error, please try again later',
                    code: 'SERVER_ERROR'
                };
            } else {
                return {
                    message: 'An unknown error occurred',
                    code: 'UNKNOWN_ERROR'
                };
            }
        }
    };
}]);