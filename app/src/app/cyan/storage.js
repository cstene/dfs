(function() {
    "use strict";

    angular
        .module("app.cyan")
        .provider("sessionStorage", SessionStorageProvider)
        .provider("localStorage", LocalStorageProvider);

    function LocalStorageProvider() {
        var ns = "";
        var nsName = null;

        this.$get = ["$window", "_", function($window, _) {
            return new Storage(_, $window.localStorage, ns);
        }];

        /**
         * Gets or sets a namespace used to qualify this application's keys in session storage.
         * @param {String} value If provided, the namespace value to prefix any keys with.
         * @returns {String} The current value, or, if `value` is provided, this object.
         */
        this.namespace = function(value) {
            if (arguments.length === 0) {
                return nsName;
            }

            nsName = String(value);
            ns = (typeof(nsName) === "string" && nsName.length > 0) ? nsName + ":" : "";
            return this;
        };
    }

    function SessionStorageProvider() {
        var ns = "";
        var nsName = null;

        this.$get = ["$window", "_", function($window, _) {
            return new Storage(_, $window.sessionStorage, ns);
        }];

        /**
         * Gets or sets a namespace used to qualify this application's keys in session storage.
         * @param {String} value If provided, the namespace value to prefix any keys with.
         * @returns {String} The current value, or, if `value` is provided, this object.
         */
        this.namespace = function(value) {
            if (arguments.length === 0) {
                return nsName;
            }

            nsName = String(value);
            ns = (typeof (nsName) === "string" && nsName.length > 0) ? nsName + ":" : "";
            return this;
        };
    }

    /**
     * Creates a service object that accessess the browser's local or session storage.
     * @constructor
     */
    function Storage(_, store, ns) {
        function nsKey(key) {
            return ns.length === 0 || _.startsWith(ns, key) ? key : ns + key;
        }

        this.clear = function() {
            if (ns === "") {
                this.clearAll();
                return;
            }

            var keys = this.keys();
            for (var i = 0; i < keys.length; i++) {
                store.removeItem(keys[i]);
            }
        };

        this.clearAll = function() {
            store.clear();
        };

        this.keys = function() {
            var keys = [];
            for (var i = 0; i < store.length; i++) {
                var k = store.key(i);
                if (ns === "" || k.substring(0, ns.length) === ns) {
                    keys.push(k);
                }
            }
            return keys;
        };

        this.get = function(key, defaultValue) {
            var val = store[nsKey(key)];
            return _.isUndefined(val) ? defaultValue : val;
        };

        this.getObject = function(key, defaultValue) {
            var val = this.get(key);
            if (!_.isNonEmptyString(val)) {
                return defaultValue;
            }

            try {
                var obj = JSON.parse(val);
                return obj;
            } catch (e) {
                return defaultValue;
            }
        };

        this.remove = function(key) {
            store.removeItem(nsKey(key));
        };

        this.set = function(key, value) {
            store[nsKey(key)] = value;
        };

        this.setObject = function(key, value) {
            store[nsKey(key)] = JSON.stringify(value);
        };
    }
})();