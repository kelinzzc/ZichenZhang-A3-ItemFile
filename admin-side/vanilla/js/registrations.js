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
            return new Date(dateStr).toLocaleString('zh-CN');
        } catch(e) {
            return dateStr;
        }
    }

    function getEventTitle(eventId) {
        var event = events.find(function(e) { return e.id == eventId; });
        return event ? event.title : '未知活动';
    }

    function renderRegistrations(registrations) {
        registrationsTable.innerHTML = '';
        (registrations || []).forEach(function(reg) {
            var tr = document.createElement('tr');
            tr.innerHTML = 
                '<td>' + reg.id + '</td>' +
                '<td>' + (reg.full_name || '匿名') + '</td>' +
                '<td>' + (reg.email || '') + '</td>' +
                '<td>' + getEventTitle(reg.event_id) + '</td>' +
                '<td>' + (reg.ticket_count || 1) + '</td>' +
                '<td>' + formatDate(reg.registration_date) + '</td>' +
                '<td>' +
                    '<button class="btn btn-danger" onclick="deleteRegistration(' + reg.id + ')">删除</button>' +
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
            showError('加载注册记录失败: ' + (err.message || '未知错误'));
        });
    }

    function loadEvents() {
        AdminAPI.listEvents({ limit: 100 }).then(function(res) {
            events = res.data || res || [];
            eventFilter.innerHTML = '<option value="">全部活动</option>';
            events.forEach(function(event) {
                var option = document.createElement('option');
                option.value = event.id;
                option.textContent = event.title;
                eventFilter.appendChild(option);
            });
        }).catch(function(err) {
            console.error('加载活动列表失败:', err);
        });
    }

    // 全局函数，供HTML调用
    window.deleteRegistration = function(id) {
        if (!confirm('确定删除这个注册记录吗？')) return;
        clearMessages();
        AdminAPI.deleteRegistration(id).then(function() {
            showSuccess('注册记录删除成功');
            loadRegistrations();
        }).catch(function(err) {
            showError('删除失败: ' + (err.message || '未知错误'));
        });
    };

    // 事件监听
    searchBtn.addEventListener('click', loadRegistrations);
    reloadBtn.addEventListener('click', loadRegistrations);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadRegistrations();
        }
    });

    // 初始化
    loadEvents();
    loadRegistrations();
})();
