charityEventsApp.filter('dateFormat', function() {
    return function(input, format) {
        if (!input) return '';
        
        var date = new Date(input);
        
        if (format === 'short') {
            return date.toLocaleDateString('zh-CN');
        } else if (format === 'long') {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        } else if (format === 'time') {
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            // 默认格式
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };
});