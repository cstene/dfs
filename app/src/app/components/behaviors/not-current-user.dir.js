/**
 * Applies a validation that the
 * attached model cannot be the current user
 *
 * usage: <input ng-model="$ctrl.otherEmpId" app-not-current-user />
 */
(function () {
    "use strict";
    angular
        .module("app")
        .directive("appNotCurrentUser", notCurrentUserBehavior);

    function notCurrentUserBehavior() {
        return {
            restrict: "A",
            require: {
                ngModelCtrl: "ngModel"
            },
            bindToController: true,
            controller: NotCurrentUserController,
            controllerAs: "notCurrentUserCtrl",
            scope: {}
        };
    }

    function NotCurrentUserController($log, AppContext) {
        "ngInject";

        var vm = this;

        Object.assign(vm, {
            $onInit: $onInit
        });

        function $onInit() {
            vm.ngModelCtrl.$validators.notCurrentUser = validateNotCurrentUser;

            function validateNotCurrentUser(viewValue, modelValue){
                var value = viewValue || modelValue;
                if(!value){
                    return true;
                }

                var
                    thisValue = parseInt(value, 10),
                    currentUserValue = parseInt(AppContext.getCurrentUser(), 10);
                return thisValue !== currentUserValue;
            }
        }
    }

})();