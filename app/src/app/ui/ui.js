/*jshint -W100*/
(function() {
    "use strict";

    angular
        .module("app.ui")
        .config(_config)
        .service("ui", UIService);

    function _config(blockUIConfig) {
        // Configure BlockUI for loading messages.
        blockUIConfig.autoBlock = false;
        blockUIConfig.delay = 0;
        blockUIConfig.message = "Loading…";
        blockUIConfig.resetOnException = false;
        blockUIConfig.templateUrl = "app/ui/loading.html";
    }

    /**
     * Provides access to common UI elements.
     * @constructor
     */
    function UIService(_, $q, $rootScope, $templateRequest, $uibModal, blockUI, blockUIConfig) {

        var loadingDeferred = null;

        var defaults = {
            showError: {
                backdrop: "static",
                controller: "ErrorDialogController",
                templateUrl: "app/ui/error-dialog.html"
            }
        };

        /**
         * Hides the blocking "loading" message. Note that if this is not called from within Angular, `$scope.$apply`
         * must be used to apply the changes.
         */
        this.hideLoading = function() {
            if (loadingDeferred) {
                loadingDeferred.promise.then(function() {
                    blockUI.reset();
                });
                return;
            }

            if (blockUI.isBlocking()) {
                blockUI.reset();
            }
        };

        /**
         * Displays a modal error dialog.
         * @param {String} caption A string to appear as the title of the dialog.
         * @param {String} message A string to appear in the body of the dialog.
         * @param {*} error A string or object containing the error details.
         * @param {Object} options An object containing any of the options for `$uibModal.open`, and:
         *                         - model: The data to be passed to the template. `caption`, `message`, and `error`
         *                                  may be specified here instead of as separate arguments.
         * @returns The `$uibModalInstance` that represents the open dialog. 
         */
        this.showError = function(caption, message, error, options) {
            // Allow `options` to be passed as the last argument.
            if (arguments.length > 0 && _.isObject(arguments[arguments.length - 1])) {
                options = arguments[arguments.length - 1];
            }
            options = options || {};

            var model = _.extend({
                caption: _.isString(caption) ? caption : "Error",
                message: _.isString(message) ? message : "An unknown error has occurred.",
                error: error ? error : null
            }, options.model);
            options.resolve = options.resolve || {};
            // Use a "private" name for the model, since the caller might have provided their own `resolve.model`
            // dependency.
            options.resolve.__model = model;
            options = _.extend(defaults.showError, options);

            return $uibModal.open(options);
        };

        /**
         * Shows a message that blocks all UI interaction. Note that if this is not called from within Angular, 
         * `$scope.$apply`must be used to apply the changes.
         * @param message The message to display, or an object to be passed to the template.
         * @returns A promise that resolves when the message is visible on-screen.
         */
        this.showLoading = function(message) {
            if (blockUI.isBlocking()) {
                blockUI.message(message);
                return $q.resolve();
            }

            if (loadingDeferred) {
                return loadingDeferred.promise;
            }

            var deferred = $q.defer();
            loadingDeferred = deferred;

            $templateRequest(blockUIConfig.templateUrl)
                .then(function() {
                    blockUI.start(message);
                    _.defer(function() {
                        var d = loadingDeferred;
                        loadingDeferred = null;
                        d.resolve();
                    });
                })
                .catch(function(err) {
                    var d = loadingDeferred;
                    loadingDeferred = null;
                    d.reject(err);
                });

            return deferred.promise;
        };
    }
})();