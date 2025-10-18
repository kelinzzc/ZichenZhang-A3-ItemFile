charityEventsApp.controller('RegisterController', ['$scope', '$routeParams', '$location', 'EventService', 'RegistrationService',
    function($scope, $routeParams, $location, EventService, RegistrationService) {
    
    // Initialize data
    $scope.event = null;
    $scope.registration = {
        event_id: parseInt($routeParams.eventId),
        full_name: '',
        email: '',
        phone: '',
        ticket_count: 1,
        special_requirements: ''
    };
    $scope.loading = true;
    $scope.submitting = false;
    $scope.error = '';
    $scope.success = false;
    
    // Load event information
    function loadEvent() {
        EventService.getById($routeParams.eventId)
            .then(function(response) {
                var data = response.data.data || response.data;
                $scope.event = data.event || data;
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('Failed to load event information:', error);
                $scope.error = 'Failed to load event information, please try again later';
                $scope.loading = false;
            });
    }
    
    // Submit registration
    $scope.submitRegistration = function() {
        if ($scope.registrationForm.$invalid) {
            $scope.error = 'Please fill in all required fields';
            return;
        }
        
        $scope.submitting = true;
        $scope.error = '';
        
        RegistrationService.create($scope.registration)
            .then(function(response) {
                $scope.success = true;
                $scope.submitting = false;
                
                // Redirect to event details page after 3 seconds
                setTimeout(function() {
                    $location.path('/events/' + $routeParams.eventId);
                }, 3000);
            })
            .catch(function(error) {
                console.error('Registration failed:', error);
                
                if (error.data && error.data.code === 'DUPLICATE_REGISTRATION') {
                    $scope.error = 'You have already registered for this event and cannot register again';
                } else if (error.data && error.data.code === 'INSUFFICIENT_TICKETS') {
                    $scope.error = 'Insufficient tickets available, please select fewer tickets';
                } else {
                    $scope.error = error.data && error.data.message ? error.data.message : 'Registration failed, please try again later';
                }
                
                $scope.submitting = false;
            });
    };
    
    // Calculate total amount
    $scope.calculateTotal = function() {
        if (!$scope.event) return 0;
        return $scope.registration.ticket_count * $scope.event.ticket_price;
    };
    
    // Check if there are available tickets
    $scope.hasAvailableTickets = function() {
        if (!$scope.event) return false;
        return $scope.event.available_tickets > 0;
    };
    
    // Initialize
    loadEvent();
}]);