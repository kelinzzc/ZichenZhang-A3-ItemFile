angular.module('CharityEventsAdminApp')
.factory('ModalService', ['$rootScope', function($rootScope) {
    var modalState = {
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm', // confirm, warning, danger
        onConfirm: null,
        onCancel: null
    };

    return {
        /**
         * 打开确认模态框
         */
        openConfirm: function(title, message, onConfirm, onCancel) {
            modalState.isOpen = true;
            modalState.title = title;
            modalState.message = message;
            modalState.type = 'confirm';
            modalState.onConfirm = onConfirm;
            modalState.onConfirm = onCancel;
            
            // 触发 AngularJS 更新
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

        /**
         * 打开警告模态框
         */
        openWarning: function(title, message, onConfirm) {
            modalState.isOpen = true;
            modalState.title = title;
            modalState.message = message;
            modalState.type = 'warning';
            modalState.onConfirm = onConfirm;
            
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

        /**
         * 打开危险操作模态框
         */
        openDanger: function(title, message, onConfirm) {
            modalState.isOpen = true;
            modalState.title = title;
            modalState.message = message;
            modalState.type = 'danger';
            modalState.onConfirm = onConfirm;
            
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

        /**
         * 关闭模态框
         */
        close: function() {
            modalState.isOpen = false;
            modalState.title = '';
            modalState.message = '';
            modalState.type = 'confirm';
            modalState.onConfirm = null;
            modalState.onCancel = null;
            
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

        /**
         * 获取模态框状态
         */
        getState: function() {
            return modalState;
        }
    };
}]);