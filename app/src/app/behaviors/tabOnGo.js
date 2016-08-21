(function () {
    "use strict";

    angular
        .module("app")
        .directive("onTabGo", onTabGo);

    function onTabGo() {
        return {
            restrict: "A",
            controller: OnTabGoController,
            controllerAs: "ctrl",
            bindToController: {
                focusElement: '@'
            }
        };
    }

    function OnTabGoController($element) {
        'ngInject';
        var vm = this;

        init();

        function init(){
            $element.on('keydown', onKeyPress);
        }

        function onKeyPress(e){
            if (e.keyCode === 13 || e.keyCode === 9) {
                angular.element('#' + vm.focusElement).focus();
            }
        }
    }
})();