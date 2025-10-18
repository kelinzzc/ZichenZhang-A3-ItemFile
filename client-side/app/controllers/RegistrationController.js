angular.module('CharityEventsApp')
.controller('RegistrationController', ['$scope', '$routeParams', '$location', 'EventService', 'RegistrationService', 'MessageService', function($scope, $routeParams, $location, EventService, RegistrationService, MessageService) {
    var vm = this;
    
    // Initialize data
    vm.event = null;
    vm.registrationData = {
        event_id: null,
        full_name: '',
        email: '',
        phone: '',
        ticket_count: 1,
        special_requirements: ''
    };
    vm.isLoading = false;
    vm.isSubmitting = false;
    vm.validationErrors = [];
    
    /**
     * Initialize controller
     */
    vm.init = function() {
        const eventId = $routeParams.eventId;
        
        if (!eventId) {
            MessageService.showError('Invalid event ID');
            $location.path('/events');
            return;
        }
        
        vm.registrationData.event_id = parseInt(eventId);
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
                vm.isLoading = false;
                
                // Check if event can be registered for
                if (!vm.canRegister()) {
                    MessageService.showWarning('This event cannot be registered for at the moment');
                    $location.path('/events/' + eventId);
                }
            })
            .catch(function(error) {
                console.error('Failed to load event details:', error);
                MessageService.showError('Failed to load event details');
                $location.path('/events');
            });
    };
    
    /**
     * Check if registration is possible
     */
    vm.canRegister = function() {
        if (!vm.event) return false;
        
        // Check event status
        if (!vm.event.is_active || vm.event.is_suspended) {
            return false;
        }
        
        // Check event date (simple check)
        const eventDate = new Date(vm.event.event_date);
        const now = new Date();
        if (eventDate < now) {
            return false;
        }
        
        return true;
    };
    
    /**
     * Submit registration form
     */
    vm.submitRegistration = function() {

        const validation = RegistrationService.validateRegistration(vm.registrationData);
        
        if (!validation.isValid) {
            vm.validationErrors = validation.errors;
            MessageService.showError('Please correct errors in the form');
            return;
        }
        
        vm.isSubmitting = true;
        vm.validationErrors = [];
        
        RegistrationService.createRegistration(vm.registrationData)
            .then(function(response) {
                MessageService.showSuccess('Registration successful! Thank you for participating.');
                
                // Reset form
                vm.registrationData = {
                    event_id: vm.registrationData.event_id,
                    full_name: '',
                    email: '',
                    phone: '',
                    ticket_count: 1,
                    special_requirements: ''
                };
                
                // Redirect to event details page
                $location.path('/events/' + vm.registrationData.event_id);
            })
            .catch(function(error) {
                console.error('Registration failed:', error);
                
                if (error.code === 'DUPLICATE_REGISTRATION') {
                    MessageService.showError('You have already registered for this event');
                } else if (error.code === 'INSUFFICIENT_TICKETS') {
                    MessageService.showError('Insufficient tickets: ' + error.message);
                } else if (error.code === 'EVENT_UNAVAILABLE') {
                    MessageService.showError('Event unavailable: ' + error.message);
                    $location.path('/events/' + vm.registrationData.event_id);
                } else {
                    MessageService.showError('Registration failed: ' + (error.message || 'Unknown error'));
                }
            })
            .finally(function() {
                vm.isSubmitting = false;
            });
    };

    vm.increaseTickets = function() {
        if (vm.registrationData.ticket_count < 10) {
            vm.registrationData.ticket_count++;
        }
    };
    
    /**
     * Decrease ticket count
     */
    vm.decreaseTickets = function() {
        if (vm.registrationData.ticket_count > 1) {
            vm.registrationData.ticket_count--;
        }
    };
    

    vm.getAvailableTickets = function() {
        if (!vm.event) return 0;
        

        return vm.event.max_attendees - (vm.event.total_tickets_sold || 0);
    };
    
    /**
     * Calculate total amount
     */
    vm.calculateTotalAmount = function() {
        if (!vm.event) return 0;
        return vm.event.ticket_price * vm.registrationData.ticket_count;
    };
    
    // Initialize
    vm.init();
}]);