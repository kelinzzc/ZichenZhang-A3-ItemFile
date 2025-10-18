angular.module('CharityEventsAdminApp')
.controller('RegistrationsController', ['$scope', 'AdminRegistrationService', 'AdminEventService', 'ModalService', 
function($scope, AdminRegistrationService, AdminEventService, ModalService) {
    console.log('RegistrationsController reloaded:', new Date().toISOString());
    
    var vm = this;

    // Data
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

    /**
     * Load events list
     */
    vm.loadEvents = function() {
        console.log('Starting to load events list...');
        AdminEventService.getAllEvents()
            .then(function(response) {
                console.log('Events list loaded successfully:', response);
                vm.events = response.data || [];
            })
            .catch(function(error) {
                console.error('Failed to load events list:', error);
                vm.events = [];
            });
    };

    /**
     * Load registration records
     */
    vm.loadRegistrations = function() {
        console.log('Starting to load registration records...');
        vm.isLoading = true;
        vm.error = '';

        AdminRegistrationService.getAllRegistrations({ limit: 100 })
            .then(function(response) {
                console.log('Registration records API response:', response);
                
                // Process API response data
                var registrations = response.data || [];
                var pagination = response.pagination || {};
                
                if (!Array.isArray(registrations)) {
                    console.error('Registration records data format error:', typeof registrations);
                    vm.error = 'Data format error: registration records are not in array format';
                    vm.isLoading = false;
                    return;
                }
                
                // Update data
                vm.registrations = registrations;
                vm.filteredRegistrations = registrations;
                vm.pagination.totalItems = pagination.total || registrations.length;
                
                // Calculate total tickets
                vm.totalTickets = registrations.reduce(function(total, reg) {
                    return total + (parseInt(reg.ticket_count) || 0);
                }, 0);
                
                console.log('Registration records loaded successfully:');
                console.log('- Total records:', vm.registrations.length);
                console.log('- Total tickets:', vm.totalTickets);
                console.log('- Pagination total:', vm.pagination.totalItems);
                
                vm.isLoading = false;
            })
            .catch(function(error) {
                console.error('Failed to load registration records:', error);
                vm.error = error.message || 'Failed to load registration records, please check network connection';
                vm.isLoading = false;
            });
    };

    /**
     * Search registration records
     */
    vm.searchRegistrations = function() {
        console.log('Searching registration records:', vm.searchQuery);
        
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
     * Filter by event
     */
    vm.filterByEvent = function() {
        console.log('Filtering by event:', vm.selectedEvent);
        
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
     * Filter by date
     */
    vm.filterByDate = function() {
        console.log('Filtering by date:', vm.dateFilter);
        
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
     * Update pagination information
     */
    vm.updatePagination = function() {
        vm.pagination.totalItems = vm.filteredRegistrations.length;
        vm.pagination.currentPage = 1;
    };

    /**
     * Update statistics
     */
    vm.updateStatistics = function() {
        vm.totalTickets = vm.filteredRegistrations.reduce(function(total, reg) {
            return total + (parseInt(reg.ticket_count) || 0);
        }, 0);
        
        console.log('Statistics updated:');
        console.log('- Filtered records count:', vm.filteredRegistrations.length);
        console.log('- Filtered total tickets:', vm.totalTickets);
    };

    // ==================== Action Functions ====================
    
    /**
     * Delete registration record
     */
    vm.deleteRegistration = function(registration) {
        console.log('Preparing to delete registration record:', registration);
        
        if (confirm('Are you sure you want to delete registration record "' + registration.full_name + '"? This action cannot be undone.')) {
            AdminRegistrationService.deleteRegistration(registration.id)
                .then(function() {
                    console.log('Registration record deleted successfully');
                    vm.loadRegistrations(); // Reload data
                })
                .catch(function(error) {
                    console.error('Failed to delete registration record:', error);
                    alert('Deletion failed: ' + (error.message || 'Unknown error'));
                });
        }
    };

    /**
     * Set view mode
     */
    vm.setViewMode = function(mode) {
        console.log('Switching view mode:', mode);
        vm.viewMode = mode;
    };

    /**
     * Refresh data
     */
    vm.refreshData = function() {
        console.log('Refreshing data...');
        vm.loadRegistrations();
    };

    /**
     * Export registration records
     */
    vm.exportRegistrations = function() {
        console.log('Exporting registration records...');
        
        var csvContent = "ID,Name,Email,Phone,Event,Tickets,Registration Date,Special Requirements\n";
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
        
        console.log('Export completed');
    };

    // ==================== Utility Functions ====================
    
    /**
     * Format date
     */
    vm.formatDate = function(value) {
        if (!value) return '';
        try { 
            return new Date(value).toLocaleString('en-US'); 
        } catch(e) { 
            return value; 
        }
    };

    /**
     * Format currency
     */
    vm.formatCurrency = function(amount) {
        if (!amount && amount !== 0) return '$0.00';
        return '$' + parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    /**
     * Get event status
     */
    vm.getEventStatus = function(event) {
        if (!event) return { text: 'Unknown', class: 'badge-secondary' };
        
        if (event.is_active && !event.is_suspended) {
            return { text: 'Active', class: 'badge-success' };
        } else if (event.is_suspended) {
            return { text: 'Suspended', class: 'badge-warning' };
        } else {
            return { text: 'Ended', class: 'badge-secondary' };
        }
    };

    // ==================== Initialization ====================
    
    /**
     * Initialize controller
     */
    vm.init = function() {
        console.log('Initializing registration records controller...');
        vm.loadEvents();
        vm.loadRegistrations();
    };

    // Start initialization
    vm.init();
}]);