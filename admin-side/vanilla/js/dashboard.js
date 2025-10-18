(function(){
    var errorDiv = document.getElementById('error');
    var totalEvents = document.getElementById('totalEvents');
    var totalRegistrations = document.getElementById('totalRegistrations');
    var totalRaised = document.getElementById('totalRaised');
    var totalTickets = document.getElementById('totalTickets');
    var recentEvents = document.getElementById('recentEvents');
    var recentRegistrations = document.getElementById('recentRegistrations');

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    }

    function clearError() {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return parseInt(num).toLocaleString();
    }

    function formatCurrency(amount) {
        if (amount === null || amount === undefined) return '$0';
        return '$' + parseFloat(amount).toLocaleString();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('zh-CN');
        } catch(e) {
            return dateStr;
        }
    }

    function loadStats() {
        clearError();
        
        // 加载活动统计
        AdminAPI.getEventStats().then(function(res) {
            var data = res.data || res;
            totalEvents.textContent = formatNumber(data.total_events || 0);
            totalRaised.textContent = formatCurrency(data.total_raised || 0);
        }).catch(function(err) {
            console.error('加载活动统计失败:', err);
        });

        // 加载注册统计
        AdminAPI.getRegistrationStats().then(function(res) {
            var data = res.data || res;
            totalRegistrations.textContent = formatNumber(data.total_registrations || 0);
            totalTickets.textContent = formatNumber(data.total_tickets || 0);
        }).catch(function(err) {
            console.error('加载注册统计失败:', err);
        });
    }

    function loadRecentEvents() {
        AdminAPI.listEvents({ limit: 5 }).then(function(res) {
            var events = res.data || res || [];
            recentEvents.innerHTML = '';
            events.forEach(function(ev) {
                var tr = document.createElement('tr');
                tr.innerHTML = 
                    '<td>' + (ev.title || '') + '</td>' +
                    '<td>' + formatDate(ev.event_date) + '</td>' +
                    '<td>' + (ev.location || '') + '</td>' +
                    '<td>' + formatCurrency(ev.goal_amount) + '</td>';
                recentEvents.appendChild(tr);
            });
        }).catch(function(err) {
            console.error('加载最近活动失败:', err);
        });
    }

    function loadRecentRegistrations() {
        AdminAPI.listRegistrations({ limit: 10 }).then(function(res) {
            var registrations = res.data || res || [];
            recentRegistrations.innerHTML = '';
            registrations.forEach(function(reg) {
                var tr = document.createElement('tr');
                tr.innerHTML = 
                    '<td>' + (reg.full_name || '匿名') + '</td>' +
                    '<td>' + (reg.event_title || '未知活动') + '</td>' +
                    '<td>' + (reg.ticket_count || 1) + '</td>' +
                    '<td>' + formatDate(reg.registration_date) + '</td>';
                recentRegistrations.appendChild(tr);
            });
        }).catch(function(err) {
            console.error('加载最近注册失败:', err);
        });
    }

    function init() {
        loadStats();
        loadRecentEvents();
        loadRecentRegistrations();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
