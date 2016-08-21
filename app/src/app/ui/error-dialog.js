(function() {
    "use strict";

    angular
        .module("app.ui")
        .controller("ErrorDialogController", errorDialogController);

    function errorDialogController(_, $scope, __model, cyanNative) {
        "ngInject";

        _.extend($scope, __model);

        if (__model.error && _.isObject(__model.error)) {
            $scope.errorKeys = [];
            for (var key in __model.error) {
                if (__model.error.hasOwnProperty(key) && !_.isObject(__model.error[key]) && !_.isFunction(__model.error[key])) {
                    $scope.errorKeys.push(key);
                }
            }
        }

        $scope.goToRegistration = function() {
            cyanNative.goToRegistration();
        };

    }
})();