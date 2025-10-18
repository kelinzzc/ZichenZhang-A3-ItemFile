angular.module('CharityEventsApp')
.filter('dateFormat', function() {
    return function(input) {
        if (!input) return '';
        
        const date = new Date(input);
        

        if (isNaN(date.getTime())) {
            return input;
        }
        
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        

        if (diffDays === 0) {
            return 'Today ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
 
        if (diffDays === 1) {
            return 'Tomorrow ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
 
        if (diffDays === -1) {
            return 'Yesterday ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        // Within a week
        if (diffDays > 0 && diffDays <= 7) {
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const weekday = weekdays[date.getDay()];
            return `${weekday} ${date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
        
        // Default format
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
});