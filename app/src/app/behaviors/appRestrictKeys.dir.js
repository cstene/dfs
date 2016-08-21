(function () {

    'use strict';
    angular

    .module('app')
        /**
            * Map of regex patterns to use
            * in markup. You may add globally common patterns here
            * or extend this constant via angular.config for
            * more app-specific patterns
            */
        .constant('restrictKeyPattern', {
            numbers: '[0-9]',
            currency: '[0-9\.\,]',
            alphanumeric: '[A-Za-z0-9]'
        })

        /**
         * @description - Restrict the keys that can be pressed
         * on any element that accepts "keypress" event (such as <input>)
         * 
         * Parameter is any key from restrictKeyPattern constant.
         * 
         * @example - <input app-restrict-keys="numbers" />
         */
        .directive('appRestrictKeys', RestrictKeysFactory);

    function RestrictKeysFactory(restrictKeyPattern) {
        'ngInject';

        return {
            restrict: 'A',
            link : link
        };

        function link(scope, el, attr) {
            var
                testpattern = null;

            init();

            function init() {
                var key = attr.appRestrictKeys;
                if (!key) {
                    throw new Error('No restrict pattern specified on element');
                }
                if (!restrictKeyPattern[key]) {
                    throw new Error('Unknown restrict pattern: ' + key);
                }
                testpattern = new RegExp(restrictKeyPattern[key]);
                el.on('keydown', onKeyPress);
            }

            function onKeyPress(evt) {
                var
                    allowEnter = typeof attr.allowEnter !== 'undefined',
                    allowTab = typeof attr.allowTab !== 'undefined';
                    //allowBackspace = typeof attr.allowBackspace !== 'undefined';

                //if (allowBackspace && evt.keyCode === 8) {
                if (evt.keyCode === 8) {
                    return true;
                }

                if (allowEnter && evt.keyCode === 13) {
                    return true;
                }
                if (allowTab && evt.keyCode === 9) {
                    return true;
                }
                var char = String.fromCharCode(evt.which);
                if (!testpattern.test(char)) {
                    evt.preventDefault();
                    return false;
                }
                return true;

            }

        }
    }
})();