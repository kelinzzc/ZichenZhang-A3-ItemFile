charityEventsApp.controller('SearchController', ['$scope', '$location', 'EventService', 'CategoryService',
    function($scope, $location, EventService, CategoryService) {
    
    // 初始化数据
    $scope.events = [];
    $scope.categories = [];
    $scope.loading = false;
    $scope.error = '';
    $scope.searchPerformed = false;
    
    // 搜索参数
    $scope.searchParams = {
        q: '',
        category: '',
        location: '',
        date_from: '',
        date_to: ''
    };
    
    // 检查活动状态
    $scope.isUpcoming = function(event) {
        if (!event || !event.event_date) return false;
        var eventDate = new Date(event.event_date);
        var now = new Date();
        return eventDate > now;
    };
    
    // 计算筹款进度
    $scope.calculateProgress = function(event) {
        if (!event) return 0;
        return (event.current_amount / event.goal_amount) * 100;
    };
    
    // 执行搜索
    $scope.performSearch = function() {
        if (!$scope.searchParams.q && !$scope.searchParams.category && 
            !$scope.searchParams.location && !$scope.searchParams.date_from && 
            !$scope.searchParams.date_to) {
            $scope.error = '请输入至少一个搜索条件';
            return;
        }
        
        $scope.loading = true;
        $scope.error = '';
        $scope.searchPerformed = true;
        
        EventService.search($scope.searchParams)
            .then(function(response) {
                $scope.events = response.data.data || response.data;
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('搜索失败:', error);
                $scope.error = '搜索失败，请稍后重试';
                $scope.loading = false;
            });
    };
    
    // 清除搜索
    $scope.clearSearch = function() {
        $scope.searchParams = {
            q: '',
            category: '',
            location: '',
            date_from: '',
            date_to: ''
        };
        $scope.events = [];
        $scope.searchPerformed = false;
        $scope.error = '';
    };
    
    // 加载类别
    function loadCategories() {
        CategoryService.getAll()
            .then(function(response) {
                $scope.categories = response.data;
            })
            .catch(function(error) {
                console.error('加载类别失败:', error);
            });
    }
    
    // 初始化
    loadCategories();
}]);