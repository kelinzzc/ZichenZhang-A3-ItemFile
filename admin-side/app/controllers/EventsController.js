angular.module('CharityEventsAdminApp')
.controller('EventsController', ['$scope', '$location', 'AdminEventService', 'ModalService', 
function($scope, $location, AdminEventService, ModalService) {
    var vm = this;

    // 初始化数据
    vm.events = [];
    vm.filteredEvents = [];
    vm.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    };
    vm.searchQuery = '';
    vm.isLoading = false;

    /**
     * 初始化控制器
     */
    vm.init = function() {
        vm.loadEvents();
    };

    /**
     * 加载活动列表
     */
    vm.loadEvents = function() {
        vm.isLoading = true;

        AdminEventService.getAllEvents()
            .then(function(response) {
                console.log('EventsController.loadEvents 响应:', response);
                var events = response.data || response;
                vm.events = events;
                vm.filteredEvents = events;
                vm.pagination.totalItems = events.length;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('加载活动列表失败:', error);
                vm.isLoading = false;
            });
    };

    /**
     * 搜索活动
     */
    vm.searchEvents = function() {
        if (!vm.searchQuery.trim()) {
            vm.filteredEvents = vm.events;
        } else {
            var query = vm.searchQuery.toLowerCase();
            vm.filteredEvents = vm.events.filter(function(event) {
                return event.title.toLowerCase().includes(query) ||
                       event.description.toLowerCase().includes(query) ||
                       event.location.toLowerCase().includes(query);
            });
        }
        vm.pagination.totalItems = vm.filteredEvents.length;
        vm.pagination.currentPage = 1;
    };

    /**
     * 删除活动
     */
    vm.deleteEvent = function(event) {
        ModalService.openDanger(
            '确认删除',
            `确定要删除活动 "${event.title}" 吗？此操作不可撤销。`,
            function() {
                AdminEventService.deleteEvent(event.id)
                    .then(function() {
                        vm.loadEvents(); // 重新加载列表
                    })
                    .catch(function(error) {
                        if (error.code === 'HAS_REGISTRATIONS') {
                            alert(`无法删除活动：该活动有 ${error.registrationsCount} 个注册记录`);
                        } else {
                            alert('删除失败：' + (error.message || '未知错误'));
                        }
                    });
            }
        );
    };

    /**
     * 编辑活动
     */
    vm.editEvent = function(event) {
        $location.path('/events/edit/' + event.id);
    };

    /**
     * 查看活动详情
     */
    vm.viewEvent = function(event) {
        $location.path('/events/' + event.id);
    };

    /**
     * 创建新活动
     */
    vm.createEvent = function() {
        $location.path('/events/new');
    };

    /**
     * 获取活动状态标签
     */
    vm.getEventStatus = function(event) {
        if (!event.is_active || event.is_suspended) {
            return { text: '已结束', class: 'status-inactive' };
        }

        var eventDate = new Date(event.event_date);
        var now = new Date();

        if (eventDate < now) {
            return { text: '已结束', class: 'status-inactive' };
        }

        // 检查票数
        var availableTickets = event.max_attendees - (event.total_tickets_sold || 0);
        if (availableTickets <= 0) {
            return { text: '已售完', class: 'status-sold-out' };
        }

        return { text: '进行中', class: 'status-active' };
    };

    /**
     * 格式化日期
     */
    vm.formatDate = function(value) {
        if (!value) return '';
        try { 
            return new Date(value).toLocaleDateString('zh-CN'); 
        } catch(e) { 
            return value; 
        }
    };

    // 初始化控制器
    vm.init();
}]);