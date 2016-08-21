/**
 * Tag a ngForm or ngModel bound element as an "Order" scoped
 * element.  The form or model will contain a value of $isOrderScoped === true
 *
 *
 */
(function () {
    "use strict";

    angular
        .module("app")
        .directive("appOrderScope", appOrderScopeFactory);

    function appOrderScopeFactory() {
        "ngInject";

        return {
            restrict: "A",
            require: {
                modelCtrl: "?ngModel",
                formCtrl: "?form"
            },
            controller: OrderScopeController,
            controllerAs: "orderScopeCtrl",
            bindToController: true
        };
    }

    function OrderScopeController() {
        var
            vm = this;

        Object.assign(vm, {
            $onInit: $onInit
        });

        function $onInit() {
            var ctrl = vm.modelCtrl || vm.formCtrl;
            ctrl.$isOrderScoped = true;
        }
    }

})();