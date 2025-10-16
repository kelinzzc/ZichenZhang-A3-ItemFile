angular.module('CharityEventsApp')
.controller('RegistrationController', ['$scope', '$routeParams', '$location', 'EventService', 'RegistrationService', 'MessageService', function($scope, $routeParams, $location, EventService, RegistrationService, MessageService) {
    var vm = this;
    
    // 初始化数据
    vm.event = null;
    vm.registrationData = {
        event_id: null,
        full_name: '',
        email: '',
        phone: '',
        ticket_count: 1,
        special_requirements: ''
    };
    vm.isLoading = false;
    vm.isSubmitting = false;
    vm.validationErrors = [];
    
    /**
     * 初始化控制器
     */
    vm.init = function() {
        const eventId = $routeParams.eventId;
        
        if (!eventId) {
            MessageService.showError('无效的活动ID');
            $location.path('/events');
            return;
        }
        
        vm.registrationData.event_id = parseInt(eventId);
        vm.loadEventDetails(eventId);
    };
    
    /**
     * 加载活动详情
     */
    vm.loadEventDetails = function(eventId) {
        vm.isLoading = true;
        
        EventService.getEventById(eventId)
            .then(function(response) {
                vm.event = response.event;
                vm.isLoading = false;
                
                // 检查活动是否可以注册
                if (!vm.canRegister()) {
                    MessageService.showWarning('该活动目前无法注册');
                    $location.path('/events/' + eventId);
                }
            })
            .catch(function(error) {
                console.error('加载活动详情失败:', error);
                MessageService.showError('加载活动详情失败');
                $location.path('/events');
            });
    };
    
    /**
     * 检查是否可以注册
     */
    vm.canRegister = function() {
        if (!vm.event) return false;
        
        // 检查活动状态
        if (!vm.event.is_active || vm.event.is_suspended) {
            return false;
        }
        
        // 检查活动日期（简单检查）
        const eventDate = new Date(vm.event.event_date);
        const now = new Date();
        if (eventDate < now) {
            return false;
        }
        
        return true;
    };
    
    /**
     * 提交注册表单
     */
    vm.submitRegistration = function() {
        // 验证数据
        const validation = RegistrationService.validateRegistration(vm.registrationData);
        
        if (!validation.isValid) {
            vm.validationErrors = validation.errors;
            MessageService.showError('请修正表单中的错误');
            return;
        }
        
        vm.isSubmitting = true;
        vm.validationErrors = [];
        
        RegistrationService.createRegistration(vm.registrationData)
            .then(function(response) {
                MessageService.showSuccess('注册成功！感谢您的参与。');
                
                // 重置表单
                vm.registrationData = {
                    event_id: vm.registrationData.event_id,
                    full_name: '',
                    email: '',
                    phone: '',
                    ticket_count: 1,
                    special_requirements: ''
                };
                
                // 跳转到活动详情页
                $location.path('/events/' + vm.registrationData.event_id);
            })
            .catch(function(error) {
                console.error('注册失败:', error);
                
                if (error.code === 'DUPLICATE_REGISTRATION') {
                    MessageService.showError('您已经注册过此活动');
                } else if (error.code === 'INSUFFICIENT_TICKETS') {
                    MessageService.showError('票数不足：' + error.message);
                } else if (error.code === 'EVENT_UNAVAILABLE') {
                    MessageService.showError('活动不可用：' + error.message);
                    $location.path('/events/' + vm.registrationData.event_id);
                } else {
                    MessageService.showError('注册失败：' + (error.message || '未知错误'));
                }
            })
            .finally(function() {
                vm.isSubmitting = false;
            });
    };
    
    /**
     * 增加票数
     */
    vm.increaseTickets = function() {
        if (vm.registrationData.ticket_count < 10) {
            vm.registrationData.ticket_count++;
        }
    };
    
    /**
     * 减少票数
     */
    vm.decreaseTickets = function() {
        if (vm.registrationData.ticket_count > 1) {
            vm.registrationData.ticket_count--;
        }
    };
    
    /**
     * 获取可用票数
     */
    vm.getAvailableTickets = function() {
        if (!vm.event) return 0;
        
        // 这里简化处理，实际应该从API获取准确的可用票数
        return vm.event.max_attendees - (vm.event.total_tickets_sold || 0);
    };
    
    /**
     * 计算总金额
     */
    vm.calculateTotalAmount = function() {
        if (!vm.event) return 0;
        return vm.event.ticket_price * vm.registrationData.ticket_count;
    };
    
    // 初始化控制器
    vm.init();
}]);