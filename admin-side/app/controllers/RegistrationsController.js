// 注册记录管理控制器 - 重新编写版本
angular.module('CharityEventsAdminApp')
.controller('RegistrationsController', ['$scope', 'AdminRegistrationService', 'AdminEventService', 'ModalService', 
function($scope, AdminRegistrationService, AdminEventService, ModalService) {
    console.log('RegistrationsController 重新加载:', new Date().toISOString());
    
    var vm = this;

    // ==================== 数据初始化 ====================
    vm.registrations = [];
    vm.filteredRegistrations = [];
    vm.events = [];
    vm.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    };
    vm.searchQuery = '';
    vm.selectedEvent = '';
    vm.dateFilter = '';
    vm.viewMode = 'cards';
    vm.totalTickets = 0;
    vm.isLoading = false;
    vm.error = '';

    // ==================== 核心功能函数 ====================
    
    /**
     * 加载活动列表（用于筛选下拉框）
     */
    vm.loadEvents = function() {
        console.log('开始加载活动列表...');
        AdminEventService.getAllEvents()
            .then(function(response) {
                console.log('活动列表加载成功:', response);
                vm.events = response.data || [];
            })
            .catch(function(error) {
                console.error('加载活动列表失败:', error);
                vm.events = [];
            });
    };

    /**
     * 加载注册记录
     */
    vm.loadRegistrations = function() {
        console.log('开始加载注册记录...');
        vm.isLoading = true;
        vm.error = '';

        AdminRegistrationService.getAllRegistrations({ limit: 100 })
            .then(function(response) {
                console.log('注册记录API响应:', response);
                
                // 处理API响应数据
                var registrations = response.data || [];
                var pagination = response.pagination || {};
                
                if (!Array.isArray(registrations)) {
                    console.error('注册记录数据格式错误:', typeof registrations);
                    vm.error = '数据格式错误：注册记录不是数组格式';
                    vm.isLoading = false;
                    return;
                }
                
                // 更新数据
                vm.registrations = registrations;
                vm.filteredRegistrations = registrations;
                vm.pagination.totalItems = pagination.total || registrations.length;
                
                // 计算总票数
                vm.totalTickets = registrations.reduce(function(total, reg) {
                    return total + (parseInt(reg.ticket_count) || 0);
                }, 0);
                
                console.log('注册记录加载完成:');
                console.log('- 总记录数:', vm.registrations.length);
                console.log('- 总票数:', vm.totalTickets);
                console.log('- 分页总数:', vm.pagination.totalItems);
                
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('加载注册记录失败:', error);
                vm.error = error.message || '加载注册记录失败，请检查网络连接';
                vm.isLoading = false;
            });
    };

    /**
     * 搜索注册记录
     */
    vm.searchRegistrations = function() {
        console.log('搜索注册记录:', vm.searchQuery);
        
        if (!vm.searchQuery || vm.searchQuery.trim() === '') {
            vm.filteredRegistrations = vm.registrations;
        } else {
            var query = vm.searchQuery.toLowerCase().trim();
            vm.filteredRegistrations = vm.registrations.filter(function(registration) {
                return (registration.full_name && registration.full_name.toLowerCase().includes(query)) ||
                       (registration.email && registration.email.toLowerCase().includes(query)) ||
                       (registration.phone && registration.phone.includes(query));
            });
        }
        
        vm.updatePagination();
        vm.updateStatistics();
    };

    /**
     * 按活动筛选
     */
    vm.filterByEvent = function() {
        console.log('按活动筛选:', vm.selectedEvent);
        
        if (!vm.selectedEvent || vm.selectedEvent === '') {
            vm.filteredRegistrations = vm.registrations;
        } else {
            vm.filteredRegistrations = vm.registrations.filter(function(registration) {
                return registration.event_id == vm.selectedEvent;
            });
        }
        
        vm.updatePagination();
        vm.updateStatistics();
    };

    /**
     * 按日期筛选
     */
    vm.filterByDate = function() {
        console.log('按日期筛选:', vm.dateFilter);
        
        if (!vm.dateFilter || vm.dateFilter === '') {
            vm.filteredRegistrations = vm.registrations;
        } else {
            var now = new Date();
            var filterDate = new Date();
            
            switch(vm.dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
            }
            
            vm.filteredRegistrations = vm.registrations.filter(function(registration) {
                var regDate = new Date(registration.registration_date);
                return regDate >= filterDate;
            });
        }
        
        vm.updatePagination();
        vm.updateStatistics();
    };

    /**
     * 更新分页信息
     */
    vm.updatePagination = function() {
        vm.pagination.totalItems = vm.filteredRegistrations.length;
        vm.pagination.currentPage = 1;
    };

    /**
     * 更新统计数据
     */
    vm.updateStatistics = function() {
        vm.totalTickets = vm.filteredRegistrations.reduce(function(total, reg) {
            return total + (parseInt(reg.ticket_count) || 0);
        }, 0);
        
        console.log('统计数据更新:');
        console.log('- 筛选后记录数:', vm.filteredRegistrations.length);
        console.log('- 筛选后总票数:', vm.totalTickets);
    };

    // ==================== 操作功能 ====================
    
    /**
     * 删除注册记录
     */
    vm.deleteRegistration = function(registration) {
        console.log('准备删除注册记录:', registration);
        
        if (confirm('确定要删除注册记录 "' + registration.full_name + '" 吗？此操作不可撤销。')) {
            AdminRegistrationService.deleteRegistration(registration.id)
                .then(function() {
                    console.log('注册记录删除成功');
                    vm.loadRegistrations(); // 重新加载数据
                })
                .catch(function(error) {
                    console.error('删除注册记录失败:', error);
                    alert('删除失败：' + (error.message || '未知错误'));
                });
        }
    };

    /**
     * 设置视图模式
     */
    vm.setViewMode = function(mode) {
        console.log('切换视图模式:', mode);
        vm.viewMode = mode;
    };

    /**
     * 刷新数据
     */
    vm.refreshData = function() {
        console.log('刷新数据...');
        vm.loadRegistrations();
    };

    /**
     * 导出注册记录
     */
    vm.exportRegistrations = function() {
        console.log('导出注册记录...');
        
        var csvContent = "ID,姓名,邮箱,电话,活动,票数,注册时间,特殊要求\n";
        vm.filteredRegistrations.forEach(function(reg) {
            csvContent += [
                reg.id || '',
                reg.full_name || '',
                reg.email || '',
                reg.phone || '',
                reg.event_title || '',
                reg.ticket_count || 0,
                reg.registration_date || '',
                reg.special_requirements || ''
            ].join(',') + '\n';
        });
        
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "registrations_" + new Date().toISOString().slice(0,10) + ".csv";
        link.click();
        
        console.log('导出完成');
    };

    // ==================== 工具函数 ====================
    
    /**
     * 格式化日期
     */
    vm.formatDate = function(value) {
        if (!value) return '';
        try { 
            return new Date(value).toLocaleString('zh-CN'); 
        } catch(e) { 
            return value; 
        }
    };

    /**
     * 格式化金额
     */
    vm.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '¥0.00';
        return '¥' + parseFloat(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    /**
     * 获取活动状态
     */
    vm.getEventStatus = function(event) {
        if (!event) return { text: '未知', class: 'badge-secondary' };
        
        if (event.is_active && !event.is_suspended) {
            return { text: '进行中', class: 'badge-success' };
        } else if (event.is_suspended) {
            return { text: '已暂停', class: 'badge-warning' };
        } else {
            return { text: '已结束', class: 'badge-secondary' };
        }
    };

    // ==================== 初始化 ====================
    
    /**
     * 初始化控制器
     */
    vm.init = function() {
        console.log('初始化注册记录控制器...');
        vm.loadEvents();
        vm.loadRegistrations();
    };

    // 启动初始化
    vm.init();
}]);