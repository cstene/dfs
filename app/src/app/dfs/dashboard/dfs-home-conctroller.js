(function () {
    'use strict';

    angular
        .module('app')
        .controller('DfsHomeController', DfsHomeController);

    function DfsHomeController(
        $log
    ) {
        'ngInject';

        $log.debug("Starting dfs tool.");

        var
            vm = this;

        Object.assign(vm, {
            title: "dfs home"
        });
    }

})();