(function () {
    "use strict";

    angular
        .module("app")
        .directive("focusMe", function ($timeout) {
            "ngInject";
            var dir = {                
                scope: {
                    trigger: '=focusMe'
                },
                link: function (scope, element) {
                    scope.$watch('trigger', function (value) {
                        if (value === true) {
                            $timeout(function () {
                                element[0].focus();
                                scope.trigger = false;                                
                            });               
                        }
                    });
                }        
            };

            return dir;
        });
})();