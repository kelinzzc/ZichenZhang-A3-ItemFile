// 管理端 AngularJS 应用
angular.module('CharityEventsAdminApp', [
    'ngRoute'
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    // 使用 hashbang 模式
    $locationProvider.hashPrefix('!');
    
    // 路由配置
    $routeProvider
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'vm'
        })
        .when('/events', {
            templateUrl: 'views/events.html',
            controller: 'EventsController',
            controllerAs: 'vm'
        })
        .when('/events/new', {
            templateUrl: 'views/event-form.html',
            controller: 'EventFormController',
            controllerAs: 'vm'
        })
        .when('/events/edit/:id', {
            templateUrl: 'views/event-form.html',
            controller: 'EventFormController',
            controllerAs: 'vm'
        })
        .when('/events/:id', {
            templateUrl: 'views/event-detail.html',
            controller: 'EventDetailController',
            controllerAs: 'vm'
        })
        .when('/registrations', {
            templateUrl: 'views/registrations.html',
            controller: 'RegistrationsController',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}])
.run(['$rootScope', '$templateCache', function($rootScope, $templateCache) {
    // 防止浏览器缓存视图模板，确保你看到的始终是最新的 dashboard.html 等
    $rootScope.$on('$routeChangeStart', function() {
        try { $templateCache.removeAll(); } catch(e) {}
    });
}])
.controller('AdminLayoutController', ['$location', function($location) {
    var vm = this;
    
    // 侧边栏状态
    vm.isSidebarCollapsed = false;
    
    // 切换侧边栏
    vm.toggleSidebar = function() {
        vm.isSidebarCollapsed = !vm.isSidebarCollapsed;
    };
    
    // 检查当前路由是否激活
    vm.isActive = function(path) {
        return $location.path().indexOf(path) === 0;
    };
    
    // 获取页面标题
    vm.getPageTitle = function() {
        var path = $location.path();
        var titles = {
            '/dashboard': '仪表板',
            '/events': '活动管理',
            '/events/new': '创建活动',
            '/registrations': '注册记录管理'
        };
        
        // 处理编辑页面
        if (path.startsWith('/events/edit/')) {
            return '编辑活动';
        }
        
        // 处理活动详情页面
        if (path.startsWith('/events/') && !path.startsWith('/events/new')) {
            return '活动详情';
        }
        
        return titles[path] || '管理后台';
    };
}]);