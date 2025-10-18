charityEventsApp.controller('SearchController', ['$scope', '$location', 'EventService', 'CategoryService',
    function($scope, $location, EventService, CategoryService) {
    
    // Initialize data
    $scope.events = [];
    $scope.categories = [];
    $scope.loading = false;
    $scope.error = '';
    $scope.searchPerformed = false;
    
    // Search parameters
    $scope.searchParams = {
        q: '',
        category: '',
        location: '',
        date_from: '',
        date_to: ''
    };
    
    // Check event status
    $scope.isUpcoming = function(event) {
        if (!event || !event.event_date) return false;
        var eventDate = new Date(event.event_date);
        var now = new Date();
        return eventDate > now;
    };
    
    // Calculate fundraising progress
    $scope.calculateProgress = function(event) {
        if (!event) return 0;
        return (event.current_amount / event.goal_amount) * 100;
    };
    
    // Perform search
    $scope.performSearch = function() {
        if (!$scope.searchParams.q && !$scope.searchParams.category && 
            !$scope.searchParams.location && !$scope.searchParams.date_from && 
            !$scope.searchParams.date_to) {
            $scope.error = 'Please enter at least one search condition';
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
                console.error('Search failed:', error);
                $scope.error = 'Search failed, please try again later';
                $scope.loading = false;
            });
    };
    
    // Clear search
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
    
    // Initialize
    loadCategories();
}]);