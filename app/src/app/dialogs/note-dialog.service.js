(function () {
    'use strict';

    angular
        .module('app')
        .factory('noteDialogService', NoteDialogServiceFactory);

    /**
     * Factory for NoteDialogService
     */
    function NoteDialogServiceFactory($log, $q, $uibModal) {
        'ngInject';

        return {
            show: show
        };

        /**
         * Displays a note dialog
         * 
         * Ref: https://angular-ui.github.io/bootstrap/#/modal
         * 
         * @param {Object} options - Display options
         * @param {Boolean} options.isAppendRequired - Note must be appended to be value
         * @param {String} options.initialValue - Text to load initially
         * 
         * @returns {Promise<Object>}
         */
        function show(options) {
            var modal = $uibModal.open({
                templateUrl: 'app/dialogs/note-dialog.html',
                controller: NoteDialogController,
                controllerAs: 'vm',
                resolve: {
                    options: function () {
                        return options;
                    }
                }
            });
            return modal.result;
        }
    }

    function NoteDialogController($log, $uibModalInstance, options) {
        'ngInject';
        var vm = this;

        Object.assign(vm, {
            content: options.content || '',
            isRequired: options.isRequired,
            originalContent: options.content || '',

            // lifecycle
            $onInit: init,            

            // actions
            cancel: cancel,
            save: save,
            photo: photo
        });
        // computed
        Object.defineProperties(vm, {
            isContentAppended: {
                get: function isContentAppended() {
                    /*var
                        before = ('' + vm.originalContent).trim(),
                        after = ('' + vm.content).trim();
                    return after.length > 0 && after.length > before.length;*/
                    return ('' + vm.originalContent).trim() !== ('' + vm.content).trim();
                }
            },

            isSaveDisabled: {
                get: function getIsSaveDisabled() {
                    return vm.isRequired ? !vm.isContentAppended : false;
                }
            },

            isPhotosDisabled: {
                get: function getIsPhotosDisabled() {
                    return vm.isSaveDisabled;
                }
            }
        });

        function init() {
            if(vm.content.length > 0){
                vm.content += '\n\n';
            }
        }

        function cancel() {
            $uibModalInstance.dismiss({ cancelled: true });
        }

        function save() {
            $uibModalInstance.close({
                photoSelected: false,
                content: vm.content
            });
        }

        function photo() {
            $uibModalInstance.close({
                photoSelected: true,
                content: vm.content
            });
        }

    }
})();