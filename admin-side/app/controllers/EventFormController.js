angular.module('CharityEventsAdminApp')
.controller('EventFormController', ['$scope', '$routeParams', '$location', 'AdminEventService', 'AdminApiService', 
function($scope, $routeParams, $location, AdminEventService, AdminApiService) {
    var vm = this;

    // Initialize data
    vm.event = {
        title: '',
        description: '',
        full_description: '',
        category_id: 1,
        organization_id: 1,
        event_date: '',
        location: '',
        venue_details: '',
        ticket_price: 0,
        goal_amount: 0,
        max_attendees: 100,
        latitude: '',
        longitude: '',
        is_active: true,
        is_suspended: false
    };
    vm.isEdit = false;
    vm.isLoading = false;
    vm.isSubmitting = false;
    vm.validationErrors = [];
    vm.categories = [];

    /**
     * Initialize controller
     */
    vm.init = function() {
        var eventId = $routeParams.id;
        
        // Load categories list
        vm.loadCategories();
        
        if (eventId) {
            vm.isEdit = true;
            vm.loadEvent(eventId);
        }
    };

    /**
     * Load categories list
     */
    vm.loadCategories = function() {
        AdminApiService.get('/categories')
            .then(function(response) {
                console.log('EventFormController.loadCategories response:', response);
                vm.categories = response.data || response;
            })
            .catch(function(error) {
                console.error('Failed to load categories:', error);
                // Use default categories as fallback
                vm.categories = [
                    { id: 1, name: 'Charity Gala' },
                    { id: 2, name: 'Fun Run' },
                    { id: 3, name: 'Art Exhibition' },
                    { id: 4, name: 'Online Fundraising' },
                    { id: 5, name: 'Community Service' },
                    { id: 6, name: 'Educational Lecture' }
                ];
            });
    };

    /**
     * Load event data (edit mode)
     */
    vm.loadEvent = function(eventId) {
        vm.isLoading = true;

        AdminEventService.getEventById(eventId)
            .then(function(response) {
                console.log('EventFormController.loadEvent response:', response);
                
                // Handle different response formats
                if (response.event) {
                    vm.event = response.event;
                } else if (response.data && response.data.event) {
                    vm.event = response.data.event;
                } else {
                    vm.event = response;
                }
                
                console.log('EventFormController.loadEvent processed event data:', vm.event);
                
                // Format date for HTML datetime-local input
                if (vm.event.event_date) {
                    var eventDate = new Date(vm.event.event_date);
                    vm.event.event_date = eventDate.toISOString().slice(0, 16);
                }
                
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('Failed to load event data:', error);
                alert('Failed to load event data');
                $location.path('/events');
            });
    };

    /**
     * Submit form
     */
    vm.submitForm = function() {
        // Validate data
        vm.validationErrors = [];
        
        if (!vm.event.title || vm.event.title.trim() === '') {
            vm.validationErrors.push('Event title cannot be empty');
        }
        
        if (!vm.event.description || vm.event.description.trim() === '') {
            vm.validationErrors.push('Event description cannot be empty');
        }
        
        if (!vm.event.event_date) {
            vm.validationErrors.push('Event date cannot be empty');
        }
        
        if (!vm.event.location || vm.event.location.trim() === '') {
            vm.validationErrors.push('Event location cannot be empty');
        }
        
        if (!vm.event.max_attendees || vm.event.max_attendees < 1) {
            vm.validationErrors.push('Maximum attendees must be greater than 0');
        }
        
        if (vm.validationErrors.length > 0) {
            return;
        }

        vm.isSubmitting = true;
        vm.validationErrors = [];

        var submitPromise;
        if (vm.isEdit) {
            console.log('Updating event - Event ID:', vm.event.id);
            console.log('Updating event - Complete data:', vm.event);
            
            if (!vm.event.id) {
                alert('Error: Event ID does not exist, cannot update event');
                return;
            }
            
            submitPromise = AdminEventService.updateEvent(vm.event.id, vm.event);
        } else {
            console.log('Creating event:', vm.event);
            submitPromise = AdminEventService.createEvent(vm.event);
        }

        submitPromise
            .then(function(response) {
                console.log('Form submission successful:', response);
                alert(vm.isEdit ? 'Event updated successfully' : 'Event created successfully');
                $location.path('/events');
            })
            .catch(function(error) {
                console.error('Submission failed:', error);
                alert('Submission failed: ' + (error.message || 'Unknown error'));
            })
            .finally(function() {
                vm.isSubmitting = false;
            });
    };

    /**
     * Cancel editing
     */
    vm.cancel = function() {
        $location.path('/events');
    };

    /**
     * Set current coordinates (example)
     */
    vm.setCurrentLocation = function() {
        // Here you can integrate map API to get precise coordinates
        // Currently using example coordinates
        vm.event.latitude = -33.87;
        vm.event.longitude = 151.21;
    };

    // Initialize controller
    vm.init();
}]);