angular.module('CharityEventsApp')
.controller('SearchController', ['$scope', '$location', 'EventService', 'MessageService', function($scope, $location, EventService, MessageService) {
    var vm = this;
    
    // 初始化数据
    vm.searchResults = [];
    vm.searchQuery = '';
    vm.isSearching = false;
    vm.hasSearched = false;
    vm.categories = [];
    vm.filters = {
        category: '',
        location: '',
        date_from: '',
        date_to: ''
    };
    
    /**
     * 初始化控制器
     */
    vm.init = function() {
        vm.loadCategories();
        
        // 从URL参数中获取搜索词
        const urlParams = new URLSearchParams($location.search());
        const query = urlParams.get('q');
        
        if (query) {
            vm.searchQuery = query;
            vm.performSearch();
        }
    };
    
    /**
     * 加载类别
     */
    vm.loadCategories = function() {
        EventService.getCategories()
            .then(function(categories) {
                vm.categories = categories;
            })
            .catch(function(error) {
                console.warn('加载类别失败:', error);
            });
    };
    
    /**
     * 执行搜索
     */
    vm.performSearch = function() {
        if (!vm.searchQuery.trim()) {
            MessageService.showWarning('请输入搜索关键词');
            return;
        }
        
        vm.isSearching = true;
        vm.hasSearched = true;
        
        const searchParams = {
            q: vm.searchQuery
        };
        
        // 添加筛选条件
        if (vm.filters.category) {
            searchParams.category = vm.filters.category;
        }
        if (vm.filters.location) {
            searchParams.location = vm.filters.location;
        }
        if (vm.filters.date_from) {
            searchParams.date_from = vm.filters.date_from;
        }
        if (vm.filters.date_to) {
            searchParams.date_to = vm.filters.date_to;
        }
        
        EventService.searchEvents(searchParams)
            .then(function(response) {
                vm.searchResults = response.data || response;
                vm.isSearching = false;
                
                // 更新URL，但不重新加载页面
                $location.search('q', vm.searchQuery);
            })
            .catch(function(error) {
                console.error('搜索失败:', error);
                MessageService.showError('搜索失败');
                vm.isSearching = false;
            });
    };
    
    /**
     * 清空搜索
     */
    vm.clearSearch = function() {
        vm.searchQuery = '';
        vm.searchResults = [];
        vm.hasSearched = false;
        vm.filters = {
            category: '',
            location: '',
            date_from: '',
            date_to: ''
        };
        
        // 清除URL参数
        $location.search('q', null);
    };
    
    /**
     * 应用筛选
     */
    vm.applyFilters = function() {
        if (vm.searchQuery) {
            vm.performSearch();
        }
    };
    
    /**
     * 获取搜索结果统计
     */
    vm.getSearchStats = function() {
        return {
            totalResults: vm.searchResults.length,
            hasResults: vm.searchResults.length > 0
        };
    };
    
    // 初始化控制器
    vm.init();
}]);