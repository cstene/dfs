(function () {
    'use strict';

    angular
        .module('app')
        .controller('DfsHomeController', DfsHomeController);

    function DfsHomeController(
        $log,
        OddsService
    ) {
        'ngInject';

        $log.debug("Starting dfs tool.");

        var
            vm = this;

        Object.assign(vm, {
            fetchSaveOdds: fetchSaveOdds
        });

        function fetchSaveOdds(){
            OddsService.getWeeklyOdds();
        }
    }

})();