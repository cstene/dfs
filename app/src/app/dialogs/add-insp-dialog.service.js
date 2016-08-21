(function () {
    'use strict';

    angular
        .module('app')
        .factory('addInspDialogService', AddInspDialogServiceFactory);

    function AddInspDialogServiceFactory($uibModal) {
        'ngInject';

        return {
            show: show
        };

        function show(options) {
            return $uibModal.open({
                templateUrl: 'app/dialogs/add-insp-dialog.html',
                controller: AddInspDialogController,
                controllerAs: '$ctrl',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            }).result;
        }
    }

    function AddInspDialogController($log, $uibModalInstance, options, cyanDateTimeService) {
        'ngInject';
        var vm = this;

        Object.assign(vm, options, {
            model: {},            
            isBusy: false,

            // actions
            cancel: cancel,
            save: save
        });

        function cancel() {
            $uibModalInstance.dismiss({ cancelled: true });
        }

        function save() {
            vm.isBusy = true;
            vm.model.created = cyanDateTimeService.getLocalDateTime();
            $uibModalInstance.close({model:vm.model});            
        }
    }

})();
