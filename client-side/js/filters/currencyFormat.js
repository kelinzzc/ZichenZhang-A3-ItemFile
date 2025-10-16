charityEventsApp.filter('currencyFormat', ['$filter', function($filter) {
    return function(input, symbol, decimals) {
        if (input === null || input === undefined) return symbol + '0';
        return $filter('currency')(input, symbol, decimals);
    };
}]);