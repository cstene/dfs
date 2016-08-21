/**
 * Validates a control using an expression.
 *
 * Usage: <input ng-model="$ctrl.myModel" app-is-valid="$ctrl.isValid()" />
 *
 */
(function () {
    "use strict";

    angular
        .module("app")
        .directive("appIsValid", isValidDirectiveFactory);

    function isValidDirectiveFactory() {
        "ngInject";

        return {
            restrict: "A",
            require: {
                "ngModelCtrl": "ngModel"
            },
            controller: IsValidController,
            controllerAs: "isValidCtrl",
            bindToController: {
                "isValidExpression": "<appIsValid"
            }
        };
    }

    function IsValidController() {
        var vm = this;

        Object.assign(vm, {
            $onChanges: $onChanges
        });

        function $onChanges(changes){
            vm.ngModelCtrl.$setValidity("appIsValid", changes.isValidExpression.currentValue);
        }
    }

})();