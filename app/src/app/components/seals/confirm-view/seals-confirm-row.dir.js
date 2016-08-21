(function () {
    'use strict';

    angular
        .module('app')
        .component('sealConfirmRow', {
            templateUrl: 'app/components/seals/confirm-view/seals-confirm-row.html',
            controller: SealConfirmRowController,
            bindings: {
                model: '<ngModel'
            },
            require: {
                parent: '^sealsConfirmCompartment',
                ngModelCtrl: 'ngModel'
            }
        });


    function SealConfirmRowController($log, $scope, $element, $timeout, validateSealViewModel) {
        'ngInject';

        var
            vm = this,
            _isSelected = false;

        //$log.debug('SealRowController', vm);

        Object.assign(vm, {
            trigger: trigger,
            $onInit: init,
            $onChanges: onChanges,
                        
            sealValueChanged: sealValueChanged,
            scannedSealBlur: scannedSealBlur,
            scannedSealCleared: scannedSealCleared,
            focusScannedSeal: focusScannedSeal,
            validate: validate,
            setConfirmed: setConfirmed,
            confirmed: vm.model.confirmed
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

        function scannedSealBlur() {
            trigger(null, 'seal:blur');
        }

        function modelChanged() {
            validate();
        }

        function isValid(modelValue, viewValue) {
            //modelValue = modelValue || vm.ngModelCtrl.$modelValue;
            //viewValue = viewValue || vm.ngModelCtrl.$viewValue;
            var
                value = modelValue || viewValue,
                validations = validateSealViewModel('completeOutbound', value, {
                    doNotThrow: true
                });
            return typeof validations === 'undefined';
        }

        function validate() {
            vm.ngModelCtrl.$validate();
            //vm.ngModelCtrl.$setValidity('inboundSeal', isValid());
        }

        function scannedSealCleared() {            
            $timeout(function () {
                $scope.$apply(function () {
                    vm.model.scannedSeal = null;
                    setConfirmed(null);                    
                    //focusOriginal(); // this is doing weird scrolling
                });
                modelChanged();
                trigger(null, 'seal:cleared');
            });
        }       

        function focusScannedSeal() {
            $element.find('input:first').focus();
        }

        function trigger(event, name, data) {
            $scope.$emit(name, data, vm, event);
        }

        function setConfirmed(val) {
            vm.model.confirmed = vm.confirmed = val;
            vm.model.confirmedValue = vm.model.scannedSeal;
        }
    }
})();
