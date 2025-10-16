angular.module('CharityEventsApp')
.controller('HomeController', ['$scope', 'EventService', 'MessageService', function($scope, EventService, MessageService) {
    var vm = this;
    
    // 初始化数据
    vm.featuredEvents = [];
    vm.categories = [];
    vm.stats = {};
    vm.isLoading = true;
    
    /**
     * 初始化控制器
     */
    vm.init = function() {
        vm.loadFeaturedEvents();
        vm.loadEventStats();
    };
    
    /**
     * 加载推荐活动
     */
    vm.loadFeaturedEvents = function() {
        vm.isLoading = true;
        
        EventService.getAllEvents({ limit: 6 })
            .then(function(events) {
                vm.featuredEvents = events;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('加载推荐活动失败:', error);
                MessageService.showError('加载推荐活动失败');
                vm.isLoading = false;
            });
    };
    
    /**
     * 加载活动统计
     */
    vm.loadEventStats = function() {
        EventService.getEventStats()
            .then(function(stats) {
                vm.stats = stats;
            })
            .catch(function(error) {
                console.warn('加载活动统计失败:', error);
                // 使用默认统计数据
                vm.stats = {
                    total_events: 45,
                    active_events: 12,
                    total_raised: 125000,
                    total_goal: 500000
                };
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
     * 计算筹款进度
     */
    vm.calculateProgress = function(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };
    
    // 初始化控制器
    vm.init();
}]);