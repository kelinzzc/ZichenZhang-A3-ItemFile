angular.module('CharityEventsAdminApp')
.controller('EventDetailController', ['$scope', '$routeParams', 'AdminEventService', 'AdminRegistrationService', 
function($scope, $routeParams, AdminEventService, AdminRegistrationService) {
    var vm = this;

    // 初始化数据
    vm.event = null;
    vm.registrations = [];
    vm.isLoading = true;
    vm.activeTab = 'details';
    vm.error = '';

    /**
     * 初始化控制器
     */
    vm.init = function() {
        var eventId = $routeParams.id;
        if (!eventId) {
            alert('无效的活动ID');
            return;
        }

        vm.loadEventDetails(eventId);
    };

    /**
     * 返回上一页
     */
    vm.goBack = function() {
        window.history.back();
    };

    /**
     * 编辑活动
     */
    vm.editEvent = function() {
        if (vm.event) {
            window.location.hash = '#/events/edit/' + vm.event.id;
        }
    };

    /**
     * 加载活动详情
     */
    vm.loadEventDetails = function(eventId) {
        console.log('开始加载活动详情，ID:', eventId);
        vm.isLoading = true;
        vm.error = '';

        AdminEventService.getEventById(eventId)
            .then(function(response) {
                console.log('活动详情API响应:', response);
                console.log('响应数据结构:', {
                    hasData: !!response.data,
                    hasEvent: !!response.data.event,
                    hasRegistrations: !!response.data.registrations,
                    eventKeys: response.data.event ? Object.keys(response.data.event) : 'N/A',
                    registrationsCount: response.data.registrations ? response.data.registrations.length : 0
                });
                
                vm.event = response.data.event;
                vm.registrations = response.data.registrations;
                vm.isLoading = false;
                
                console.log('数据设置完成:', {
                    event: vm.event,
                    registrations: vm.registrations,
                    isLoading: vm.isLoading
                });
            })
            .catch(function(error) {
                console.error('加载活动详情失败:', error);
                vm.error = error.message || '无法加载活动详情，请稍后重试';
                vm.isLoading = false;
            });
    };

    /**
     * 切换标签页
     */
    vm.setActiveTab = function(tabName) {
        vm.activeTab = tabName;
    };

    /**
     * 获取注册统计
     */
    vm.getRegistrationStats = function() {
        if (!vm.registrations || vm.registrations.length === 0) {
            return {
                totalRegistrations: 0,
                totalTickets: 0,
                averageTickets: 0
            };
        }

        var totalTickets = vm.registrations.reduce(function(sum, reg) {
            return sum + reg.ticket_count;
        }, 0);

        var averageTickets = totalTickets / vm.registrations.length;

        return {
            totalRegistrations: vm.registrations.length,
            totalTickets: totalTickets,
            averageTickets: Math.round(averageTickets * 10) / 10
        };
    };

    /**
     * 格式化日期
     */
    vm.formatDate = function(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * 格式化金额
     */
    vm.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '';
        return '¥' + parseFloat(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    /**
     * 计算筹款进度
     */
    vm.calculateProgress = function(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };

    // 初始化控制器
    vm.init();
}]);