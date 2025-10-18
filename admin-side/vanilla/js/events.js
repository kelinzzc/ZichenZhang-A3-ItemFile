(function(){
    var eventsTable = document.getElementById('eventsTable');
    var errorDiv = document.getElementById('error');
    var successDiv = document.getElementById('success');
    var eventForm = document.getElementById('eventForm');
    var form = document.getElementById('form');
    var formTitle = document.getElementById('formTitle');
    var searchInput = document.getElementById('searchInput');
    var categoryFilter = document.getElementById('categoryFilter');
    var searchBtn = document.getElementById('searchBtn');
    var addBtn = document.getElementById('addBtn');
    var reloadBtn = document.getElementById('reloadBtn');
    var cancelBtn = document.getElementById('cancelBtn');
    
    var currentEventId = null;
    var categories = [];

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
            return new Date(dateStr).toLocaleDateString('en-US');
        } catch(e) {
            return dateStr;
        }
    }

    function formatCurrency(amount) {
        if (amount === null || amount === undefined) return '$0';
        return '$' + parseFloat(amount).toLocaleString();
    }

    function renderEvents(events) {
        eventsTable.innerHTML = '';
        (events || []).forEach(function(ev) {
            var tr = document.createElement('tr');
            var progress = 0;
            if (ev.goal_amount && ev.goal_amount > 0) {
                progress = Math.round((ev.current_amount || 0) / ev.goal_amount * 100);
            }
            tr.innerHTML = 
                '<td>' + ev.id + '</td>' +
                '<td>' + (ev.title || '') + '</td>' +
                '<td>' + formatDate(ev.event_date) + '</td>' +
                '<td>' + (ev.location || '') + '</td>' +
                '<td>' + formatCurrency(ev.goal_amount) + ' / ' + formatCurrency(ev.current_amount) + '</td>' +
                '<td>' + progress + '%</td>' +
                '<td>' +
                    '<button class="btn btn-primary" onclick="editEvent(' + ev.id + ')">Edit</button> ' +
                    '<button class="btn btn-danger" onclick="deleteEvent(' + ev.id + ')">Delete</button>' +
                '</td>';
            eventsTable.appendChild(tr);
        });
    }

    function loadEvents() {
        clearMessages();
        var params = {};
        if (searchInput.value.trim()) params.q = searchInput.value.trim();
        if (categoryFilter.value) params.category = categoryFilter.value;
        
        AdminAPI.listEvents(params).then(function(res) {
            renderEvents(res.data || res);
        }).catch(function(err) {
            showError('Failed to load events: ' + (err.message || 'Unknown error'));
        });
    }

    function loadCategories() {
        AdminAPI.getCategories().then(function(res) {
            categories = res.data || res || [];
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(function(cat) {
                var option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
            });
        }).catch(function(err) {
            console.error('Failed to load categories:', err);
        });
    }

    function showForm(isEdit, eventData) {
        eventForm.style.display = 'block';
        formTitle.textContent = isEdit ? 'Edit Event' : 'New Event';
        currentEventId = isEdit ? eventData.id : null;
        
        if (isEdit && eventData) {
            document.getElementById('title').value = eventData.title || '';
            document.getElementById('description').value = eventData.description || '';
            document.getElementById('fullDescription').value = eventData.full_description || '';
            document.getElementById('eventDate').value = eventData.event_date ? eventData.event_date.replace(' ', 'T').slice(0, 16) : '';
            document.getElementById('location').value = eventData.location || '';
            document.getElementById('venueDetails').value = eventData.venue_details || '';
            document.getElementById('ticketPrice').value = eventData.ticket_price || '';
            document.getElementById('goalAmount').value = eventData.goal_amount || '';
            document.getElementById('maxAttendees').value = eventData.max_attendees || '';
            document.getElementById('imageUrl').value = eventData.image_url || '';
        } else {
            form.reset();
        }
    }

    function hideForm() {
        eventForm.style.display = 'none';
        currentEventId = null;
        form.reset();
    }

    function saveEvent(eventData) {
        clearMessages();
        var promise = currentEventId ? 
            AdminAPI.updateEvent(currentEventId, eventData) : 
            AdminAPI.createEvent(eventData);
            
        promise.then(function() {
            showSuccess(currentEventId ? 'Event updated successfully' : 'Event created successfully');
            hideForm();
            loadEvents();
        }).catch(function(err) {
            showError('Save failed: ' + (err.message || 'Unknown error'));
        });
    }


    window.editEvent = function(id) {
        AdminAPI.getEventById(id).then(function(res) {
            var eventData = res.data || res;
            showForm(true, eventData);
        }).catch(function(err) {
            showError('Failed to load event details: ' + (err.message || 'Unknown error'));
        });
    };

    window.deleteEvent = function(id) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        clearMessages();
        AdminAPI.deleteEvent(id).then(function() {
            showSuccess('Event deleted successfully');
            loadEvents();
        }).catch(function(err) {
            showError('Deletion failed: ' + (err.message || 'Unknown error'));
        });
    };

    // Event listeners
    searchBtn.addEventListener('click', loadEvents);
    reloadBtn.addEventListener('click', loadEvents);
    addBtn.addEventListener('click', function() { showForm(false); });
    cancelBtn.addEventListener('click', hideForm);
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var formData = {
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            full_description: document.getElementById('fullDescription').value.trim(),
            event_date: document.getElementById('eventDate').value.replace('T', ' '),
            location: document.getElementById('location').value.trim(),
            venue_details: document.getElementById('venueDetails').value.trim(),
            ticket_price: parseFloat(document.getElementById('ticketPrice').value) || 0,
            goal_amount: parseFloat(document.getElementById('goalAmount').value) || 0,
            max_attendees: parseInt(document.getElementById('maxAttendees').value) || 100,
            image_url: document.getElementById('imageUrl').value.trim(),
            category_id: 1, // Default category
            organization_id: 1, // Default organization
            latitude: -33.86,
            longitude: 151.21
        };
        
        if (!formData.title) {
            showError('Please fill in the event title');
            return;
        }
        
        saveEvent(formData);
    });

    // Initialization
    loadCategories();
    loadEvents();
})();
