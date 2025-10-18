// AngularJS main application module definition
var charityEventsApp = angular.module('charityEventsApp', ['ngRoute']);

// Route configuration
charityEventsApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    // Configure route mode to hashbang mode (#!/)
    $locationProvider.hashPrefix('!');
    
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

// Run configuration
charityEventsApp.run(['$rootScope', '$location', function($rootScope, $location) {
    // Global configuration
    $rootScope.apiBaseUrl = 'http://localhost:3000/api';
    $rootScope.appName = 'Charity Events Platform';
    $rootScope.menuOpen = false;
    
    // Route change listener
    $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.currentPath = $location.path();
        $rootScope.menuOpen = false; // Close mobile menu
    });
}]);