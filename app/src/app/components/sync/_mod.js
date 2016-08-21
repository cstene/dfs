(function () {
    'use strict';
    angular
        .module('app.sync', [])
        .config(_config);

    /**
    * Configures the Inbound List view's route.
    */
    function _config($stateProvider) {
        "ngInject";

        $stateProvider.state("bulkSync", {
            cache: false,
            url: "/bulkSync",
            templateUrl: "app/components/sync/syncView.html",
            controller: "syncController",
            controllerAs: "vm"
        });
    }
})();