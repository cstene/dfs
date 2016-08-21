(function () {
    'use strict';

    angular
        .module('app')
        .factory('completeInspDialogService', CompleteInspDialogServiceFactory);

    /**
     * Factory for CompleteInspDialogService
     */
    function CompleteInspDialogServiceFactory($log, $q, $uibModal) {
        'ngInject';

        return {
            show: show
        };

        /**
         * Displays complete inspection dialog.         
         */
        function show() {
            var modal = $uibModal.open({
                templateUrl: 'app/dialogs/complete-insp-dialog.html',
                controller: CompleteInspDialogController,
                controllerAs: 'vm'
            });
            
            return modal.result;
        }
    }

    function CompleteInspDialogController($uibModalInstance) {
            'ngInject';
        var vm = this;

        Object.assign(vm, {
            // lifecycle
            //$onInit: init,

            // actions
            cancel: cancel,
            complete: complete
        });

        Object.defineProperties(vm, {
            disableComplete: {
                get: function () {
                    return vm.isTopShipperSeals === undefined || vm.isBottomShipperSeals === undefined;
                }
            }
        });

        function cancel() {
            $uibModalInstance.dismiss({ cancelled: true });
        }

        function complete() {
            $uibModalInstance.close({
                isTopShipperSeals: vm.isTopShipperSeals,
                isBottomShipperSeals: vm.isBottomShipperSeals
            });
        }
    }
})();