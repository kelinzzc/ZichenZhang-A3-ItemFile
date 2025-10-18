angular.module('CharityEventsApp')
.factory('RegistrationService', ['ApiService', '$q', function(ApiService, $q) {
    
    return {
        /**
         * Create registration record (A3 core functionality)
         */
        createRegistration: function(registrationData) {
            return ApiService.post('/registrations', registrationData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to create registration record:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get all registration records for an event (sorted by time descending)
         */
        getRegistrationsByEventId: function(eventId) {
            if (!eventId) {
                return $q.reject({ message: 'Event ID cannot be empty' });
            }

            return ApiService.get(`/registrations/event/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get registration records:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get all registration records (admin panel)
         */
        getAllRegistrations: function(params = {}) {
            return ApiService.get('/registrations', params)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get all registration records:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Delete registration record (admin panel)
         */
        deleteRegistration: function(registrationId) {
            return ApiService.delete(`/registrations/${registrationId}`)
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('Failed to delete registration record:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get registration statistics
         */
        getRegistrationStats: function() {
            return ApiService.get('/registrations/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get registration statistics:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Validate registration data
         */
        validateRegistration: function(registrationData) {
            const errors = [];

            if (!registrationData.event_id) {
                errors.push('Please select an event');
            }

            if (!registrationData.full_name || registrationData.full_name.trim().length === 0) {
                errors.push('Please enter your name');
            }

            if (!registrationData.email || registrationData.email.trim().length === 0) {
                errors.push('Please enter your email address');
            } else if (!this.isValidEmail(registrationData.email)) {
                errors.push('Please enter a valid email address');
            }

            if (!registrationData.ticket_count || registrationData.ticket_count <= 0) {
                errors.push('Number of tickets must be greater than 0');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * Email validation
         */
        isValidEmail: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    };
}]);