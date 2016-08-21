(function() {
    "use strict";

    angular
        .module("app")
        .directive("appShowError", function() {
            var dir = {
                restrict: "AE",
                scope: false,
                template: "<span class='help-block' ng-transclude></span>",
                transclude: true
            };

            //dir.link = function link(scope, element, attrs, controller, transcludeFn) {

            //};

            return dir;
        });
})();