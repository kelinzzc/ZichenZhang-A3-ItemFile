angular.module('CharityEventsAdminApp')
.controller('EventFormController', ['$scope', '$routeParams', '$location', 'AdminEventService', 'AdminApiService', 
function($scope, $routeParams, $location, AdminEventService, AdminApiService) {
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
    vm.categories = [];

    /**
     * 初始化控制器
     */
    vm.init = function() {
        var eventId = $routeParams.id;
        
        // 加载类别列表
        vm.loadCategories();
        
        if (eventId) {
            vm.isEdit = true;
            vm.loadEvent(eventId);
        }
    };

    /**
     * 加载类别列表
     */
    vm.loadCategories = function() {
        AdminApiService.get('/categories')
            .then(function(response) {
                console.log('EventFormController.loadCategories 响应:', response);
                vm.categories = response.data || response;
            })
            .catch(function(error) {
                console.error('加载类别失败:', error);
                // 使用默认类别作为后备
                vm.categories = [
                    { id: 1, name: '慈善晚宴' },
                    { id: 2, name: '趣味跑' },
                    { id: 3, name: '艺术展览' },
                    { id: 4, name: '线上募捐' },
                    { id: 5, name: '社区服务' },
                    { id: 6, name: '教育讲座' }
                ];
            });
    };

    /**
     * 加载活动数据（编辑模式）
     */
    vm.loadEvent = function(eventId) {
        vm.isLoading = true;

        AdminEventService.getEventById(eventId)
            .then(function(response) {
                console.log('EventFormController.loadEvent 响应:', response);
                
                // 处理不同的响应格式
                if (response.event) {
                    vm.event = response.event;
                } else if (response.data && response.data.event) {
                    vm.event = response.data.event;
                } else {
                    vm.event = response;
                }
                
                console.log('EventFormController.loadEvent 处理后的活动数据:', vm.event);
                
                // 格式化日期为HTML datetime-local输入格式
                if (vm.event.event_date) {
                    var eventDate = new Date(vm.event.event_date);
                    vm.event.event_date = eventDate.toISOString().slice(0, 16);
                }
                
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
        vm.validationErrors = [];
        
        if (!vm.event.title || vm.event.title.trim() === '') {
            vm.validationErrors.push('活动标题不能为空');
        }
        
        if (!vm.event.description || vm.event.description.trim() === '') {
            vm.validationErrors.push('活动描述不能为空');
        }
        
        if (!vm.event.event_date) {
            vm.validationErrors.push('活动日期不能为空');
        }
        
        if (!vm.event.location || vm.event.location.trim() === '') {
            vm.validationErrors.push('活动地点不能为空');
        }
        
        if (!vm.event.max_attendees || vm.event.max_attendees < 1) {
            vm.validationErrors.push('最大参与人数必须大于0');
        }
        
        if (vm.validationErrors.length > 0) {
            return;
        }

        vm.isSubmitting = true;
        vm.validationErrors = [];

        var submitPromise;
        if (vm.isEdit) {
            console.log('更新活动 - 活动ID:', vm.event.id);
            console.log('更新活动 - 完整数据:', vm.event);
            
            if (!vm.event.id) {
                alert('错误：活动ID不存在，无法更新活动');
                return;
            }
            
            submitPromise = AdminEventService.updateEvent(vm.event.id, vm.event);
        } else {
            console.log('创建活动:', vm.event);
            submitPromise = AdminEventService.createEvent(vm.event);
        }

        submitPromise
            .then(function(response) {
                console.log('表单提交成功:', response);
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