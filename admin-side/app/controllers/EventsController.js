angular.module('CharityEventsAdminApp')
.controller('EventsController', ['$scope', '$location', 'AdminEventService', 'ModalService', 
function($scope, $location, AdminEventService, ModalService) {
    var vm = this;

    // Initialize data
    vm.events = [];
    vm.filteredEvents = [];
    vm.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    };
    vm.searchQuery = '';
    vm.isLoading = false;

    /**
     * Initialize controller
     */
    vm.init = function() {
        vm.loadEvents();
    };

    /**
     * Load events list
     */
    vm.loadEvents = function() {
        vm.isLoading = true;

        AdminEventService.getAllEvents()
            .then(function(response) {
                console.log('EventsController.loadEvents response:', response);
                var events = response.data || response;
                vm.events = events;
                vm.filteredEvents = events;
                vm.pagination.totalItems = events.length;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('Failed to load events list:', error);
                vm.isLoading = false;
            });
    };

    /**
     * Search events
     */
    vm.searchEvents = function() {
        if (!vm.searchQuery.trim()) {
            vm.filteredEvents = vm.events;
        } else {
            var query = vm.searchQuery.toLowerCase();
            vm.filteredEvents = vm.events.filter(function(event) {
                return event.title.toLowerCase().includes(query) ||
                       event.description.toLowerCase().includes(query) ||
                       event.location.toLowerCase().includes(query);
            });
        }
        vm.pagination.totalItems = vm.filteredEvents.length;
        vm.pagination.currentPage = 1;
    };

    /**
     * Delete event
     */
    vm.deleteEvent = function(event) {
        ModalService.openDanger(
            'Confirm Deletion',
            `Are you sure you want to delete event "${event.title}"? This action cannot be undone.`,
            function() {
                AdminEventService.deleteEvent(event.id)
                    .then(function() {
                        vm.loadEvents(); // Reload list
                    })
                    .catch(function(error) {
                        if (error.code === 'HAS_REGISTRATIONS') {
                            alert(`Cannot delete event: This event has ${error.registrationsCount} registration records`);
                        } else {
                            alert('Deletion failed: ' + (error.message || 'Unknown error'));
                        }
                    });
            }
        );
    };

    /**
     * Edit event
     */
    vm.editEvent = function(event) {
        $location.path('/events/edit/' + event.id);
    };

    /**
     * View event details
     */
    vm.viewEvent = function(event) {
        $location.path('/events/' + event.id);
    };

    /**
     * Create new event
     */
    vm.createEvent = function() {
        $location.path('/events/new');
    };

    /**
     * Get event status label
     */
    vm.getEventStatus = function(event) {
        if (!event.is_active || event.is_suspended) {
            return { text: 'Ended', class: 'status-inactive' };
        }

        var eventDate = new Date(event.event_date);
        var now = new Date();

        if (eventDate < now) {
            return { text: 'Ended', class: 'status-inactive' };
        }

        // Check ticket availability
        var availableTickets = event.max_attendees - (event.total_tickets_sold || 0);
        if (availableTickets <= 0) {
            return { text: 'Sold Out', class: 'status-sold-out' };
        }

        return { text: 'Active', class: 'status-active' };
    };

    /**
     * Format date
     */
    vm.formatDate = function(value) {
        if (!value) return '';
        try { 
            return new Date(value).toLocaleDateString('en-US'); 
        } catch(e) { 
            return value; 
        }
    };

    // Initialize controller
    vm.init();
}]);