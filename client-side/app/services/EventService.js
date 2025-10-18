angular.module('CharityEventsApp')
.factory('EventService', ['ApiService', '$q', function(ApiService, $q) {
    
    return {
        /**
         * Get all events
         */
        getAllEvents: function(params = {}) {
            return ApiService.get('/events', params)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get events list:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get single event details (including registration records)
         */
        getEventById: function(eventId) {
            if (!eventId) {
                return $q.reject({ message: 'Event ID cannot be empty' });
            }

            return ApiService.get(`/events/${eventId}`)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get event details:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Search events
         */
        searchEvents: function(searchParams) {
            return ApiService.get('/events/search', searchParams)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to search events:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get event statistics
         */
        getEventStats: function() {
            return ApiService.get('/events/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get event statistics:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get all categories
         */
        getCategories: function() {
            // First try to get from API
            return ApiService.get('/categories')
                .then(response => response.data)
                .catch(error => {
                    console.warn('Failed to get categories, using default data:', error);
                    // Return default category data as fallback
                    return [
                        { id: 1, name: 'Charity Gala', description: 'Formal fundraising dinner events' },
                        { id: 2, name: 'Fun Run', description: 'Sports-based charity events' },
                        { id: 3, name: 'Art Exhibition', description: 'Art fundraising events' },
                        { id: 4, name: 'Online Fundraising', description: 'Virtual fundraising events' },
                        { id: 5, name: 'Community Service', description: 'Community volunteer service and public welfare activities' },
                        { id: 6, name: 'Educational Lectures', description: 'Knowledge sharing and educational events' }
                    ];
                });
        },

        /**
         * Get all organizations
         */
        getOrganizations: function() {
            return ApiService.get('/organizations')
                .then(response => response.data)
                .catch(error => {
                    console.warn('Failed to get organizations, using default data:', error);
                    // Return default organization data as fallback
                    return [
                        { id: 1, name: 'Hope Light Charity Foundation', description: 'Dedicated to helping underprivileged children and families improve living conditions' },
                        { id: 2, name: 'Care Aid Organization', description: 'Non-profit organization focused on medical assistance and health promotion' }
                    ];
                });
        },

        /**
         * Create new event (admin panel)
         */
        createEvent: function(eventData) {
            return ApiService.post('/events', eventData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to create event:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Update event (admin panel)
         */
        updateEvent: function(eventId, eventData) {
            return ApiService.put(`/events/${eventId}`, eventData)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to update event:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Delete event (admin panel)
         */
        deleteEvent: function(eventId) {
            return ApiService.delete(`/events/${eventId}`)
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('Failed to delete event:', error);
                    return $q.reject(error);
                });
        }
    };
}]);