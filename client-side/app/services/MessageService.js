angular.module('CharityEventsApp')
.factory('MessageService', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    
    // 初始化消息数组
    $rootScope.messages = [];
    
    return {

        showSuccess: function(message, duration = 5000) {
            this.showMessage(message, 'success', duration);
        },


        showWarning: function(message, duration = 5000) {
            this.showMessage(message, 'warning', duration);
        },

        showError: function(message, duration = 8000) {
            this.showMessage(message, 'error', duration);
        },

 
        showMessage: function(message, type = 'info', duration = 5000) {
            const messageObj = {
                id: Date.now() + Math.random(),
                text: message,
                type: type,
                timestamp: new Date()
            };

            $rootScope.messages.push(messageObj);

            // 自动移除消息
            if (duration > 0) {
                $timeout(() => {
                    this.removeMessage(messageObj.id);
                }, duration);
            }

            // 触发 AngularJS 更新
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

        /**
         * 移除消息
         */
        removeMessage: function(messageId) {
            $rootScope.messages = $rootScope.messages.filter(msg => msg.id !== messageId);
            
            // 触发 AngularJS 
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

        /**
         * 清空所有消息
         */
        clearAll: function() {
            $rootScope.messages = [];
            
            // 触发 AngularJS 
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        }
    };
}]);