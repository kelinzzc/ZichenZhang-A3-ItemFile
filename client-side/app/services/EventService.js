angular.module('CharityEventsApp')
.factory('EventService', ['ApiService', '$q', function(ApiService, $q) {
    
    return {
        /**
         * 获取所有活动
         */
        getAllEvents: function(params = {}) {
            return ApiService.get('/events', params)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动列表失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取单个活动详情（包含注册记录）
         */
        getEventById: function(eventId) {
            if (!eventId) {
                return $q.reject({ message: '活动ID不能为空' });
            }

            return ApiService.get(`/events/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动详情失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 搜索活动
         */
        searchEvents: function(searchParams) {
            return ApiService.get('/events/search', searchParams)
                .then(response => response.data)
                .catch(error => {
                    console.error('搜索活动失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取活动统计
         */
        getEventStats: function() {
            return ApiService.get('/events/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('获取活动统计失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 获取所有类别
         */
        getCategories: function() {
            // 首先尝试从API获取
            return ApiService.get('/categories')
                .then(response => response.data)
                .catch(error => {
                    console.warn('获取类别失败，使用默认数据:', error);
                    // 返回默认类别数据作为降级方案
                    return [
                        { id: 1, name: '慈善晚宴', description: '正式的筹款晚宴活动' },
                        { id: 2, name: '趣味跑', description: '体育类慈善活动' },
                        { id: 3, name: '艺术展览', description: '艺术类筹款活动' },
                        { id: 4, name: '线上募捐', description: '虚拟筹款活动' },
                        { id: 5, name: '社区服务', description: '社区志愿服务和公益活动' },
                        { id: 6, name: '教育讲座', description: '知识分享和教育类活动' }
                    ];
                });
        },

        /**
         * 获取所有组织
         */
        getOrganizations: function() {
            return ApiService.get('/organizations')
                .then(response => response.data)
                .catch(error => {
                    console.warn('获取组织失败，使用默认数据:', error);
                    // 返回默认组织数据作为降级方案
                    return [
                        { id: 1, name: 'Hope Light Charity Foundation', description: '致力于帮助贫困儿童和家庭改善生活条件' },
                        { id: 2, name: 'Care Aid Organization', description: '专注于医疗援助和健康促进的非营利组织' }
                    ];
                });
        },

        /**
         * 创建新活动（管理端）
         */
        createEvent: function(eventData) {
            return ApiService.post('/events', eventData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('创建活动失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 更新活动（管理端）
         */
        updateEvent: function(eventId, eventData) {
            return ApiService.put(`/events/${eventId}`, eventData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('更新活动失败:', error);
                    return $q.reject(error);
                });
        },

        /**
         * 删除活动（管理端）
         */
        deleteEvent: function(eventId) {
            return ApiService.delete(`/events/${eventId}`)
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('删除活动失败:', error);
                    return $q.reject(error);
                });
        }
    };
}]);