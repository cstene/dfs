/**
 * Trim leading zeros from an input element
 */
(function (undefined) {
    'use strict';

    angular
        .module('app')
        .directive('appTrimLeadZeroes', TimeLeadZeroesDirectiveFactory);

    function TimeLeadZeroesDirectiveFactory() {
        'ngInject';
        
        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };

        function link(scope, el, attr, ngModel) {

            el.on('keydown', function (evt) {

                var tabKeys = [13, 9],
                    isTabKey = tabKeys.indexOf(evt.keyCode) >= 0;
                if (isTabKey) {
                    var value = '' + ngModel.$viewValue;
                    if (value && value.indexOf('0') === 0) {
                        ngModel.$setViewValue(value.replace(/^0*/g, ''));
                        ngModel.$render();
                    }
                }
            });
        }
    }
})();