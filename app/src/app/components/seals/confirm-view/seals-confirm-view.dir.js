(function (undefined) {
    'use strict';

    angular
        .module('app')

        .component('sealsConfirmView', {
            templateUrl: 'app/components/seals/confirm-view/seals-confirm-view.html',
            bindings: {
                collection: '<',
                compartments: '<',
                options: '<'
            },
            controller: SealsConfirmViewController
        });

    function SealsConfirmViewController($q, $element, $scope, $log, _, APP_CONST, stringHelpers, cyanBootstrapUi, $timeout, SoundService, cyanNative, config) {
        'ngInject';

        var
            vm = this,            
            AREA = APP_CONST.AREA,
            TOP = AREA.TOP,
            BOTTOM = AREA.BOTTOM,
            confirmationRunning = false;

        Object.assign(vm, {
            $onInit: init,
            $onChanges: onChanges,
            predicate: 'index',
            reverse: true,
            selectedRow: null,            
            onRowSelected: onRowSelected,
            setFocusTop: setFocusTop
        });

        function init() {
            $element.on('focus', 'seal-confirm-row', function (evt) {
                onRowSelected(angular.element(evt.currentTarget).controller('sealConfirmRow'));
            });
            $element.on('keydown', 'app-seal-input', onSealInputKeyPress);            
            $scope.$on('seal:blur', onSealBlur);
            $scope.$on('seal:value:changed', onSealValueChanged);
            $scope.$on('seal:cleared', onSealCleared);
        }

        function onSealValueChanged(/*evt, data*/) {
            confirmationRunning = false;            
            //if (data.prop === 'reseal' && data.value) {
            //    lastResealInput = data.value;
            //}
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
                /** Apply tabbing on Enter key press*/
         
        function onSealInputKeyPress(evt) {
            var
                tabKeys = [13, 9],
                isTabKey = tabKeys.indexOf(evt.keyCode) >= 0;

            if (!isTabKey) {
                return;
            }

            evt.preventDefault();

            checkSealConfirmation(true);
        }

        function onSealBlur() {            
            checkSealConfirmation(false);
        }

        /*How do confirm seals work?
         * We needed to validate the seals on enter (for barcode) and on blur (when user clicks off field).
         * 1. confirmationRunning - This flag is used to prevent the validation from running multiple times. 
         * without this flag any popup in the confirm logic will pop-up multiple times. 
         * 2. allowTabNext - This flag allows us to go to nextt tab when coming from enter but prevent next tab when
         * coming from onBlur.
         * 3. tabRequire - This flag tells us the confirmation is happy to move forward in the workflow (select the next 
         * appropriate field.
         */
        function checkSealConfirmation(allowTabNext) {
            if (!confirmationRunning) {
                confirmationRunning = true;
                confirmScannedSeal()
                .then(function (tabRequired) {
                    runSpecialTopSealValidation();
                    if (allowTabNext && tabRequired) {
                        tabNext();
                    }
                    confirmationRunning = false;
                });
            }
        }

        /*We have added a configuration to turn validation of top seals on/off.
         * When validation is turn on we can skip this process.
         * When validation is turned "off" it becomes optional. If the user goes into the 
         * top seals and enters a value the validation must be turned back on. If they
         * remove that value validation is turned off.
         * This runs after any seal is validated or cleared.
         */
        function runSpecialTopSealValidation() {
            if (getArea() === TOP && !config.get(APP_CONST.CONFIG.OUTBOUND_REQUIRE_TOP_SEALS, true)) {
                //Need to check if this was a top seal that was changed.

                var allRows = getRows();
                var optionalSealPresent = _(allRows).some(function (row) {
                    return row.model.scannedSeal;
                });
                
                _(allRows).forEach(function (row) {
                    if (row.model.required !== optionalSealPresent) {
                        row.model.required = optionalSealPresent;
                        row.validate();
                    }                    
                });                
            }
        }

        function onSealCleared() {
            $timeout(function () {
                $scope.$apply(function () {
                    runSpecialTopSealValidation();
                });
            });

        }

        //Returns if user can move to next row
        function confirmScannedSeal() {
            var deferred = $q.defer(),
                selectedRow = Object.assign({}, vm.selectedRow);

            if (!selectedRow.model) {
                deferred.resolve(false);
                return deferred.promise;
            }

            if (selectedRow.model.scannedSeal === selectedRow.model.confirmedValue)
            {
                deferred.resolve(true);
                return deferred.promise;
            }           
            
            //Run confirmation code.            
            if (selectedRow.model.scannedSeal) {                
                var confirmedSeal = _(selectedRow.parent.model.seals).find(function (s) {
                    return s.original === selectedRow.model.scannedSeal;
                });

                var isDuplicate = _.filter(selectedRow.parent.model.seals, function (s) {
                    return s.scannedSeal === selectedRow.model.scannedSeal;
                }).length > 1;

                if (isDuplicate) {
                    failedToConfirmFeedback();
                    selectedRow.model.scannedSeal = null;
                    setConfirmed(null, selectedRow);
                    cyanBootstrapUi.alert("Duplicate seal. Please enter again.")
                    .then(function () {
                        deferred.resolve(true);
                    });
                }
                else if (confirmedSeal) {
                    SoundService.beep();
                    setConfirmed(true, selectedRow)                    
                    .then(function () {                                                
                        deferred.resolve(true);
                    });
                }
                else {
                    failedToConfirmFeedback();
                    confirmNewSealDialog(selectedRow)
                    .then(function () {                        
                        return setConfirmed(false, selectedRow);
                    })
                    .then(function () {                        
                        deferred.resolve(true);
                    })
                    .catch(function () {
                        selectedRow.model.scannedSeal = null;
                        setConfirmed(null, selectedRow);                        
                        deferred.resolve(false);
                    });
                }
            }
            else {
                setConfirmed(null, selectedRow)
                .then(function () {                    
                    deferred.resolve(true);
                });                
            }

            return deferred.promise;
        }

        function failedToConfirmFeedback() {
            cyanNative.vibrate(1000);
            SoundService.bloop();            
        }
        
        function getArea() {
            if (vm.selectedRow != null) {
                return vm.selectedRow.parent.model.area;
            }            
        }

        function confirmNewSealDialog(selectedRow) {
            var opt = {
                message: stringHelpers.format([
                        'The provided Seal #<strong>{0}</strong> was not expected on <strong>compartment {1}.</strong>',
                        'Please click "Correction" if this seal is correct. Press "Cancel" to return to the screen and re-enter the seal number.'
                ].join('<br /><br />'),
                    selectedRow.model.scannedSeal,
                    selectedRow.model.compartment
                ),
                title: 'Confirm New Seal',
                cancelText: "Cancel",
                okText: "Correction"
            };

            return cyanBootstrapUi.promptOkCancel(opt);
        }
        
        function tabNext() {
            if (canTabNext()) {
                var nextRow = getNextRow();

                if (nextRow) {
                    onRowSelected(nextRow).focusScannedSeal();
                    return nextRow;
                }                
            }            
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
            return $element.getChildControllers('seal-confirm-row');
        }

        function getCompartments() {
            return $element.getChildControllers('seals-confirm-compartment');
        }

        function setFocusTop() {
            getRows()[0].focusScannedSeal();
        }

        function setConfirmed(val, selectedRow) {            
            return $timeout(function () {
                $scope.$apply(function () {
                    selectedRow.setConfirmed(val);
                });
            });
        }

    }

})();