(function () {
    'use strict';

    angular
      .module('app')

    .constant('yesNoBtnOptions', {
        defaults: {
            yesValue: 1,
            noValue: 0
        }
    })

    .component('bscYesNoBtn', {
        templateUrl: 'app/components/bscYesNoBtn.html',
        controller: YesNoButtonController,
        bindings: {
            yesValue: '<',
            noValue: '<',
            yesClass: '<',
            noClass: '<',
            yesDisplayValue: '<',
            noDisplayValue: '<',
            onValueChange: '&',
            isDisabled: '<ngDisabled'
        },
        require: {
            ngModelCtrl: 'ngModel'
        }
    });

    function YesNoButtonController($attrs, $log, yesNoBtnOptions) {
        var ctrl = this;

        // public
        Object.assign(ctrl, {
            setYesValue: setYesValue,
            setNoValue: setNoValue,
            $onInit: init
        });
        // public computed
        Object.defineProperties(ctrl, {
            /**
             * The value ngModel must be to resolve as "Yes"
             */
            yesModelValue: {
                get: function getYesValue() {
                    return $attrs.$attr.yesValue ? ctrl.yesValue : yesNoBtnOptions.defaults.yesValue;
                }
            },
            /**
             * The value ngModel must be to resovle as "No"
             */
            noModelValue: {
                get: function getNoValue() {
                    return $attrs.$attr.noValue ? ctrl.noValue : yesNoBtnOptions.defaults.noValue;
                }
            },

            isYesSelected: {
                get: function getIsYesSelected() {
                    return ctrl.ngModelCtrl.$viewValue === ctrl.yesModelValue;
                }
            },

            isNoSelected: {
                get: function getIsNoSelected() {
                    return ctrl.ngModelCtrl.$viewValue === ctrl.noModelValue;
                }
            },

            noCss: {
                get: function getNoCss() {
                    var css = ctrl.noClass || 'btn-success';
                    return ctrl.isNoSelected ? css : '';
                }
            },

            yesCss: {
                get: function getYesCss() {
                    var css = ctrl.yesClass || 'btn-success';
                    return ctrl.isYesSelected ? css : '';
                }
            },

            noDisplay: {
                get: function () {
                    return ctrl.noDisplayValue ? ctrl.noDisplay : 'N';
                }
            },

            yesDisplay: {
                get: function () {
                    return ctrl.yesDisplayValue ? ctrl.yesDisplay : 'Y';
                }
            }

        });

        function init() {
            ctrl.ngModelCtrl.$isEmpty = isEmpty;
            ctrl.ngModelCtrl.$viewChangeListeners.push(ctrl.onValueChange);                        
        }

        function setYesValue() {
            ctrl.ngModelCtrl.$setViewValue(ctrl.yesModelValue);
        }

        function setNoValue() {
            ctrl.ngModelCtrl.$setViewValue(ctrl.noModelValue);
        }

        function isEmpty() {
            var value = ctrl.ngModelCtrl.$viewValue || ctrl.ngModelCtrl.$viewValue;
            return value !== ctrl.noModelValue && value !== ctrl.yesModelValue;
        }
    }
})();