angular.module('CharityEventsAdminApp')
.directive('statsCard', [function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            value: '@',
            icon: '@'
        },
        template: '\
            <div class="stat-card">\n\
                <div style="display:flex; align-items:center; gap:8px;">\n\
                    <i class="fas" ng-class="icon"></i>\n\
                    <div>\n\
                        <div style="font-size:12px; color:#666;">{{title}}</div>\n\
                        <div style="font-size:20px; font-weight:600;">{{value}}</div>\n\
                    </div>\n\
                </div>\n\
            </div>'
    };
}]);


