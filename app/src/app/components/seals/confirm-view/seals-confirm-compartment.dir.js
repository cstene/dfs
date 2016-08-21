(function () {
    'use strict';

    angular
        .module('app')

        .component('sealsConfirmCompartment', {
            templateUrl: 'app/components/seals/confirm-view/seals-confirm-compartment.html',
            controller: SealsConfirmCompartmentController,
            bindings: {
                model: '<'
            }
        });

    function SealsConfirmCompartmentController($scope, $element) {
        'ngInject';

        var
            vm = this;

        Object.assign(vm, {
            addSeal: addSeal,
            removeEmptySeal: removeEmptySeal,

            trigger: trigger,
            getRows: getRows
        });

        Object.defineProperties(vm, {
            disableAddSeal: {
                get: function () {
                    var max = vm.model.meta.max;
                    return vm.model.seals.length === max;
                }
            },

            //Number of rows must be equal or greater than number of rows provided by BRATS.
            disableRemoveEmptySeal: {
                get: function () {
                    return vm.model.seals.length <= vm.model.meta.initial;                    
                }
            },
            compartmentClass: {
                get: function () {
                    return 'seal-compartment-' + vm.model.id.toLowerCase(); 
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
            return $element.getChildControllers('seal-confirm-row');
        }
    }

})();