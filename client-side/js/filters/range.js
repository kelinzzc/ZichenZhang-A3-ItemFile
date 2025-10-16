charityEventsApp.filter('range', function() {
    return function(input, min, max) {
        min = parseInt(min);
        max = parseInt(max);
        var result = [];
        for (var i = min; i <= max; i++) {
            result.push(i);
        }
        return result;
    };
});