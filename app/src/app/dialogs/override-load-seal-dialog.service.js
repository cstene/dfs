(function () {
    "use strict";

    angular.module("app")
        .service("overrideLoadSealDialogService", OverrideLoadSealDialogService);

    function OverrideLoadSealDialogService($uibModal) {
        'ngInject';
        return {
            show: show
        };

        function show(options) {
            return $uibModal.open({
                templateUrl: 'app/dialogs/override-load-seal-dialog.html',
                controller: OverrideLoadSealDialogController,
                controllerAs: '$ctrl',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            }).result;
        }
    }

    function OverrideLoadSealDialogController($log,
                                              cyanNative,
                                              $uibModalInstance,
                                              options) {
        'ngInject';

        var vm = this;

        Object.assign(vm, {
            cancel: cancel,
            captureSignature: captureSignature
        }, options);

        function captureSignature() {
            cyanNative
                .goToSignature({
                    width: 320,
                    height: 240,
                    quality: 100,
                    signedByName: vm.employeeId
                })
                .then(function(res){
                    $uibModalInstance.close({
                        isSuccess: true,
                        response: Object.assign({}, res, vm)
                    });
                })
                .catch(function (err) {
                    $uibModalInstance.close({
                        isSuccess: false,
                        response: err
                    });
                });

        }

        function cancel() {
            $uibModalInstance.close({
                isSuccess: false,
                isCancelled: true
            });
        }
    }

})();