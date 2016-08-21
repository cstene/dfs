(function () {
    "use strict";
    angular
        .module("app")
        .directive("appToUppercase", toUppercaseBehavior);

    function toUppercaseBehavior() {
        return {
            restrict: "A",
            require: {
                ngModelCtrl: "ngModel"
            },
            bindToController: true,
            controller: ToUppercaseBehaviorController,
            controllerAs: "toUppercaseCtrl",
            scope: {
                isEnabled: "<cyToUppercase"
            }
        };
    }

    function ToUppercaseBehaviorController($log, $element) {
        "ngInject";

        var vm = this;

        Object.assign(vm, {
            $onInit: $onInit
        });

        function $onInit() {
            if (typeof this.isEnabled === "undefined" || this.isEnabled) {
                $element.css("text-transform", "uppercase");

                vm.ngModelCtrl.$parsers.push(function (value) {
                    return value && typeof value === "string" ?
                        value.toUpperCase() :
                        value;
                });
            }
        }
    }

})();