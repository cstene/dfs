(function() {
    "use strict";

    angular
        .module("app.cyan")
        .constant("logLevels", {
            off: "OFF",
            verbose: "VERBOSE",
            debug: "DEBUG",
            info: "INFO",
            warn: "WARN",
            error: "ERROR",
            critical: "CRITICAL"
        })
        .factory("loggerBuilder", loggerBuilder);

    /**
     * Adds enhancements to the `logger` service.
     * @returns {} 
     */
    function loggerBuilder($log, _, stringHelpers, logLevels, cyanNative, logger) {
        "ngInject";

        var _logLevel = logLevels.debug;
        var _defaultLevel = logLevels.verbose;
        var _useConsoleLogLevels = true;

        var builder = {};

        /**
         * Gets or sets the default logging level assigned to log entries that do not specify a level as their first 
         * argument.
         * @param {String} value One of the values from the `logLevels` constant: "OFF", "VERBOSE", "DEBUG", "INFO", 
         *                       "WARN", "ERROR", "CRITICAL".
         * @returns {String} The current value, or, if `value` is provided, this object.
         */
        builder.defaultLevel = function(value) {
            if (arguments.length === 0) {
                return _defaultLevel;
            }

            _defaultLevel = value;
            return this;
        };

        /**
         * Gets or sets the current logging level. Log entries below this level are not written to the log.
         * @param {String} value One of the values from the `logLevels` constant: "OFF", "VERBOSE", "DEBUG", "INFO", 
         *                       "WARN", "ERROR", "CRITICAL".
         * @returns {String} The current value, or, if `value` is provided, this object.
         */
        builder.logLevel = function(value) {
            if (arguments.length === 0) {
                return _logLevel;
            }

            _logLevel = value;
            return this;
        };

        /**
         * Gets or sets a value indicating whether to use the console's level-specific functions when writing messages.
         * @param {Boolean} value True to use the `debug`, `info`, `warn`, and `error` functions where applicable;
         *                        otherwise, false to always use `log`.
         * @returns {Boolean} The current value, or, if `value` is provided, this object.
         */
        builder.useConsoleLogLevels = function(value) {
            if (arguments.length === 0) {
                return _useConsoleLogLevels;
            }

            _useConsoleLogLevels = value;
            return this;
        };

        /**
         * Applies changes to the `logger` service.
         */
        builder.patch = function() {
            // Only need to log to cyanNative if it defines a `log` function.
            cyanNative = cyanNative.log ? cyanNative : null;
            var sh = stringHelpers;
            var levelValues = {
                OFF: -1,
                VERBOSE: 1,
                DEBUG: 2,
                INFO: 3,
                WARN: 4,
                ERROR: 5,
                CRITICAL: 6
            };
            var enabledLogValue = levelValues[_logLevel] || levelValues.DEBUG;
            var defaultLogValue = levelValues[_defaultLevel];
            if (!defaultLogValue) {
                defaultLogValue = levelValues.VERBOSE;
                _defaultLevel = "VERBOSE";
            }
            var defaultEnabled = defaultLogValue >= enabledLogValue;

            /**
             * Logs a message to the browser (and, if applicable, engine) log. If the first argument is one of the
             * `logLevels` values, the message is logged at that level; otherwise, `defaultLevel` is applied. Any
             * messages with a level lower than `logLevel` are not logged.
             */
            logger.log = function( /* arguments */) {
                // Determine the log level, and whether to log the entry.
                if (arguments.length === 0) {
                    return;
                }
                var level = levelValues[arguments[0]];
                if ((!level && !defaultEnabled) || (level && level < enabledLogValue)) {
                    return;
                }
                var args = Array.prototype.slice.apply(arguments);
                if (!level) {
                    args.unshift(_defaultLevel);
                }
                args[0] = sh.padRight(args[0], 5);

                // Add the current time to the log entry.
                var now = new Date();
                var nowText = sh.padLeft(now.getHours(), 2, "0") + ":" + sh.padLeft(now.getMinutes(), 2, "0") + ":" +
                    sh.padLeft(now.getSeconds(), 2, "0") + "." + sh.padLeft(now.getMilliseconds(), 3, "00");
                args.unshift(nowText);

                // Log the message in the browser.
                if (_useConsoleLogLevels) {
                    // In Chrome and IE, the extra formatting for debug and info events seems distracting, so just use
                    // warn and error.
                    if (level === levelValues.WARN) {
                        $log.warn.apply($log, args);
                    } else if (level >= levelValues.ERROR) {
                        $log.error.apply($log, args);
                    } else {
                        $log.log.apply($log, args);
                    }
                } else {
                    $log.log.apply($log, args);
                }

                // Log the message in the engine's log file. Stringify any object arguments, and log a single string.
                if (cyanNative) {
                    for (var i = 0; i < args.length; i++) {
                        if (_.isObject(args[i])) {
                            args[i] = JSON.stringify(args[i]);
                        }
                    }
                    cyanNative.cordovaExec({
                        serviceName: "BDSLoggingPlugin",
                        actionName: "log",
                        actionArgs: [{
                            message: args.join(" ")
                        }],
                        disableCyanLog: true
                    });
                }
            };

            logger.verbose = _.partial(logger.log, logLevels.verbose);
            logger.debug = _.partial(logger.log, logLevels.debug);
            logger.info = _.partial(logger.log, logLevels.info);
            logger.warn = _.partial(logger.log, logLevels.warn);
            logger.error = _.partial(logger.log, logLevels.error);
            logger.critical = _.partial(logger.log, logLevels.critical);
        };

        return builder;
    }
})();
