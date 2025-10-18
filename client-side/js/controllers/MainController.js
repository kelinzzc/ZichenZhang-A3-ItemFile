charityEventsApp.controller('MainController', ['$scope', '$rootScope', '$location', 'EventService', 'CategoryService', 
    function($scope, $rootScope, $location, EventService, CategoryService) {
    
    // Initialize data
    $scope.featuredEvents = [];
    $scope.categories = [];
    $scope.stats = {};
    $scope.loadingFeatured = true;
    $scope.featuredError = '';
    
    // Load featured events
    function loadFeaturedEvents() {
        $scope.loadingFeatured = true;
        EventService.getFeaturedEvents()
            .then(function(response) {
                $scope.featuredEvents = response.data.data || response.data;
                $scope.loadingFeatured = false;
            })
            .catch(function(error) {
                console.error('Failed to load featured events:', error);
                $scope.featuredError = 'Failed to load featured events, please try again later';
                $scope.loadingFeatured = false;
            });
    }
    
    // Load categories
    function loadCategories() {
        CategoryService.getAll()
            .then(function(response) {
                $scope.categories = response.data;
            })
            .catch(function(error) {
                console.error('Failed to load categories:', error);
            });
    }
    
    // Load statistics
    function loadStats() {
        EventService.getStats()
            .then(function(response) {
                $scope.stats = response.data;
            })
            .catch(function(error) {
                console.error('Failed to load statistics:', error);
            });
    }
    
    // Toggle mobile menu
    $scope.toggleMenu = function() {
        $rootScope.menuOpen = !$rootScope.menuOpen;
    };
    
    // Filter by category
    $scope.filterByCategory = function(categoryId) {
        $location.path('/events').search({category: categoryId});
    };
    
    // Initialize
    loadFeaturedEvents();
    loadCategories();
    loadStats();
}]);