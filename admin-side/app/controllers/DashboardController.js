angular.module('CharityEventsAdminApp')
.controller('DashboardController', ['$scope', 'AdminEventService', 'AdminRegistrationService', 
function($scope, AdminEventService, AdminRegistrationService) {
    var vm = this;

    // Initialize data
    vm.stats = {};
    vm.recentEvents = [];
    vm.recentRegistrations = [];
    vm.isLoading = true;

    /**
     * Initialize controller
     */
    vm.init = function() {
        vm.loadDashboardData();
    };

    /**
     * Load dashboard data
     */
    vm.loadDashboardData = function() {
        vm.isLoading = true;

        // Load all data in parallel
        Promise.all([
            vm.loadEventStats(),
            vm.loadRegistrationStats(),
            vm.loadRecentEvents(),
            vm.loadRecentRegistrations()
        ]).finally(function() {
            vm.isLoading = false;
            $scope.$apply(); // Manually trigger AngularJS update
        });
    };

    /**
     * Load event statistics
     */
    vm.loadEventStats = function() {
        return AdminEventService.getEventStats()
            .then(function(stats) {
                vm.stats.events = stats;
            })
            .catch(function(error) {
                console.error('Failed to load event statistics:', error);
            });
    };

    /**
     * Load registration statistics
     */
    vm.loadRegistrationStats = function() {
        return AdminRegistrationService.getRegistrationStats()
            .then(function(stats) {
                vm.stats.registrations = stats;
            })
            .catch(function(error) {
                console.error('Failed to load registration statistics:', error);
            });
    };

    /**
     * Load recent events
     */
    vm.loadRecentEvents = function() {
        return AdminEventService.getAllEvents({ limit: 5 })
            .then(function(events) {
                vm.recentEvents = events;
            })
            .catch(function(error) {
                console.error('Failed to load recent events:', error);
            });
    };

    /**
     * Load recent registration records
     */
    vm.loadRecentRegistrations = function() {
        return AdminRegistrationService.getAllRegistrations({ limit: 10 })
            .then(function(registrations) {
                vm.recentRegistrations = registrations;
            })
            .catch(function(error) {
                console.error('Failed to load recent registration records:', error);
            });
    };

    /**
     * Format numbers
     */
    vm.formatNumber = function(number) {
        if (!number) return '0';
        return number.toLocaleString('en-US');
    };

    /**
     * Format currency
     */
    vm.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '';
        return '$' + parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    /**
     * Format date
     */
    vm.formatDate = function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Initialize controller
    vm.init();
}]);