/**
 * Behavior modifier for bscYesNoBtn component. When a note is required,
 * will prompt for a note.  Note is required when yes-class="'btn-danger'" or no-class="'btn-danger'"
 * 
 * When note is required and not provided (dialog cancelled), the Y/N value will be reverted to its
 * original value.
 * 
 * Usage <bsc-yes-no-btn 
 *          app-require-note 
 *          initial-note-value="vm.somenotevalue" 
 *          on-note-change="vm.callback(options)">
 *      </bsc-yes-no-btn>
 */
(function () {
    'use strict';
    angular.module('app')
        .directive('appRequireNote', RequireNoteDirectiveFactory);

    function RequireNoteDirectiveFactory() {
        return {
            restrict: 'A',
            controller: RequireNoteController,
            controllerAs: 'requireNoteCtrl',
            require: {
                ngModelCtrl: 'ngModel',
                btnCtrl: 'bscYesNoBtn'
            },
            bindToController: {
                requireNote: '@',
                ngModel: '<',
                yesClass: '<',
                noClass: '<',
                initialNoteValue: '<',
                onNoteChange: '&'
            }
        };
    }

    function RequireNoteController($log, noteDialogService) {
        'ngInject';

        var vm = this;

        Object.assign(vm, {
            originalValue: undefined,

            $onInit: init,
            $onChanges: changes
        });

        function init() {
            vm.originalValue = vm.ngModelCtrl.$viewValue;
        }

        function changes(change) {
            if (change.ngModel && isNoteRequired()) {
                noteDialogService.show({
                    content: vm.initialNoteValue,
                    isRequired: true
                })
                .then(function (data) {
                    if (vm.onNoteChange) {
                        vm.onNoteChange({ options: data });
                    }
                })
                .catch(function () {
                    vm.ngModelCtrl.$setViewValue(vm.originalValue);
                });
            }
        }

        function isNoteRequired() {
            if (vm.yesClass === 'btn-danger') {
                return vm.btnCtrl.isYesSelected;
            } else if (vm.noClass === 'btn-danger') {
                return vm.btnCtrl.isNoSelected;
            } else {
                return false;
            }
        }

    }

})();