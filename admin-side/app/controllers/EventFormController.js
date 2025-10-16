angular.module('CharityEventsAdminApp')
.controller('EventFormController', ['$scope', '$routeParams', '$location', 'AdminEventService', 
function($scope, $routeParams, $location, AdminEventService) {
    var vm = this;

    // 初始化数据
    vm.event = {
        title: '',
        description: '',
        full_description: '',
        category_id: 1,
        organization_id: 1,
        event_date: '',
        location: '',
        venue_details: '',
        ticket_price: 0,
        goal_amount: 0,
        max_attendees: 100,
        latitude: '',
        longitude: '',
        is_active: true,
        is_suspended: false
    };
    vm.isEdit = false;
    vm.isLoading = false;
    vm.isSubmitting = false;
    vm.validationErrors = [];

    /**
     * 初始化控制器
     */
    vm.init = function() {
        var eventId = $routeParams.id;
        
        if (eventId) {
            vm.isEdit = true;
            vm.loadEvent(eventId);
        }
    };

    /**
     * 加载活动数据（编辑模式）
     */
    vm.loadEvent = function(eventId) {
        vm.isLoading = true;

        AdminEventService.getEventById(eventId)
            .then(function(response) {
                vm.event = response.event;
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('加载活动数据失败:', error);
                alert('加载活动数据失败');
                $location.path('/events');
            });
    };

    /**
     * 提交表单
     */
    vm.submitForm = function() {
        // 验证数据
        var validation = AdminEventService.validateEvent(vm.event);
        if (!validation.isValid) {
            vm.validationErrors = validation.errors;
            return;
        }

        vm.isSubmitting = true;
        vm.validationErrors = [];

        var submitPromise;
        if (vm.isEdit) {
            submitPromise = AdminEventService.updateEvent(vm.event.id, vm.event);
        } else {
            submitPromise = AdminEventService.createEvent(vm.event);
        }

        submitPromise
            .then(function() {
                alert(vm.isEdit ? '活动更新成功' : '活动创建成功');
                $location.path('/events');
            })
            .catch(function(error) {
                console.error('提交失败:', error);
                alert('提交失败：' + (error.message || '未知错误'));
            })
            .finally(function() {
                vm.isSubmitting = false;
            });
    };

    /**
     * 取消编辑
     */
    vm.cancel = function() {
        $location.path('/events');
    };

    /**
     * 设置当前坐标（示例）
     */
    vm.setCurrentLocation = function() {
        // 这里可以集成地图API获取精确坐标
        // 目前使用示例坐标
        vm.event.latitude = -33.87;
        vm.event.longitude = 151.21;
    };

    // 初始化控制器
    vm.init();
}]);