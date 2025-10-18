angular.module('CharityEventsAdminApp')
.directive('dataTable', [function() {
    return {
        restrict: 'E',
        scope: {
            items: '=',
            columns: '='
        },
        template: '\
            <table class="table">\n\
                <thead>\n\
                    <tr>\n\
                        <th ng-repeat="c in columns">{{c.header}}</th>\n\
                    </tr>\n\
                </thead>\n\
                <tbody>\n\
                    <tr ng-repeat="row in items">\n\
                        <td ng-repeat="c in columns">{{ row[c.field] }}</td>\n\
                    </tr>\n\
                </tbody>\n\
            </table>'
    };
}]);


