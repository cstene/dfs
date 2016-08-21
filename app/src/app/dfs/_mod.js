(function () {
    'use strict';

    angular
        .module('app')
        .config(config);

    function config($stateProvider) {
        'ngInject';

        $stateProvider
            .state('dfs', {
                abstract: true,
                url: '/dfs',
                template: '<div ui-view></div>'
            })
            .state('dfs.home', {
                caption: 'DFS Home',
                url: '',
                templateUrl: 'app/dfs/dashboard/dashboard.html',
                controller: 'DfsHomeController',
                controllerAs: '$ctrl'
            });
    }

})();
