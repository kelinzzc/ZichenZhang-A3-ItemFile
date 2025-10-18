angular.module('CharityEventsAdminApp')
.factory('AdminRegistrationService', ['AdminApiService', '$q', function(AdminApiService, $q) {
    return {
        /**
         * Get all registration records
         */
        getAllRegistrations: function(params = {}) {
            console.log('AdminRegistrationService.getAllRegistrations called, parameters:', params);
            return AdminApiService.get('/registrations', params)
                .then(response => {
                    console.log('AdminRegistrationService response:', response);
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to get registration records:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get event registration records
         */
        getRegistrationsByEventId: function(eventId) {
            return AdminApiService.get(`/registrations/event/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get event registration records:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Delete registration record
         */
        deleteRegistration: function(registrationId) {
            return AdminApiService.delete(`/registrations/${registrationId}`)
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
            return AdminApiService.get('/registrations/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get registration statistics:', error);
                    return $q.reject(error);
                });
        }
    };
}]);