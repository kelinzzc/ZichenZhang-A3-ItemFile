angular.module('CharityEventsApp')
.directive('registrationList', function() {
    return {
        restrict: 'E',
        scope: {
            registrations: '='
        },
        template: `
            <div class="registration-list">
                <div class="registration-item" ng-repeat="registration in registrations">
                    <div class="registration-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    
                    <div class="registration-info">
                        <div class="registrant-name">{{registration.full_name}}</div>
                        <div class="registrant-contact">
                            <span class="email">{{registration.email}}</span>
                            <span class="phone" ng-if="registration.phone">{{registration.phone}}</span>
                        </div>
                        <div class="registration-meta">
                            <span class="ticket-count">{{registration.ticket_count}} 张票</span>
                            <span class="registration-date">{{registration.registration_date | dateFormat}}</span>
                        </div>
                        <div class="special-requirements" ng-if="registration.special_requirements">
                            <i class="fas fa-info-circle"></i>
                            {{registration.special_requirements}}
                        </div>
                    </div>
                </div>
            </div>
        `,
        link: function(scope, element, attrs) {
            // 指令逻辑
        }
    };
});