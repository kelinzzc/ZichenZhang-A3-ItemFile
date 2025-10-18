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
 
        openConfirm: function(title, message, onConfirm, onCancel) {
            modalState.isOpen = true;
            modalState.title = title;
            modalState.message = message;
            modalState.type = 'confirm';
            modalState.onConfirm = onConfirm;
            modalState.onCancel = onCancel;
            

            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        },

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

 
        getState: function() {
            return modalState;
        }
    };
}]);