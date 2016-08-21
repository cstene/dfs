(function() {
    "use strict";

    angular
        .module("app.index", ['ui.router'])
        .config(_config)
        .controller("IndexController", indexController);

    function _config($stateProvider) {
        "ngInject";

        $stateProvider.state("index", {
            url: "/",
            template: "<div></div>",
            controller: "IndexController"
        });
    }

    function indexController($state) {
        "ngInject";
        // Do not inject any app or cyan services here - it interferes with initializing cyanNative.

        $state.go('dfs');
    }
})();