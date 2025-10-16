angular.module('CharityEventsAdminApp')
.controller('DashboardController', ['$scope', 'AdminEventService', 'AdminRegistrationService', 
function($scope, AdminEventService, AdminRegistrationService) {
    var vm = this;

    // 初始化数据
    vm.stats = {};
    vm.recentEvents = [];
    vm.recentRegistrations = [];
    vm.isLoading = true;

    /**
     * 初始化控制器
     */
    vm.init = function() {
        vm.loadDashboardData();
    };

    /**
     * 加载仪表板数据
     */
    vm.loadDashboardData = function() {
        vm.isLoading = true;

        // 并行加载所有数据
        Promise.all([
            vm.loadEventStats(),
            vm.loadRegistrationStats(),
            vm.loadRecentEvents(),
            vm.loadRecentRegistrations()
        ]).finally(function() {
            vm.isLoading = false;
            $scope.$apply(); // 手动触发 AngularJS 更新
        });
    };

    /**
     * 加载活动统计
     */
    vm.loadEventStats = function() {
        return AdminEventService.getEventStats()
            .then(function(stats) {
                vm.stats.events = stats;
            })
            .catch(function(error) {
                console.error('加载活动统计失败:', error);
            });
    };

    /**
     * 加载注册统计
     */
    vm.loadRegistrationStats = function() {
        return AdminRegistrationService.getRegistrationStats()
            .then(function(stats) {
                vm.stats.registrations = stats;
            })
            .catch(function(error) {
                console.error('加载注册统计失败:', error);
            });
    };

    /**
     * 加载最近活动
     */
    vm.loadRecentEvents = function() {
        return AdminEventService.getAllEvents({ limit: 5 })
            .then(function(events) {
                vm.recentEvents = events;
            })
            .catch(function(error) {
                console.error('加载最近活动失败:', error);
            });
    };

    /**
     * 加载最近注册记录
     */
    vm.loadRecentRegistrations = function() {
        return AdminRegistrationService.getAllRegistrations({ limit: 10 })
            .then(function(registrations) {
                vm.recentRegistrations = registrations;
            })
            .catch(function(error) {
                console.error('加载最近注册记录失败:', error);
            });
    };

    /**
     * 格式化数字
     */
    vm.formatNumber = function(number) {
        if (!number) return '0';
        return number.toLocaleString('zh-CN');
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

    // 初始化控制器
    vm.init();
}]);