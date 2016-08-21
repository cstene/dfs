(function () {
    'use strict';

    angular
        .module('app')
        .run(LogScreenSize);

    function LogScreenSize($window, logger) {
        'ngInject';
        logger.info('** BEGIN SCREEN SIZE **');

        logger.info('$window.innerWidth', $window.innerWidth);
        logger.info('$window.innerHeight ', $window.innerHeight);

        logger.info('** END SCREEN SIZE **');
    }

})();