(function () {
    "use strict";

    angular.module("app")
        .service("invalidLoadSealDialogService", InvalidLoadSealDialogService);

    function InvalidLoadSealDialogService($uibModal){
        'ngInject';
        return {
            show: show
        };

        function show(options){
            return $uibModal.open({
                templateUrl: 'app/dialogs/invalid-load-seal-dialog.html',
                controller: InvalidLoadSealDialogController,
                controllerAs: '$ctrl',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            }).result;
        }
    }

    function InvalidLoadSealDialogController($uibModalInstance, options){
        'ngInject';

        var vm = this;

        Object.assign(vm, {
            respond: respond
        }, options);

        function respond(res) {
            $uibModalInstance.close({
                response: res
            });
        }
    }

})();