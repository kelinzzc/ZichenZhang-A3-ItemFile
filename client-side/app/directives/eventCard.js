angular.module('CharityEventsApp')
.directive('eventCard', function() {
    return {
        restrict: 'E',
        scope: {
            event: '=',
            showButton: '@'
        },
        template: `
            <div class="event-card card">
                <div class="event-image">
                    <img ng-src="{{getEventImage()}}" alt="{{event.title}}">
                    <div class="event-category">{{event.category_name}}</div>
                    <div class="event-status" ng-class="getStatusClass()">
                        {{getStatusText()}}
                    </div>
                </div>
                
                <div class="card-body">
                    <h3 class="event-title">{{event.title}}</h3>
                    <p class="event-description">{{event.description}}</p>
                    
                    <div class="event-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            {{event.event_date | dateFormat}}
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            {{event.location}}
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-ticket-alt"></i>
                            {{getAvailableTickets()}} tickets remaining
                        </div>
                    </div>
                    
                    <div class="event-progress" ng-if="event.goal_amount > 0">
                        <div class="progress-info">
                            <span>Fundraising Progress</span>
                            <span>{{calculateProgress()}}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" ng-style="{width: calculateProgress() + '%'}"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer" ng-if="showButton !== 'false'">
                    <div class="event-price">
                        <span class="price" ng-if="event.ticket_price > 0">
                            {{event.ticket_price | currencyFormat}}
                        </span>
                        <span class="price free" ng-if="event.ticket_price === 0">
                            Free
                        </span>
                    </div>
                    <a ng-href="/events/{{event.id}}" class="btn btn-primary btn-sm">
                        View Details
                    </a>
                </div>
            </div>
        `,
        link: function(scope, element, attrs) {
            scope.defaultImage = 'assets/images/event-default.jpg';
            
            /**
             * Get event image
             */
            scope.getEventImage = function() {
                return scope.event.image_url || scope.defaultImage;
            };
            
            /**
             * Get available tickets
             */
            scope.getAvailableTickets = function() {
                if (!scope.event.max_attendees || !scope.event.total_tickets_sold) {
                    return scope.event.max_attendees || 0;
                }
                return scope.event.max_attendees - scope.event.total_tickets_sold;
            };
            
            /**
             * Calculate fundraising progress
             */
            scope.calculateProgress = function() {
                if (!scope.event.goal_amount || scope.event.goal_amount === 0) return 0;
                const progress = (scope.event.current_amount / scope.event.goal_amount) * 100;
                return Math.min(Math.round(progress), 100);
            };
            
            /**
             * Get status class
             */
            scope.getStatusClass = function() {
                if (!scope.event.is_active || scope.event.is_suspended) {
                    return 'inactive';
                }
                
                const eventDate = new Date(scope.event.event_date);
                const now = new Date();
                
                if (eventDate < now) {
                    return 'ended';
                }
                
                const availableTickets = scope.getAvailableTickets();
                if (availableTickets === 0) {
                    return 'sold-out';
                }
                
                return 'active';
            };
            
            /**
             * Get status text
             */
            scope.getStatusText = function() {
                if (!scope.event.is_active || scope.event.is_suspended) {
                    return 'Ended';
                }
                
                const eventDate = new Date(scope.event.event_date);
                const now = new Date();
                
                if (eventDate < now) {
                    return 'Ended';
                }
                
                const availableTickets = scope.getAvailableTickets();
                if (availableTickets === 0) {
                    return 'Sold Out';
                }
                
                return 'Active';
            };
        }
    };
});