angular.module('CharityEventsAdminApp')
.controller('EventDetailController', ['$scope', '$routeParams', 'AdminEventService', 'AdminRegistrationService', 
function($scope, $routeParams, AdminEventService, AdminRegistrationService) {
    var vm = this;

    // Initialize data
    vm.event = null;
    vm.registrations = [];
    vm.isLoading = true;
    vm.activeTab = 'details';
    vm.error = '';

    /**
     * Initialize controller
     */
    vm.init = function() {
        var eventId = $routeParams.id;
        if (!eventId) {
            alert('Invalid event ID');
            return;
        }

        vm.loadEventDetails(eventId);
    };

    /**
     * Go back to previous page
     */
    vm.goBack = function() {
        window.history.back();
    };

    /**
     * Edit event
     */
    vm.editEvent = function() {
        if (vm.event) {
            window.location.hash = '#/events/edit/' + vm.event.id;
        }
    };

    /**
     * Load event details
     */
    vm.loadEventDetails = function(eventId) {
        console.log('Starting to load event details, ID:', eventId);
        vm.isLoading = true;
        vm.error = '';

        AdminEventService.getEventById(eventId)
            .then(function(response) {
                console.log('Event details API response:', response);
                console.log('Response data structure:', {
                    hasData: !!response.data,
                    hasEvent: !!response.data.event,
                    hasRegistrations: !!response.data.registrations,
                    eventKeys: response.data.event ? Object.keys(response.data.event) : 'N/A',
                    registrationsCount: response.data.registrations ? response.data.registrations.length : 0
                });
                
                vm.event = response.data.event;
                vm.registrations = response.data.registrations;
                vm.isLoading = false;
                
                console.log('Data setup completed:', {
                    event: vm.event,
                    registrations: vm.registrations,
                    isLoading: vm.isLoading
                });
            })
            .catch(function(error) {
                console.error('Failed to load event details:', error);
                vm.error = error.message || 'Unable to load event details, please try again later';
                vm.isLoading = false;
            });
    };

    /**
     * Switch tabs
     */
    vm.setActiveTab = function(tabName) {
        vm.activeTab = tabName;
    };

    /**
     * Get registration statistics
     */
    vm.getRegistrationStats = function() {
        if (!vm.registrations || vm.registrations.length === 0) {
            return {
                totalRegistrations: 0,
                totalTickets: 0,
                averageTickets: 0
            };
        }

        var totalTickets = vm.registrations.reduce(function(sum, reg) {
            return sum + reg.ticket_count;
        }, 0);

        var averageTickets = totalTickets / vm.registrations.length;

        return {
            totalRegistrations: vm.registrations.length,
            totalTickets: totalTickets,
            averageTickets: Math.round(averageTickets * 10) / 10
        };
    };

    /**
     * Format date
     */
    vm.formatDate = function(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
     * Calculate fundraising progress
     */
    vm.calculateProgress = function(current, goal) {
        if (!goal || goal === 0) return 0;
        return Math.min(Math.round((current / goal) * 100), 100);
    };

    // Initialize controller
    vm.init();
}]);