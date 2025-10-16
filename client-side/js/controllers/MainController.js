charityEventsApp.controller('MainController', ['$scope', '$rootScope', '$location', 'EventService', 'CategoryService', 
    function($scope, $rootScope, $location, EventService, CategoryService) {
    
    // 初始化数据
    $scope.featuredEvents = [];
    $scope.categories = [];
    $scope.stats = {};
    $scope.loadingFeatured = true;
    $scope.featuredError = '';
    
    // 加载精选活动
    function loadFeaturedEvents() {
        $scope.loadingFeatured = true;
        EventService.getFeaturedEvents()
            .then(function(response) {
                $scope.featuredEvents = response.data.data || response.data;
                $scope.loadingFeatured = false;
            })
            .catch(function(error) {
                console.error('加载精选活动失败:', error);
                $scope.featuredError = '加载精选活动失败，请稍后重试';
                $scope.loadingFeatured = false;
            });
    }
    
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
    
    // 加载统计数据
    function loadStats() {
        EventService.getStats()
            .then(function(response) {
                $scope.stats = response.data;
            })
            .catch(function(error) {
                console.error('加载统计数据失败:', error);
            });
    }
    
    // 切换移动端菜单
    $scope.toggleMenu = function() {
        $rootScope.menuOpen = !$rootScope.menuOpen;
    };
    
    // 按类别筛选
    $scope.filterByCategory = function(categoryId) {
        $location.path('/events').search({category: categoryId});
    };
    
    // 初始化
    loadFeaturedEvents();
    loadCategories();
    loadStats();
}]);