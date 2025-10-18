charityEventsApp.controller('EventDetailsController', ['$scope', '$routeParams', 'EventService', 
    function($scope, $routeParams, EventService) {
    
    // 初始化
    $scope.event = null;
    $scope.registrations = [];
    $scope.loading = true;
    $scope.error = '';
    
    // 加载详情
    function loadEventDetails() {
        $scope.loading = true;
        
        EventService.getById($routeParams.id)
            .then(function(response) {
                var data = response.data.data || response.data;
                $scope.event = data.event || data;
                $scope.registrations = data.registrations || [];
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('Failed to load the activity details:', error);
                $scope.error = 'Failed to load the activity details. Please try again later.';
                $scope.loading = false;
            });
    }
    
    // 检查状态
    $scope.isUpcoming = function() {
        if (!$scope.event || !$scope.event.event_date) return false;
        var eventDate = new Date($scope.event.event_date);
        var now = new Date();
        return eventDate > now;
    };
    
    // 计算筹款进度
    $scope.calculateProgress = function() {
        if (!$scope.event) return 0;
        return ($scope.event.current_amount / $scope.event.goal_amount) * 100;
    };
    
    // 检查空位
    $scope.hasAvailableTickets = function() {
        if (!$scope.event) return false;
        return $scope.event.available_tickets > 0;
    };
    
    // 初始化
    loadEventDetails();
}]);