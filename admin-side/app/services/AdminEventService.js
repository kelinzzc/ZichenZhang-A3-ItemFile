angular.module('CharityEventsAdminApp')
.factory('AdminEventService', ['AdminApiService', '$q', function(AdminApiService, $q) {
    return {
        /**
         * 获取所有活动（管理端）
         */
        getAllEvents: function(params = {}) {
            return AdminApiService.get('/events', params)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动列表失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取单个活动详情
         */
        getEventById: function(eventId) {
            if (!eventId) {
                return $q.reject({ message: '活动ID不能为空' });
            }

            return AdminApiService.get(`/events/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动详情失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 创建新活动
         */
        createEvent: function(eventData) {
            return AdminApiService.post('/events', eventData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('创建活动失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 更新活动
         */
        updateEvent: function(eventId, eventData) {
            return AdminApiService.put(`/events/${eventId}`, eventData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('更新活动失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 删除活动（A3要求：有注册记录时阻止删除）
         */
        deleteEvent: function(eventId) {
            return AdminApiService.delete(`/events/${eventId}`)
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('删除活动失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取活动统计
         */
        getEventStats: function() {
            return AdminApiService.get('/events/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动统计失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 验证活动数据
         */
        validateEvent: function(eventData) {
            const errors = [];

            if (!eventData.title || eventData.title.trim().length === 0) {
                errors.push('活动标题是必需的');
            }

            if (!eventData.description || eventData.description.trim().length === 0) {
                errors.push('活动描述是必需的');
            }

            if (!eventData.event_date) {
                errors.push('活动日期是必需的');
            } else if (new Date(eventData.event_date) <= new Date()) {
                errors.push('活动日期必须是将来的时间');
            }

            if (!eventData.location || eventData.location.trim().length === 0) {
                errors.push('活动地点是必需的');
            }

            if (!eventData.max_attendees || eventData.max_attendees <= 0) {
                errors.push('最大参与人数必须大于0');
            }

            if (!eventData.goal_amount || eventData.goal_amount < 0) {
                errors.push('筹款目标不能为负数');
            }

            if (!eventData.ticket_price || eventData.ticket_price < 0) {
                errors.push('票价不能为负数');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
    };
}]);