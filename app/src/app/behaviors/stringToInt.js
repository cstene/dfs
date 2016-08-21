/**
 * Allow an input[type=number] to bind
 * as a string instead of a number.
 */
(function () {
    'use strict';

    angular.module('app')

        .directive('appStringToInt', StringToIntDirectiveFactory);


    function StringToIntDirectiveFactory() {
        'ngInject';

        return {
            require: 'ngModel',
            link: link
        };

        function link(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return value === null || typeof value === 'undefined' ?
                    null :
                    '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseInt(value, 10);
            });

        }
    }

})();