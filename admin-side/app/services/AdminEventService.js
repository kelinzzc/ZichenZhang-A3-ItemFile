angular.module('CharityEventsAdminApp')
.factory('AdminEventService', ['AdminApiService', '$q', function(AdminApiService, $q) {
    return {
        // Get all events
        getAllEvents: function(params = {}) {
            return AdminApiService.get('/events', params)
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get event list:', error);
                    return $q.reject(error);
                });
        },

        getEventById: function(eventId) {
            if (!eventId) {
                return $q.reject({ message: 'Event ID cannot be empty' });
            }

            return AdminApiService.get(`/events/${eventId}`)
                .then(response => {
                    console.log('AdminEventService.getEventById raw response:', response);
                    return response.data; // Return data part, containing event and registrations
                })
                .catch(error => {
                    console.error('Failed to get event details:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Create new event
         */
        createEvent: function(eventData) {
            console.log('AdminEventService.createEvent called, data:', eventData);
            return AdminApiService.post('/events', eventData)
                .then(response => {
                    console.log('AdminEventService.createEvent response:', response);
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to create event:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Update event
         */
        updateEvent: function(eventId, eventData) {
            console.log('AdminEventService.updateEvent called, ID:', eventId, 'data:', eventData);
            return AdminApiService.put(`/events/${eventId}`, eventData)
                .then(response => {
                    console.log('AdminEventService.updateEvent response:', response);
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to update event:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Delete event
         */
        deleteEvent: function(eventId) {
            console.log('AdminEventService.deleteEvent called, ID:', eventId);
            return AdminApiService.delete(`/events/${eventId}`)
                .then(response => {
                    console.log('AdminEventService.deleteEvent response:', response);
                    return response.data;
                })
                .catch(error => {
                    console.error('Failed to delete event:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Get event statistics
         */
        getEventStats: function() {
            return AdminApiService.get('/events/stats')
                .then(response => response.data)
                .catch(error => {
                    console.error('Failed to get event statistics:', error);
                    return $q.reject(error);
                });
        },

        /**
         * Validate event data
         */
        validateEvent: function(eventData) {
            const errors = [];

            if (!eventData.title || eventData.title.trim().length === 0) {
                errors.push('Event title is required');
            }

            if (!eventData.description || eventData.description.trim().length === 0) {
                errors.push('Event description is required');
            }

            if (!eventData.event_date) {
                errors.push('Event date is required');
            } else if (new Date(eventData.event_date) <= new Date()) {
                errors.push('Event date must be in the future');
            }

            if (!eventData.location || eventData.location.trim().length === 0) {
                errors.push('Event location is required');
            }

            if (!eventData.max_attendees || eventData.max_attendees <= 0) {
                errors.push('Maximum attendees must be greater than 0');
            }

            if (!eventData.goal_amount || eventData.goal_amount < 0) {
                errors.push('Fundraising goal cannot be negative');
            }

            if (!eventData.ticket_price || eventData.ticket_price < 0) {
                errors.push('Ticket price cannot be negative');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
    };
}]);