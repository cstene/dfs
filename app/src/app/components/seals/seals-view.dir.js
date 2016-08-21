(function (undefined) {
    'use strict';

    angular
        .module('app')

        .component('appSealsView', {
            templateUrl: 'app/components/seals/seals-view.html',
            bindings: {
                collection: '<',
                compartments: '<',
                options: '<'
            },
            controller: SealsViewController
        });

    function SealsViewController($element, $scope, $log, _, APP_CONST) {
        'ngInject';

        var
            vm = this,
            lastResealInput = null,
            AREA = APP_CONST.AREA,
            TOP = AREA.TOP,
            BOTTOM = AREA.BOTTOM;

        Object.assign(vm, {
            $onInit: init,
            $onChanges: onChanges,
            predicate: 'index',
            reverse: true,
            selectedRow: null,
            onCloneOriginal: onCloneOriginal,
            onIncrementReseal: onIncrementReseal,
            onRowSelected: onRowSelected
        });

        Object.defineProperties(vm, {
            isIncrementDisabled: {
                get: function () {
                    return vm.selectedRow === null ||
                        !canIncrementReseal();
                }
            },

            isCloneDisabled: {
                get: function () {
                    if (vm.selectedRow && !vm.selectedRow.model) {
                        $log.error('Row with no model', vm.selectedRow);
                    }
                    return !vm.selectedRow ||
                        !vm.selectedRow.model ||                        
                        !vm.selectedRow.model.original;
                }
            }
        });

        function init() {
            $element.on('click', 'app-seal-row', function (evt) {
                onRowSelected(angular.element(evt.currentTarget).controller('appSealRow'));
            });
            $element.on('keydown', 'app-seal-input', onSealInputKeyPress);
            $scope.$on('seal:value:changed', onSealValueChanged);
        }

        function onChanges(c) {
            if (c.collection) {
                if (vm.selectedRow !== null) {
                    vm.selectedRow.isSelected = false;
                    vm.selectedRow = null;
                }
            }
        }

        function onRowSelected(row) {

            if (!row) {
                $log.error('row must be defined');
            }
            if (!row.model) {
                $log.error('row must have a model', row);
            }
            vm.selectedRow = row;

            getRows().forEach(function (thisrow) {
                thisrow.isSelected = (thisrow === vm.selectedRow);
            });
            return vm.selectedRow;
        }

        function onCloneOriginal() {
            var clonevalue = vm.selectedRow.model.original;

            if (clonevalue) {
                getRows().forEach(function (row) {
                    if (row.model.original <= 0) {
                        row.model.original = clonevalue;
                        row.validate();
                    }
                });
            }
        }

        /**
         * Apply tabbing on Enter key press
         */
        function onSealInputKeyPress(evt) {
            var
                tabKeys = [13, 9],
                isTabKey = tabKeys.indexOf(evt.keyCode) >= 0;

            if (!isTabKey || !canTabNext()) {
                return;
            }

            evt.preventDefault();

            var
                el = angular.element(evt.currentTarget),
                field = el.attr('name');

            switch (field) {
                case 'original':
                    if (!vm.selectedRow.model.original) {
                        return;
                    }
                    tabNextOriginal();
                    break;

                case 'reseal':
                    if (!vm.selectedRow.model.reseal) {
                        return;
                    }
                    tabNextReseal();
                    break;

                default:
                    throw new Error('Unhandled field or not specified: ' + field);
            }
        }

        function onSealValueChanged(evt, data) {
            if (data.prop === 'reseal' && data.value) {
                lastResealInput = data.value;
            }
        }

        function canIncrementReseal() {
            return lastResealInput !== null;
        }

        function onIncrementReseal() {
            var nextValue = parseInt(lastResealInput, 10) + 1;
            vm.selectedRow.model.reseal = '' + nextValue;
            vm.selectedRow.validate();
            vm.selectedRow.focusReseal();
            lastResealInput = nextValue;
        }

        function getArea() {
            return vm.selectedRow.parent.model.area;
        }

        function tabNextOriginal() {
            var nextRow = getNextRow();
            onRowSelected(nextRow).focusOriginal();
            return nextRow;

        }

        function tabNextReseal() {
            var nextRow = getNextRow();
            onRowSelected(nextRow).focusReseal();
            return nextRow;
        }

        function getNextRow(previous) {
            var area = getArea();

            switch (area) {
                case TOP:
                    return getNextRowTop(previous);

                case BOTTOM:
                    return getNextRowBottom(previous);

                default:
                    throw new Error('Unknown area: ' + area);
            }
        }

        function getNextRowTop(previous) {
            var
                next = previous === true ? -1 : 1,

                allrows = getRows(),
                currentRowIndex = allrows.indexOf(vm.selectedRow),
                nextRowIndex = currentRowIndex + next,
                nextRow = allrows[nextRowIndex];
            return nextRow;
        }

        function getNextRowBottom(previous) {
            var
                next = previous === true ? -1 : 1,

                allcompartments = getCompartments(),
                currentCompartment = vm.selectedRow.parent,
                currentCompartmentIndex = allcompartments.indexOf(currentCompartment),

                nextCompartmentIndex = currentCompartmentIndex + next,
                nextCompartment = allcompartments[nextCompartmentIndex];

            if (!nextCompartment) {
                return false;
            }

            var
                currentCompartmentRows = currentCompartment.getRows(),
                currentCompartmentRowIndex = currentCompartmentRows.indexOf(vm.selectedRow),

                nextCompartmentRows = nextCompartment.getRows(),
                nextRow = nextCompartmentRows[currentCompartmentRowIndex];

            return nextRow;
        }

        function canTabNext() {
            var
                area = getArea();

            switch (area) {
                case TOP:
                    var
                        allrows = getRows(),
                        currentRowIndex = allrows.indexOf(vm.selectedRow);
                    return currentRowIndex + 1 !== allrows.length;

                case BOTTOM:
                    var
                        allcompartments = getCompartments(),
                        currentCompartment = vm.selectedRow.parent,
                        currentCompartmentIndex = allcompartments.indexOf(currentCompartment);
                    return currentCompartmentIndex + 1 !== allcompartments.length;

                default:
                    throw new Error('Unhandled area: ' + area);
            }
        }

        function getRows() {
            return $element.getChildControllers('app-seal-row');
        }

        function getCompartments() {
            return $element.getChildControllers('app-compartmentarea');
        }

    }

})();