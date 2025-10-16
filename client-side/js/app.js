// AngularJS 主应用模块定义
var charityEventsApp = angular.module('charityEventsApp', ['ngRoute']);

// 路由配置
charityEventsApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        })
        .when('/events', {
            templateUrl: 'views/events.html',
            controller: 'EventsController'
        })
        .when('/events/:id', {
            templateUrl: 'views/event-details.html',
            controller: 'EventDetailsController'
        })
        .when('/register/:eventId', {
            templateUrl: 'views/register.html',
            controller: 'RegisterController'
        })
        .when('/search', {
            templateUrl: 'views/search.html',
            controller: 'SearchController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

// 运行配置
charityEventsApp.run(['$rootScope', '$location', function($rootScope, $location) {
    // 全局配置
    $rootScope.apiBaseUrl = 'http://localhost:3000/api';
    $rootScope.appName = '慈善活动平台';
    $rootScope.menuOpen = false;
    
    // 路由变化监听
    $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.currentPath = $location.path();
        $rootScope.menuOpen = false; // 关闭移动端菜单
    });
}]);