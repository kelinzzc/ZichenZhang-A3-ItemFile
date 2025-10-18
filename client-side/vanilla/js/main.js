(function() {
    var state = {
        page: 1,
        limit: 9,
        total: 0,
        q: '',
        category: '',
        location: ''
    };

    var grid = document.getElementById('grid');
    var pageInfo = document.getElementById('pageInfo');
    var errorBox = document.getElementById('error');
    var statsBox = document.getElementById('stats');

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
    }
    function clearError() {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
    }

    function normalizeImageUrl(url) {
        if (!url) return '../images/default.jpg';
        // When data contains absolute paths like "/images/event1.jpg", convert to relative path to client-side/images
        if (typeof url === 'string' && url.indexOf('/images/') === 0) {
            return '..' + url; // => ../images/xxx.jpg
        }
        return url;
    }

    function renderCards(list) {
        grid.innerHTML = '';
        list.forEach(function(ev) {
            var div = document.createElement('div');
            div.className = 'card';
            var progress = 0;
            if (ev.goal_amount && ev.goal_amount > 0) {
                progress = Math.round((ev.current_amount || 0) / ev.goal_amount * 100);
            }
            div.innerHTML = (
                '<img src="' + normalizeImageUrl(ev.image_url) + '" alt="' + (ev.title || '') + '">' +
                '<div class="card-body">' +
                    '<div class="badge">' + (ev.category_name || 'Event') + '</div>' +
                    '<h3>' + (ev.title || '') + '</h3>' +
                    '<div class="muted">' + (ev.location || '') + ' · ' + (ev.event_date || '') + '</div>' +
                    '<div class="muted">Goal $' + (ev.goal_amount || 0) + ' · Progress ' + progress + '%</div>' +
                    '<div style="margin-top:8px; display:flex; gap:8px;">' +
                        '<a href="event.html?id=' + ev.id + '" class="btn">Details</a>' +
                        '<a href="register.html?eventId=' + ev.id + '" class="btn">Register</a>' +
                    '</div>' +
                '</div>'
            );
            grid.appendChild(div);
        });
    }

    function updatePagination(total) {
        state.total = total || 0;
        var totalPages = Math.max(1, Math.ceil(state.total / state.limit));
        pageInfo.textContent = 'Page ' + state.page + ' / ' + totalPages;
        document.getElementById('prevBtn').disabled = state.page <= 1;
        document.getElementById('nextBtn').disabled = state.page >= totalPages;
    }

    function loadCategories() {
        return API.categories().then(function(data) {
            var sel = document.getElementById('category');
            (data || []).forEach(function(c) {
                var opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                sel.appendChild(opt);
            });
        }).catch(function(e){ /* Ignore category loading failure */ });
    }

    function loadStats() {
        return API.eventStats().then(function(s) {
            statsBox.textContent = 'Events: ' + (s.total_events || '-') + ' · Total Goal: $' + (s.total_goal_amount || '-') + ' · Total Registrations: ' + (s.total_registrations || '-');
        }).catch(function(){ statsBox.textContent = ''; });
    }

    function loadEvents() {
        clearError();
        var params = { page: state.page, limit: state.limit };
        if (state.q) params.q = state.q;
        if (state.category) params.category = state.category;
        if (state.location) params.location = state.location;

        var req = state.q ? API.eventSearch(params) : API.events(params);

        req.then(function(res) {
            var list = Array.isArray(res) ? res : (res.data || res.items || res.events || []);
            var total = (res.pagination && res.pagination.total) || list.length;
            renderCards(list);
            updatePagination(total);
        }).catch(function(err) {
            showError('Failed to load events, please try again later');
            console.error(err);
        });
    }

    // Event binding
    document.getElementById('searchBtn').addEventListener('click', function(){
        state.q = document.getElementById('q').value.trim();
        state.category = document.getElementById('category').value;
        state.location = document.getElementById('location').value.trim();
        state.page = 1;
        loadEvents();
    });
    document.getElementById('prevBtn').addEventListener('click', function(){ if (state.page>1){ state.page--; loadEvents(); }});
    document.getElementById('nextBtn').addEventListener('click', function(){ state.page++; loadEvents(); });

    // Initialization
    Promise.all([loadCategories(), loadStats()]).then(loadEvents);
})();

