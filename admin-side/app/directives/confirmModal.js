angular.module('CharityEventsAdminApp')
.directive('confirmModal', ['ModalService', function(ModalService) {
    return {
        restrict: 'E',
        template: `
            <div class="modal-overlay" ng-if="modalState.isOpen">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3>{{modalState.title}}</h3>
                        <button class="modal-close" ng-click="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>{{modalState.message}}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" ng-click="closeModal()">
                            cancel
                        </button>
                        <button class="btn" 
                                ng-class="{
                                    'btn-primary': modalState.type === 'confirm',
                                    'btn-warning': modalState.type === 'warning',
                                    'btn-danger': modalState.type === 'danger'
                                }"
                                ng-click="confirmAction()">
                            notarize
                        </button>
                    </div>
                </div>
            </div>
        `,
        link: function(scope, element, attrs) {
            scope.modalState = ModalService.getState();
            
            scope.closeModal = function() {
                ModalService.close();
            };
            
            scope.confirmAction = function() {
                if (scope.modalState.onConfirm) {
                    scope.modalState.onConfirm();
                }
                ModalService.close();
            };
            
            // 监听模态框状态变化
            scope.$watch(function() {
                return ModalService.getState();
            }, function(newState) {
                scope.modalState = newState;
            }, true);
        }
    };
}]);