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
            gridOptions:{
                enableSorting: true,
                columnDefs:[
                    {name: 'Home Team', field:'homeTeam'},
                    {name: 'Away Team', field:'awayTeam'}
                ],
                data:[
                    {"homeTeam": "DEN", awayTeam: "CAR"}
                ]
            }

        });
    }

})();