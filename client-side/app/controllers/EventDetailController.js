angular.module('CharityEventsApp')
.controller('EventDetailController', ['$scope', '$routeParams', 'EventService', 'WeatherService', 'MessageService', function($scope, $routeParams, EventService, WeatherService, MessageService) {
    var vm = this;
    
    // Initialize data
    vm.event = null;
    vm.registrations = [];
    vm.weather = null;
    vm.isLoading = true;
    vm.activeTab = 'details';
    
    /**
     * Initialize controller
     */
    vm.init = function() {
        const eventId = $routeParams.id;
        
        if (!eventId) {
            MessageService.showError('Invalid event ID');
            return;
        }
        
        vm.loadEventDetails(eventId);
    };
    
    /**
     * Load event details
     */
    vm.loadEventDetails = function(eventId) {
        vm.isLoading = true;
        
        EventService.getEventById(eventId)
            .then(function(response) {
                vm.event = response.event;
                vm.registrations = response.registrations;
                vm.isLoading = false;
                
                // Load weather information
                if (vm.event.latitude && vm.event.longitude) {
                    vm.loadWeatherInfo(vm.event.latitude, vm.event.longitude);
                }
            })
            .catch(function(error) {
                console.error('Failed to load event details:', error);
                MessageService.showError('Failed to load event details: ' + (error.message || 'Unknown error'));
                vm.isLoading = false;
            });
    };
    
    /**
     * Load weather information
     */
    vm.loadWeatherInfo = function(latitude, longitude) {
        WeatherService.getWeather(latitude, longitude)
            .then(function(weatherData) {
                vm.weather = weatherData;
            })
            .catch(function(error) {
                console.warn('Failed to load weather information:', error);
                // Don't show error message since weather is optional
            });
    };
    
    /**
     * Switch tabs
     */
    vm.setActiveTab = function(tabName) {
        vm.activeTab = tabName;
    };
    
    /**
     * Get available tickets
     */
    vm.getAvailableTickets = function() {
        if (!vm.event) return 0;
        
        const totalTicketsSold = vm.registrations.reduce((sum, reg) => sum + reg.ticket_count, 0);
        return vm.event.max_attendees - totalTicketsSold;
    };
    
    /**
     * Check if registration is possible
     */
    vm.canRegister = function() {
        if (!vm.event) return false;
        
        if (!vm.event.is_active || vm.event.is_suspended) {
            return false;
        }
        
        const availableTickets = vm.getAvailableTickets();
        return availableTickets > 0;
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
        
        const totalTickets = vm.registrations.reduce((sum, reg) => sum + reg.ticket_count, 0);
        const averageTickets = totalTickets / vm.registrations.length;
        
        return {
            totalRegistrations: vm.registrations.length,
            totalTickets: totalTickets,
            averageTickets: Math.round(averageTickets * 10) / 10
        };
    };
    
    // Initialize controller
    vm.init();
}]);