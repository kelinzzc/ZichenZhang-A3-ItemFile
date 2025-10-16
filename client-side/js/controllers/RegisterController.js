charityEventsApp.controller('RegisterController', ['$scope', '$routeParams', '$location', 'EventService', 'RegistrationService',
    function($scope, $routeParams, $location, EventService, RegistrationService) {
    
    // 初始化数据
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
    
    // 加载活动信息
    function loadEvent() {
        EventService.getById($routeParams.eventId)
            .then(function(response) {
                var data = response.data.data || response.data;
                $scope.event = data.event || data;
                $scope.loading = false;
            })
            .catch(function(error) {
                console.error('加载活动信息失败:', error);
                $scope.error = '加载活动信息失败，请稍后重试';
                $scope.loading = false;
            });
    }
    
    // 提交注册
    $scope.submitRegistration = function() {
        if ($scope.registrationForm.$invalid) {
            $scope.error = '请填写所有必填字段';
            return;
        }
        
        $scope.submitting = true;
        $scope.error = '';
        
        RegistrationService.create($scope.registration)
            .then(function(response) {
                $scope.success = true;
                $scope.submitting = false;
                
                // 3秒后跳转到活动详情页
                setTimeout(function() {
                    $location.path('/events/' + $routeParams.eventId);
                }, 3000);
            })
            .catch(function(error) {
                console.error('注册失败:', error);
                
                if (error.data && error.data.code === 'DUPLICATE_REGISTRATION') {
                    $scope.error = '您已经注册过此活动，无法重复注册';
                } else if (error.data && error.data.code === 'INSUFFICIENT_TICKETS') {
                    $scope.error = '剩余票数不足，请选择更少的票数';
                } else {
                    $scope.error = error.data && error.data.message ? error.data.message : '注册失败，请稍后重试';
                }
                
                $scope.submitting = false;
            });
    };
    
    // 计算总金额
    $scope.calculateTotal = function() {
        if (!$scope.event) return 0;
        return $scope.registration.ticket_count * $scope.event.ticket_price;
    };
    
    // 检查是否还有空位
    $scope.hasAvailableTickets = function() {
        if (!$scope.event) return false;
        return $scope.event.available_tickets > 0;
    };
    
    // 初始化
    loadEvent();
}]);