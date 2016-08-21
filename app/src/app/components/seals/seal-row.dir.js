(function () {
    'use strict';

    angular
        .module('app')
        .component('appSealRow', {
            templateUrl: 'app/components/seals/seal-row.html',
            controller: SealRowController,
            bindings: {
                model: '<ngModel'
            },
            require: {
                parent: '^appCompartmentarea',
                ngModelCtrl: 'ngModel'
            }
        });


    function SealRowController($log, $scope, $element, $timeout, validateSealViewModel) {
        'ngInject';

        var
            vm = this,
            _isSelected = false;

        //$log.debug('SealRowController', vm);

        Object.assign(vm, {
            trigger: trigger,
            $onInit: init,
            $onChanges: onChanges,

            focusOriginal: focusOriginal,
            focusReseal: focusReseal,
            sealValueChanged: sealValueChanged,
            originalCleared: originalCleared,
            resealCleared: resealCleared,
            validate: validate
        });

        Object.defineProperties(vm, {
            isSelected: {
                get: function () {
                    return _isSelected;
                },
                set: function (val) {
                    if (val !== _isSelected) {
                        $timeout(function () {
                            $scope.$apply(function () {
                                _isSelected = val;
                            });
                        });
                    }
                }
            }
        });

        function init() {
            $element.on('blur change', 'input', modelChanged);
            vm.ngModelCtrl.$validators.seal = isValid;
        }

        function onChanges(c) {
            if (c.model) {
                modelChanged();
            }
        }

        function sealValueChanged(prop, value) {
            modelChanged();
            trigger(null, 'seal:value:changed', {
                prop: prop,
                value: value
            });
        }

        function modelChanged() {
            validate();
        }

        function isValid(modelValue, viewValue) {
            modelValue = modelValue || vm.ngModelCtrl.$modelValue;
            viewValue = viewValue || vm.ngModelCtrl.$viewValue;
            var
                value = modelValue || viewValue,
                validations = validateSealViewModel('completeInbound', value, {
                    doNotThrow: true
                });
            return typeof validations === 'undefined';
        }

        function validate() {
            vm.ngModelCtrl.$validate();
            //vm.ngModelCtrl.$setValidity('inboundSeal', isValid());
        }

        function originalCleared() {
            $timeout(function () {
                $scope.$apply(function () {
                    vm.model.original = null;
                    //focusOriginal(); // this is doing weird scrolling
                });
                modelChanged();
            });
        }

        function resealCleared() {
            $timeout(function () {
                $scope.$apply(function () {
                    vm.model.reseal = null;
                    //focusReseal();// this is doing weird scrolling
                });
                modelChanged();
            });
        }

        function focusReseal() {
            $element.find('input:last').focus();
        }

        function focusOriginal() {
            $element.find('input:first').focus();
        }

        function trigger(event, name, data) {
            $scope.$emit(name, data, vm, event);
        }
    }
})();
