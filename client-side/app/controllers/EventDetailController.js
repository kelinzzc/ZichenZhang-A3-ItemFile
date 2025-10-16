angular.module('CharityEventsApp')
.controller('EventDetailController', ['$scope', '$routeParams', 'EventService', 'WeatherService', 'MessageService', function($scope, $routeParams, EventService, WeatherService, MessageService) {
    var vm = this;
    
    // 初始化数据
    vm.event = null;
    vm.registrations = [];
    vm.weather = null;
    vm.isLoading = true;
    vm.activeTab = 'details';
    
    /**
     * 初始化控制器
     */
    vm.init = function() {
        const eventId = $routeParams.id;
        
        if (!eventId) {
            MessageService.showError('无效的活动ID');
            return;
        }
        
        vm.loadEventDetails(eventId);
    };
    
    /**
     * 加载活动详情
     */
    vm.loadEventDetails = function(eventId) {
        vm.isLoading = true;
        
        EventService.getEventById(eventId)
            .then(function(response) {
                vm.event = response.event;
                vm.registrations = response.registrations;
                vm.isLoading = false;
                
                // 加载天气信息
                if (vm.event.latitude && vm.event.longitude) {
                    vm.loadWeatherInfo(vm.event.latitude, vm.event.longitude);
                }
            })
            .catch(function(error) {
                console.error('加载活动详情失败:', error);
                MessageService.showError('加载活动详情失败: ' + (error.message || '未知错误'));
                vm.isLoading = false;
            });
    };
    
    /**
     * 加载天气信息
     */
    vm.loadWeatherInfo = function(latitude, longitude) {
        WeatherService.getWeather(latitude, longitude)
            .then(function(weatherData) {
                vm.weather = weatherData;
            })
            .catch(function(error) {
                console.warn('加载天气信息失败:', error);
                // 不显示错误消息，因为天气是可选的
            });
    };
    
    /**
     * 切换标签页
     */
    vm.setActiveTab = function(tabName) {
        vm.activeTab = tabName;
    };
    
    /**
     * 获取可用票数
     */
    vm.getAvailableTickets = function() {
        if (!vm.event) return 0;
        
        const totalTicketsSold = vm.registrations.reduce((sum, reg) => sum + reg.ticket_count, 0);
        return vm.event.max_attendees - totalTicketsSold;
    };
    
    /**
     * 检查是否可以注册
     */
    vm.canRegister = function() {
        if (!vm.event) return false;
        
        if (!vm.event.is_active || vm.event.is_suspended) {
            return false;
        }
        
        const availableTickets = vm.getAvailableTickets();
        return availableTickets > 0;
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
        
        const totalTickets = vm.registrations.reduce((sum, reg) => sum + reg.ticket_count, 0);
        const averageTickets = totalTickets / vm.registrations.length;
        
        return {
            totalRegistrations: vm.registrations.length,
            totalTickets: totalTickets,
            averageTickets: Math.round(averageTickets * 10) / 10
        };
    };
    
    // 初始化控制器
    vm.init();
}]);