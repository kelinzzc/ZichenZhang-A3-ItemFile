charityEventsApp.controller('EventsController', ['$scope', '$location', '$routeParams', 'EventService', 'CategoryService',
    function($scope, $location, $routeParams, EventService, CategoryService) {
    
    // 初始化数据
    $scope.events = [];
    $scope.categories = [];
    $scope.loading = true;
    $scope.error = '';
    
    // 分页配置
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 9,
        totalItems: 0
    };
    
    // 筛选条件
    $scope.filters = {
        category: $routeParams.category || '',
        location: $routeParams.location || '',
        date: $routeParams.date || ''
    };
    
    // 检查活动状态
    $scope.isUpcoming = function(event) {
        if (!event || !event.event_date) return false;
        var eventDate = new Date(event.event_date);
        var now = new Date();
        return eventDate > now;
    };
    
    $scope.isPast = function(event) {
        if (!event || !event.event_date) return false;
        var eventDate = new Date(event.event_date);
        var now = new Date();
        return eventDate < now;
    };
    
    // 计算筹款进度
    $scope.calculateProgress = function(event) {
        if (!event) return 0;
        return (event.current_amount / event.goal_amount) * 100;
    };
    
    // 加载活动列表
    function loadEvents() {
        $scope.loading = true;
        
        var params = {
            page: $scope.pagination.currentPage,
            limit: $scope.pagination.itemsPerPage
        };
        
        // 添加筛选条件
        if ($scope.filters.category) params.category = $scope.filters.category;
        if ($scope.filters.location) params.location = $scope.filters.location;
        if ($scope.filters.date) params.date = $scope.filters.date;
        
        EventService.getAll(params)
            .then(function(response) {
                $scope.events = response.data.data || response.data;
                $scope.pagination.totalItems = response.data.pagination ? response.data.pagination.total : $scope.events.length;
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('Failed to load activity list:', error);
                $scope.error = 'Failed to load activity list, Please try again later.';
                $scope.loading = false;
            });
    }
    
    // 加载类别
    function loadCategories() {
        CategoryService.getAll()
            .then(function(response) {
                $scope.categories = response.data;
            })
            .catch(function(error) {
                console.error('Failed to load category:', error);
            });
    }
    
    // 应用筛选
    $scope.applyFilters = function() {
        $scope.pagination.currentPage = 1;
        
        // 更新URL参数
        var queryParams = {};
        if ($scope.filters.category) queryParams.category = $scope.filters.category;
        if ($scope.filters.location) queryParams.location = $scope.filters.location;
        if ($scope.filters.date) queryParams.date = $scope.filters.date;
        
        $location.search(queryParams);
        loadEvents();
    };
    
    // 清除筛选
    $scope.clearFilters = function() {
        $scope.filters = {
            category: '',
            location: '',
            date: ''
        };
        $scope.pagination.currentPage = 1;
        $location.search({});
        loadEvents();
    };
    
    // 页面变化
    $scope.pageChanged = function() {
        loadEvents();
    };
    
    // 初始化
    loadEvents();
    loadCategories();
}]);