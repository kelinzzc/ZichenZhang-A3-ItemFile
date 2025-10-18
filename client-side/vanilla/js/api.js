(function() {

    var API_BASE = window.API_BASE || 'http://localhost:3000/api';

    function httpGet(url, params) {
        var qs = '';
        if (params && typeof params === 'object') {
            var parts = [];
            Object.keys(params).forEach(function(k) {
                var v = params[k];
                if (v !== undefined && v !== null && v !== '') {
                    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
                }
            });
            if (parts.length) qs = '?' + parts.join('&');
        }
        return fetch(url + qs).then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
    }

    function httpPost(url, body) {
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        }).then(function(res) {
            if (!res.ok) return res.json().then(function(e){ throw e; });
            return res.json();
        });
    }

    window.API = {
        events: function(params) { return httpGet(API_BASE + '/events', params); },
        eventById: function(id) { return httpGet(API_BASE + '/events/' + id); },
        eventStats: function() { return httpGet(API_BASE + '/events/stats'); },
        eventSearch: function(params) { return httpGet(API_BASE + '/events/search', params); },
        categories: function() { return httpGet(API_BASE + '/categories'); },
        register: function(payload) { return httpPost(API_BASE + '/registrations', payload); }
    };
})();


