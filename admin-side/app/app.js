angular.module('CharityEventsAdminApp', [
    'ngRoute'
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    
    // Routes
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
    $rootScope.$on('$routeChangeStart', function() {
        try { $templateCache.removeAll(); } catch(e) {}
    });
}])
.controller('AdminLayoutController', ['$location', function($location) {
    var vm = this;
    
    // Sidebar state
    vm.isSidebarCollapsed = false;
    
    // Toggle sidebar
    vm.toggleSidebar = function() {
        vm.isSidebarCollapsed = !vm.isSidebarCollapsed;
    };
    
    // Check if current route is active
    vm.isActive = function(path) {
        return $location.path().indexOf(path) === 0;
    };
    
    // Get page title
    vm.getPageTitle = function() {
        var path = $location.path();
        var titles = {
            '/dashboard': 'Dashboard',
            '/events': 'Event Management',
            '/events/new': 'Create Event',
            '/registrations': 'Registration Records Management'
        };
        
        // Handle edit page
        if (path.startsWith('/events/edit/')) {
            return 'Edit Event';
        }
        
        // Handle event details page
        if (path.startsWith('/events/') && !path.startsWith('/events/new')) {
            return 'Event Details';
        }
        
        return titles[path] || 'Admin Panel';
    };
}]);