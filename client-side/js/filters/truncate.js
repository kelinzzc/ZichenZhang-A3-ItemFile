charityEventsApp.filter('truncate', function() {
    return function(input, length) {
        if (!input) return '';
        length = length || 50;
        
        if (input.length <= length) {
            return input;
        }
        
        return input.substring(0, length) + '...';
    };
});