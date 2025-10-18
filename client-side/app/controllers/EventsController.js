angular.module('CharityEventsApp')
.controller('EventsController', ['$scope', 'EventService', 'MessageService', function($scope, EventService, MessageService) {
    var vm = this;
    
    // Initialize data
    vm.events = [];
    vm.categories = [];
    vm.organizations = [];
    vm.filters = {
        category: '',
        organization: '',
        location: '',
        status: 'active'
    };
    vm.pagination = {
        currentPage: 1,
        itemsPerPage: 9,
        totalItems: 0
    };
    vm.isLoading = false;
    vm.searchQuery = '';
    
    /**
     * Initialize controller
     */
    vm.init = function() {
        vm.loadEvents();
        vm.loadCategories();
        vm.loadOrganizations();
    };
    
    /**
     * Load events list
     */
    vm.loadEvents = function() {
        vm.isLoading = true;
        
        const params = {
            page: vm.pagination.currentPage,
            limit: vm.pagination.itemsPerPage
        };
        
        // Add filter conditions
        if (vm.filters.category) {
            params.category = vm.filters.category;
        }
        if (vm.filters.organization) {
            params.organization = vm.filters.organization;
        }
        if (vm.filters.location) {
            params.location = vm.filters.location;
        }
        if (vm.filters.status) {
            params.status = vm.filters.status;
        }
        
        EventService.getAllEvents(params)
            .then(function(response) {
                vm.events = response.data || response;
                vm.pagination.totalItems = response.pagination ? response.pagination.total : vm.events.length;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('Failed to load events list:', error);
                MessageService.showError('Failed to load events list');
                vm.isLoading = false;
            });
    };
    
    /**
     * Load categories
     */
    vm.loadCategories = function() {
        EventService.getCategories()
            .then(function(categories) {
                vm.categories = categories;
            })
            .catch(function(error) {
                console.warn('Failed to load categories:', error);
            });
    };
    
    /**
     * Load organizations
     */
    vm.loadOrganizations = function() {
        EventService.getOrganizations()
            .then(function(organizations) {
                vm.organizations = organizations;
            })
            .catch(function(error) {
                console.warn('Failed to load organizations:', error);
            });
    };
    
    /**
     * Apply filters
     */
    vm.applyFilters = function() {
        vm.pagination.currentPage = 1;
        vm.loadEvents();
    };
    
    /**
     * Reset filters
     */
    vm.resetFilters = function() {
        vm.filters = {
            category: '',
            organization: '',
            location: '',
            status: 'active'
        };
        vm.pagination.currentPage = 1;
        vm.loadEvents();
    };
    
    /**
     * Search events
     */
    vm.searchEvents = function() {
        if (!vm.searchQuery.trim()) {
            vm.loadEvents();
            return;
        }
        
        vm.isLoading = true;
        
        EventService.searchEvents({
            q: vm.searchQuery,
            page: vm.pagination.currentPage,
            limit: vm.pagination.itemsPerPage
        })
        .then(function(response) {
            vm.events = response.data || response;
            vm.pagination.totalItems = response.pagination ? response.pagination.total : vm.events.length;
            vm.isLoading = false;
        })
        .catch(function(error) {
            console.error('Failed to search events:', error);
            MessageService.showError('Failed to search events');
            vm.isLoading = false;
        });
    };
    
    /**
     * Change page number
     */
    vm.pageChanged = function() {
        if (vm.searchQuery) {
            vm.searchEvents();
        } else {
            vm.loadEvents();
        }
    };
    
    /**
     * Get available tickets
     */
    vm.getAvailableTickets = function(event) {
        if (!event.max_attendees || !event.total_tickets_sold) {
            return event.max_attendees || 0;
        }
        return event.max_attendees - event.total_tickets_sold;
    };
    
    /**
     * Check if event can be registered for
     */
    vm.canRegister = function(event) {
        if (!event.is_active || event.is_suspended) {
            return false;
        }
        
        const availableTickets = vm.getAvailableTickets(event);
        return availableTickets > 0;
    };
    
    // Initialize controller
    vm.init();
}]);