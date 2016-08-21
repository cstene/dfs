(function () {
    "use strict";

  //Array includes polyfil
    /*jshint ignore:start*/
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
            var O = Object(this);
            var len = parseInt(O.length, 10) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1], 10) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0;}
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    /*jshint ignore:end*/

    //test
    angular
        .module("app", [
            "angularMoment",
            "ngAnimate",
            "ui.router",
            "ui.bootstrap",
            "cyan.app",
            "cyan.app.util",
            "cyan.app.native",
            "cyan.app.bootstrap",
            "cyan.app.bootstrap.common.footer",
            "cyan.app.bootstrap.common.header",
            "cyan.app.bootstrap.ui",
            "cyan.app.bootstrap.about",
            "cyan.app.bootstrap.sync",
            "cyan.app.services",
            "cyan.app.model",
            "lodash",
            "app.cyan",
            "app.common.header",
            "app.common.footer",
            "app.index",
            "app.sync",
            "app.ui",
            "cyan.app.boxes",
            "ngMaterial",
            "cyan-ng-mixins",
            "ngMessages",
            "ngSanitize"
        ])
        .config(_config)
        .decorator("$state", PreviousStateDecorator)
        .run(_run);

    /**
     * Configures app infrastructure before the app runs.
     */
    function _config($urlRouterProvider) {
        "ngInject";

        // Redirect to the Login screen if the URL is not recognized.
        $urlRouterProvider.otherwise("/dfs");
    }

    /**
     * Configures the app to start running.
     */
    function _run($rootScope, $injector, localStorage, loggerBuilder, logLevels, cyanNativeBuilder) {
        "ngInject";

        // Set up $rootScope. Read "hostedApplication" setting used by `cyanNativeBuilder`.
        $rootScope.isHosted = !!localStorage.get("hostedApplication");

        // Modify ng-core objects. The existing dependencies between these objects means that trying to modify them
        // in the configuration phase using angular providers and decorators risks creating circular dependencies or
        // dependency order issues. Therefore, I allow angular to create the standard objects and patch them here.
        cyanNativeBuilder.patch();
        loggerBuilder
            .defaultLevel(logLevels.verbose)
            .logLevel(logLevels.debug)
            .useConsoleLogLevels(true)
            .patch();

        // Call a separate function to separate "setup" and "runtime" concerns.
        $injector.invoke(appRun);
    }

    /**
     * Set up `$rootScope` and event handlers.
     */
    function appRun(_, $injector, $rootScope, $state, $window, logger, config, cyanNative, cyanUserService, cyanConstants,
        cyanBootstrapUi,
        sessionStorage, localStorage, ui) {
        "ngInject";

        $rootScope.getErrorMessage = getErrorMessage;
        $rootScope.$on("$stateChangeError", stateChangeError);
        $rootScope.$on("$stateChangeStart", stateChangeStart);
        $rootScope.$on("$stateChangeSuccess", stateChangeSuccess);

        cyanNative.startNotificationListener();

        document.addEventListener("backbutton", angular.noop, false);

        // Expose an object to the window to help with debugging.
        $window.app = {
            $apply: _.bind($rootScope.$apply, $rootScope),
            $digest: _.bind($rootScope.$digest, $rootScope),
            $injector: $injector,
            $rootScope: $rootScope,
            $state: $state,
            config: config,
            cyanNative: cyanNative,
            cyanUserService: cyanUserService,
            ui: ui
        };

        /**
         * Attempts to extract a single error message from the given error object.
         */
        function getErrorMessage(error) {
            if (error) {
                if (_.isString(error)) {
                    return error;
                }
                if (error.error) {
                    return getErrorMessage(error.error);
                }
                if (_.isString(error.message)) {
                    return error.message;
                }
            }
            return null;
        }

        /**
         * Handle an error while transitioning between states.
         */
        function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
            ui.hideLoading();

            if (error && error.isUserCancelled) {
                logger.info('Navigation cancelled by user');

            } else if (error && error.cancelmessage) {
                cyanBootstrapUi.alert(error.cancelmessage);

            } else {
                logger.error("app", "Error changing to state [" + toState.name + "] from [" +
                    (fromState ? fromState.name : "null") + "].", error);
                event.preventDefault();
                var modal = ui.showError(toState.caption || "Error", "An error occurred while loading the view.",
                    getErrorMessage(error) || error);
                modal.closed.then(function () {
                    if (fromState && _.isNonEmptyString(fromState.name)) {
                        $state.go(fromState.name, toParams);
                    }
                });
            }

        }

        /**
         * Handle a state change.
         */
        function stateChangeStart(event, toState/*, toParams , fromState, fromParams, options*/) {
            ui.showLoading("Loading…");
            logger.info("app", "Changing state to [" + toState.name + "].");
        }

        /**
         * Handles a successful state change.
         */
        function stateChangeSuccess($state, event, toState, toParams, fromState, fromParams) {
            ui.hideLoading();
            logger.debug("app", "Changed state to [" + toState.name + "].");

            $state.previous = {
                route: fromState,
                routeParams: fromParams
            };

            // Expose the state to the window to help with debugging.
            $window.app.state = toState;
        }
    }

    function PreviousStateDecorator($delegate, $rootScope) {
        "ngInject";

        function decorated$State() {
            var $state = $delegate;
            $state.previous = undefined;
            $rootScope.$on("$stateChangeSuccess", function (ev, to, toParams, from, fromParams) {
                $state.previous = { route: from, routeParams: fromParams };
            });

            $state.goBack = function stateGoBack() {
                $state.go($state.previous.route.name, $state.previous.routerParams);
            };
            return $state;
        }

        return decorated$State();
    }


})();