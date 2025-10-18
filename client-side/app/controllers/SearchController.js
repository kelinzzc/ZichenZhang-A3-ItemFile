angular.module('CharityEventsApp')
.controller('SearchController', ['$scope', '$location', 'EventService', 'MessageService', function($scope, $location, EventService, MessageService) {
    var vm = this;
    
    // Initialize data
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
     * Initialize controller
     */
    vm.init = function() {
        vm.loadCategories();
        
        // Get search term from URL parameters
        const urlParams = new URLSearchParams($location.search());
        const query = urlParams.get('q');
        
        if (query) {
            vm.searchQuery = query;
            vm.performSearch();
        }
    };
    
    /**
     * Load categories
     */
    vm.loadCategories = function() {
        EventService.getCategories()
            .then(function(categories) {
                vm.categories = categories;
            })
            .catch(function(error) {
                console.warn('Failed to load categories:', error);
            });
    };
    
    /**
     * Perform search
     */
    vm.performSearch = function() {
        if (!vm.searchQuery.trim()) {
            MessageService.showWarning('Please enter search keywords');
            return;
        }
        
        vm.isSearching = true;
        vm.hasSearched = true;
        
        const searchParams = {
            q: vm.searchQuery
        };
        
        // Add filter conditions
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
                
                // Update URL without reloading page
                $location.search('q', vm.searchQuery);
            })
            .catch(function(error) {
                console.error('Search failed:', error);
                MessageService.showError('Search failed');
                vm.isSearching = false;
            });
    };
    
    /**
     * Clear search
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
        
        // Clear URL parameters
        $location.search('q', null);
    };
    
    /**
     * Apply filters
     */
    vm.applyFilters = function() {
        if (vm.searchQuery) {
            vm.performSearch();
        }
    };
    
    /**
     * Get search results statistics
     */
    vm.getSearchStats = function() {
        return {
            totalResults: vm.searchResults.length,
            hasResults: vm.searchResults.length > 0
        };
    };
    
    // Initialize controller
    vm.init();
}]);