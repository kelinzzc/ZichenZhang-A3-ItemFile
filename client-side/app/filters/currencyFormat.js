angular.module('CharityEventsApp')
.filter('currencyFormat', function() {
    return function(input) {
        if (!input && input !== 0) return '';
        
        const amount = parseFloat(input);
        
        if (isNaN(amount)) {
            return input;
        }
        
        if (amount === 0) {
            return '免费';
        }
        
        return '¥' + amount.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
});