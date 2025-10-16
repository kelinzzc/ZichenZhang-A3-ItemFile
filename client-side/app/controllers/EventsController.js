angular.module('CharityEventsApp')
.controller('EventsController', ['$scope', 'EventService', 'MessageService', function($scope, EventService, MessageService) {
    var vm = this;
    
    // 初始化数据
    vm.events = [];
    vm.categories = [];
    vm.organizations = [];
    vm.filters = {
        category: '',
        organization: '',
        location: '',
        status: 'active'
    };
    vm.pagination = {
        currentPage: 1,
        itemsPerPage: 9,
        totalItems: 0
    };
    vm.isLoading = false;
    vm.searchQuery = '';
    
    /**
     * 初始化控制器
     */
    vm.init = function() {
        vm.loadEvents();
        vm.loadCategories();
        vm.loadOrganizations();
    };
    
    /**
     * 加载活动列表
     */
    vm.loadEvents = function() {
        vm.isLoading = true;
        
        const params = {
            page: vm.pagination.currentPage,
            limit: vm.pagination.itemsPerPage
        };
        
        // 添加筛选条件
        if (vm.filters.category) {
            params.category = vm.filters.category;
        }
        if (vm.filters.organization) {
            params.organization = vm.filters.organization;
        }
        if (vm.filters.location) {
            params.location = vm.filters.location;
        }
        if (vm.filters.status) {
            params.status = vm.filters.status;
        }
        
        EventService.getAllEvents(params)
            .then(function(response) {
                vm.events = response.data || response;
                vm.pagination.totalItems = response.pagination ? response.pagination.total : vm.events.length;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('加载活动列表失败:', error);
                MessageService.showError('加载活动列表失败');
                vm.isLoading = false;
            });
    };
    
    /**
     * 加载类别
     */
    vm.loadCategories = function() {
        EventService.getCategories()
            .then(function(categories) {
                vm.categories = categories;
            })
            .catch(function(error) {
                console.warn('加载类别失败:', error);
            });
    };
    
    /**
     * 加载组织
     */
    vm.loadOrganizations = function() {
        EventService.getOrganizations()
            .then(function(organizations) {
                vm.organizations = organizations;
            })
            .catch(function(error) {
                console.warn('加载组织失败:', error);
            });
    };
    
    /**
     * 应用筛选
     */
    vm.applyFilters = function() {
        vm.pagination.currentPage = 1;
        vm.loadEvents();
    };
    
    /**
     * 重置筛选
     */
    vm.resetFilters = function() {
        vm.filters = {
            category: '',
            organization: '',
            location: '',
            status: 'active'
        };
        vm.pagination.currentPage = 1;
        vm.loadEvents();
    };
    
    /**
     * 搜索活动
     */
    vm.searchEvents = function() {
        if (!vm.searchQuery.trim()) {
            vm.loadEvents();
            return;
        }
        
        vm.isLoading = true;
        
        EventService.searchEvents({
            q: vm.searchQuery,
            page: vm.pagination.currentPage,
            limit: vm.pagination.itemsPerPage
        })
        .then(function(response) {
            vm.events = response.data || response;
            vm.pagination.totalItems = response.pagination ? response.pagination.total : vm.events.length;
            vm.isLoading = false;
        })
        .catch(function(error) {
            console.error('搜索活动失败:', error);
            MessageService.showError('搜索活动失败');
            vm.isLoading = false;
        });
    };
    
    /**
     * 改变页码
     */
    vm.pageChanged = function() {
        if (vm.searchQuery) {
            vm.searchEvents();
        } else {
            vm.loadEvents();
        }
    };
    
    /**
     * 获取可用票数
     */
    vm.getAvailableTickets = function(event) {
        if (!event.max_attendees || !event.total_tickets_sold) {
            return event.max_attendees || 0;
        }
        return event.max_attendees - event.total_tickets_sold;
    };
    
    /**
     * 检查活动是否可注册
     */
    vm.canRegister = function(event) {
        if (!event.is_active || event.is_suspended) {
            return false;
        }
        
        const availableTickets = vm.getAvailableTickets(event);
        return availableTickets > 0;
    };
    
    // 初始化控制器
    vm.init();
}]);