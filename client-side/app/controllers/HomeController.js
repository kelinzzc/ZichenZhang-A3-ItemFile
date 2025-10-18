angular.module('CharityEventsApp')
.controller('HomeController', ['$scope', 'EventService', 'MessageService', function($scope, EventService, MessageService) {
    var vm = this;
    
    // Initialize data
    vm.featuredEvents = [];
    vm.categories = [];
    vm.stats = {};
    vm.isLoading = true;
    
    /**
     * Initialize controller
     */
    vm.init = function() {
        vm.loadFeaturedEvents();
        vm.loadEventStats();
    };
    
    /**
     * Load featured events
     */
    vm.loadFeaturedEvents = function() {
        vm.isLoading = true;
        
        EventService.getAllEvents({ limit: 6 })
            .then(function(events) {
                vm.featuredEvents = events;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('Failed to load featured events:', error);
                MessageService.showError('Failed to load featured events');
                vm.isLoading = false;
            });
    };
    

    vm.loadEventStats = function() {
        EventService.getEventStats()
            .then(function(stats) {
                vm.stats = stats;
            })
            .catch(function(error) {
                console.warn('Failed to load event statistics:', error);
                // Use default statistics
                vm.stats = {
                    total_events: 45,
                    active_events: 12,
                    total_raised: 125000,
                    total_goal: 500000
                };
            });
    };
    

    vm.formatNumber = function(number) {
        if (!number) return '0';
        return number.toLocaleString('en-US');
    };
    

    vm.calculateProgress = function(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };
    
    // Initialize controller
    vm.init();
}]);