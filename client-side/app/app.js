// 慈善活动平台主 AngularJS 应用
angular.module('CharityEventsApp', [
    'ngRoute',
    'ngSanitize'
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    // 启用 HTML5 模式（去除 URL 中的 #）
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
    
    // 路由配置
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController',
            controllerAs: 'vm'
        })
        .when('/events', {
            templateUrl: 'views/events.html',
            controller: 'EventsController',
            controllerAs: 'vm'
        })
        .when('/events/:id', {
            templateUrl: 'views/event-detail.html',
            controller: 'EventDetailController',
            controllerAs: 'vm'
        })
        .when('/register/:eventId', {
            templateUrl: 'views/registration.html',
            controller: 'RegistrationController',
            controllerAs: 'vm'
        })
        .when('/search', {
            templateUrl: 'views/search.html',
            controller: 'SearchController',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/'
        });
}])
.run(['$rootScope', '$location', 'EventService', 'MessageService', function($rootScope, $location, EventService, MessageService) {
    
    // 全局加载状态
    $rootScope.isLoading = false;
    
    // 全局应用信息
    $rootScope.app = {
        name: '慈善活动平台',
        version: '1.0.0',
        description: '连接爱心与需要帮助的人'
    };
    
    // 加载全局数据（类别、组织等）
    $rootScope.loadGlobalData = function() {
        EventService.getCategories().then(function(categories) {
            $rootScope.categories = categories;
        });
        
        EventService.getOrganizations().then(function(organizations) {
            $rootScope.organizations = organizations;
        });
    };
    
    // 初始化全局数据
    $rootScope.loadGlobalData();
    
    // 路由变化事件
    $rootScope.$on('$routeChangeStart', function() {
        $rootScope.isLoading = true;
    });
    
    $rootScope.$on('$routeChangeSuccess', function() {
        $rootScope.isLoading = false;
        // 滚动到顶部
        window.scrollTo(0, 0);
    });
    
    $rootScope.$on('$routeChangeError', function() {
        $rootScope.isLoading = false;
        MessageService.showError('页面加载失败，请刷新重试');
    });
    
    // 全局工具函数
    $rootScope.formatDate = function(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    $rootScope.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '';
        return '¥' + parseFloat(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    
    $rootScope.calculateProgress = function(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };
}]);