angular.module('CharityEventsApp')
.factory('RegistrationService', ['ApiService', '$q', function(ApiService, $q) {
    
    return {
        /**
         * 创建注册记录（A3核心功能）
         */
        createRegistration: function(registrationData) {
            return ApiService.post('/registrations', registrationData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('创建注册记录失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取活动的所有注册记录（按时间倒序）
         */
        getRegistrationsByEventId: function(eventId) {
            if (!eventId) {
                return $q.reject({ message: '活动ID不能为空' });
            }

            return ApiService.get(`/registrations/event/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取注册记录失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取所有注册记录（管理端）
         */
        getAllRegistrations: function(params = {}) {
            return ApiService.get('/registrations', params)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取所有注册记录失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 删除注册记录（管理端）
         */
        deleteRegistration: function(registrationId) {
            return ApiService.delete(`/registrations/${registrationId}`)
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
            return ApiService.get('/registrations/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('获取注册统计失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 验证注册数据
         */
        validateRegistration: function(registrationData) {
            const errors = [];

            if (!registrationData.event_id) {
                errors.push('请选择活动');
            }

            if (!registrationData.full_name || registrationData.full_name.trim().length === 0) {
                errors.push('请输入姓名');
            }

            if (!registrationData.email || registrationData.email.trim().length === 0) {
                errors.push('请输入邮箱地址');
            } else if (!this.isValidEmail(registrationData.email)) {
                errors.push('请输入有效的邮箱地址');
            }

            if (!registrationData.ticket_count || registrationData.ticket_count <= 0) {
                errors.push('票数必须大于0');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * 邮箱验证
         */
        isValidEmail: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    };
}]);