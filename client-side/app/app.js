// Charity Events Platform Main AngularJS Application
angular.module('CharityEventsApp', [
    'ngRoute',
    'ngSanitize'
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    // Enable HTML5 mode
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
    
    // Routes
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
.run(['$rootScope', '$location', 'EventService', 
function($rootScope, $location, EventService) {
    
    // Loading state
    $rootScope.isLoading = false;
    
    // Application information
    $rootScope.app = {
        name: 'Charity Events Platform',
        version: '1.0.0',
        description: 'Connecting caring people with those in need'
    };
    
    // Load global data
    $rootScope.loadGlobalData = function() {
        EventService.getCategories().then(function(categories) {
            $rootScope.categories = categories;
        });
        
        EventService.getOrganizations().then(function(organizations) {
            $rootScope.organizations = organizations;
        });
    };
    
    // Initialize global data
    $rootScope.loadGlobalData();
    
    // Route change events
    $rootScope.$on('$routeChangeStart', function() {
        $rootScope.isLoading = true;
    });
    
    $rootScope.$on('$routeChangeSuccess', function() {
        $rootScope.isLoading = false;
        // Scroll to top
        window.scrollTo(0, 0);
    });
    
    $rootScope.$on('$routeChangeError', function() {
        $rootScope.isLoading = false;
        MessageService.showError('Page loading failed, please refresh and try again');
    });
    
    // Global utility functions
    $rootScope.formatDate = function(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    $rootScope.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '';
        return '$' + parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    
    $rootScope.calculateProgress = function(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };
}]);