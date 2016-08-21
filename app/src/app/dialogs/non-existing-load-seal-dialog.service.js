(function () {
    "use strict";

    angular.module("app")
        .service("nonExistingLoadSealDialogService", NonExistingLoadSealDialogService);

    function NonExistingLoadSealDialogService($uibModal){
        'ngInject';
        return {
            show: show
        };

        function show(options){
            return $uibModal.open({
                templateUrl: 'app/dialogs/non-existing-load-seal-dialog.html',
                controller: NonExistingLoadSealDialogController,
                controllerAs: '$ctrl',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            }).result;
        }
    }

    function NonExistingLoadSealDialogController($uibModalInstance, options){
        'ngInject';

        var vm = this;

        Object.assign(vm, {
            respond: respond
        }, options);

        function respond(response) {
            $uibModalInstance.close({
                result: response
            });
        }
    }

})();