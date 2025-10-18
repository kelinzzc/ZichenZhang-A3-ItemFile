(function(){
    var registrationsTable = document.getElementById('registrationsTable');
    var errorDiv = document.getElementById('error');
    var successDiv = document.getElementById('success');
    var searchInput = document.getElementById('searchInput');
    var eventFilter = document.getElementById('eventFilter');
    var searchBtn = document.getElementById('searchBtn');
    var reloadBtn = document.getElementById('reloadBtn');
    
    var events = [];

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
    }

    function showSuccess(msg) {
        successDiv.textContent = msg;
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    }

    function clearMessages() {
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleString('en-US');
        } catch(e) {
            return dateStr;
        }
    }

    function getEventTitle(eventId) {
        var event = events.find(function(e) { return e.id == eventId; });
        return event ? event.title : 'Unknown Event';
    }

    function renderRegistrations(registrations) {
        registrationsTable.innerHTML = '';
        (registrations || []).forEach(function(reg) {
            var tr = document.createElement('tr');
            tr.innerHTML = 
                '<td>' + reg.id + '</td>' +
                '<td>' + (reg.full_name || 'Anonymous') + '</td>' +
                '<td>' + (reg.email || '') + '</td>' +
                '<td>' + getEventTitle(reg.event_id) + '</td>' +
                '<td>' + (reg.ticket_count || 1) + '</td>' +
                '<td>' + formatDate(reg.registration_date) + '</td>' +
                '<td>' +
                    '<button class="btn btn-danger" onclick="deleteRegistration(' + reg.id + ')">Delete</button>' +
                '</td>';
            registrationsTable.appendChild(tr);
        });
    }

    function loadRegistrations() {
        clearMessages();
        var params = {};
        if (searchInput.value.trim()) params.q = searchInput.value.trim();
        if (eventFilter.value) params.event_id = eventFilter.value;
        
        AdminAPI.listRegistrations(params).then(function(res) {
            renderRegistrations(res.data || res);
        }).catch(function(err) {
            showError('Failed to load registration records: ' + (err.message || 'Unknown error'));
        });
    }

    function loadEvents() {
        AdminAPI.listEvents({ limit: 100 }).then(function(res) {
            events = res.data || res || [];
            eventFilter.innerHTML = '<option value="">All Events</option>';
            events.forEach(function(event) {
                var option = document.createElement('option');
                option.value = event.id;
                option.textContent = event.title;
                eventFilter.appendChild(option);
            });
        }).catch(function(err) {
            console.error('Failed to load event list:', err);
        });
    }

    // Global function, called from HTML
    window.deleteRegistration = function(id) {
        if (!confirm('Are you sure you want to delete this registration record?')) return;
        clearMessages();
        AdminAPI.deleteRegistration(id).then(function() {
            showSuccess('Registration record deleted successfully');
            loadRegistrations();
        }).catch(function(err) {
            showError('Deletion failed: ' + (err.message || 'Unknown error'));
        });
    };

    // Event listeners
    searchBtn.addEventListener('click', loadRegistrations);
    reloadBtn.addEventListener('click', loadRegistrations);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadRegistrations();
        }
    });

    // Initialization
    loadEvents();
    loadRegistrations();
})();