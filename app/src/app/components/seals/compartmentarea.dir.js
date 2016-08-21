(function () {
    'use strict';

    angular
        .module('app')

        .component('appCompartmentarea', {
            templateUrl: 'app/components/seals/compartmentarea.html',
            controller: CompartmentAreaController,
            bindings: {
                model: '<',

                disableIncrement: '<',
                onIncrement: '&',

                disableClone: '<',
                onClone: '&'
            }
        });

    function CompartmentAreaController($scope, $element, $log, _, APP_CONST) {
        'ngInject';

        var
            vm = this,
            BOTTOM = APP_CONST.AREA.BOTTOM;

        Object.assign(vm, {
            addSeal: addSeal,
            removeEmptySeal: removeEmptySeal,

            trigger: trigger,
            getRows: getRows
        });

        Object.defineProperties(vm, {
            column2Label: {
                get: function () {
                    return vm.model.area === BOTTOM ?
                        'Double-Seal' :
                        'Reseal';
                }
            },

            disableAddSeal: {
                get: function () {
                    var max = vm.model.meta.max;
                    return vm.model.seals.length === max;
                }
            },

            //Disable if the last seal has values or if there is only 1 seal.
            disableRemoveEmptySeal: {
                get: function () {
                    var lastSeal = _(vm.model.seals).last();
                    return vm.model.seals.length === 1 ||
                        lastSeal.original ||
                        lastSeal.reseal;
                }
            },
            compartmentClass: {
                get: function () {
                    return 'app-compartment-' + vm.model.id.toLowerCase();
                }
            }
        });

        function addSeal($event) {
            trigger($event, 'seal:add:requested', {
                area: vm.model.area,
                compartment: vm.model.id
            });
        }

        function removeEmptySeal($event) {
            trigger($event, 'seal:remove:requested', {
                area: vm.model.area,
                compartment: vm.model.id
            });
        }

        function trigger(event, name, data) {
            $scope.$emit(name, data, vm, event);
        }

        function getRows() {
            return $element.getChildControllers('app-seal-row');
        }
    }

})();