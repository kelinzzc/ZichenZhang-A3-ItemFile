angular.module('CharityEventsAdminApp')
.factory('AdminRegistrationService', ['AdminApiService', '$q', function(AdminApiService, $q) {
    return {
        /**
         * 获取所有注册记录
         */
        getAllRegistrations: function(params = {}) {
            console.log('AdminRegistrationService.getAllRegistrations 调用，参数:', params);
            return AdminApiService.get('/registrations', params)
                .then(response => {
                    console.log('AdminRegistrationService 响应:', response);
                    return response.data;
                })
                .catch(error => {
                    console.error('获取注册记录失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取活动注册记录
         */
        getRegistrationsByEventId: function(eventId) {
            return AdminApiService.get(`/registrations/event/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动注册记录失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 删除注册记录
         */
        deleteRegistration: function(registrationId) {
            return AdminApiService.delete(`/registrations/${registrationId}`)
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('删除注册记录失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取注册统计
         */
        getRegistrationStats: function() {
            return AdminApiService.get('/registrations/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('获取注册统计失败:', error);
                    return $q.reject(error);
                });
        }
    };
}]);