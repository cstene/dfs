(function () {
    "use strict";

    angular
        .module("app")
        .service("config", ConfigService);

    /**
     * Provides access to the application's configuration settings.
     * @constructor
     */
    function ConfigService(_, $q, $http, $rootScope, localStorage, cyanNative, logger, cyanWebApiService, $window, APP_CONST) {
        "ngInject";

        var props;
        var initialized = false;
        var self = this;
        $rootScope.$on("sync:success", syncSuccess);



        /**
         * Returns the 'props' field from the given node; otherwise, undefined.
         */
        function getProps(obj) {
            if (_.isNullOrUndefined(obj)) {
                return null;
            }

            if (_.isObject(obj.props)) {
                return obj.props;
            }

            return undefined;
        }

        /**
         * Refreshes the config service when the config node is synced.
         */
        function syncSuccess(event, changed) {
            if (changed["BulkConfig"]) {
                logger.info("config", "Configuration node sync detected.");
                self.refresh();
            }
        }



        /**
         * Gets the value of the specified setting.
         * @param {string} name - The name of the setting to retrieve.
         * @param dflt - Object returned if the specified setting is not found.
         * @returns {string} The value of the setting, or the specified default value.
         *
         * Settings sources are considered in order: local storage, config node, "config.json". The 
         * first value found is returned. To ensure that the settings nodes have been loaded, `get` should not be 
         * used until `initialize` has been called and its promise has been completed.
         */
        this.get = function (name, dflt) {
            if (!initialized) {
                return undefined;
            }

            var local = localStorage.getObject("config");
            if (local && !_.isUndefined(local[name])) {
                return local[name];
            }

            return !_.isUndefined(props[name]) ? props[name] : dflt;
        };

        /**
         * Loads the nodes that contain the application's settings.
         * @returns A promise that resolves when the application's settings have been loaded.
         */
        this.refresh = function () {
            var loadDefaults = $q.defer();
            var loadNodes = $q.defer();

            logger.debug("config", "Refreshing configuration...");
            if (cyanNative.nativeMode() === "desktop" || cyanNative.nativeMode() === "hosted") {
                $http.get("data/config.json")
                    .then(function (response) {
                        loadDefaults.resolve(getProps(response.data));
                    })
                    .catch(function (err) {
                        logger.warn("config", "Unable to load configuration from 'data/config.json'.", err);
                        loadDefaults.resolve();
                    });
            } else {
                loadDefaults.resolve();
            }
            cyanNative.getNode("BulkConfig", "TenantConfig")
                .then(function (node) {
                    loadNodes.resolve(getProps(node));
                })
                .catch(function (err) {
                    logger.warn("config", "Unable to load the tenant configuration node.", err);
                    loadNodes.resolve();
                });

            return $q.all([loadDefaults.promise, loadNodes.promise])
                .then(function (results) {
                    var defProps = results[0];
                    var nodeProps = results[1];
                    logger.info("config", "Loaded configuration from local nodes.");
                    props = _.extend({}, defProps, nodeProps);

                    return (initialized = true);
                });
        };

        //Return null if there is no internet connection.
        this.getUserGroupIdForSync = function () {
            var promise = $q.defer();
            logger.info("config", "Get list of user groups.");

            cyanNative.isOnline()
                .then(function (result) {
                    if (result.isOnline && cyanNative.nativeMode() !== "desktop") {
                        return cyanNative.getEnginePreferences();                        
                    } else {
                        promise.resolve(null);
                        return null;
                    }                    
                })
                .then(function (data) {
                    if (data === null) {
                        return null;
                    }

                    var options = {
                        url: data.BASE_URI + '/api/userGroups',
                        responseType: 'jsonArray',
                        headers: {
                            'X-Api-Version': "1",
                            'X-Cyan-TenantAccessKey': data.TENANT_ACCESS_KEY,
                            'Authorization': 'Basic ' + $window.btoa(data.USERNAME + ':' + data.PASSWORD)
                        }
                    };

                    return cyanNative.cordovaExec({
                        serviceName: 'BDSHttpPlugin',
                        actionName: 'http',
                        actionArgs: [options]
                    });
                })
                .then(function (result) {
                    if (result === null) {
                        return null;
                    }

                    if (!result || !result.body) {
                        promise.reject('Failed to retrieve user groups from API. Error:' + result.errorBody);
                    }

                    var userGroup = _.find(result.body, function (ug) {
                        return ug.lookupKey.toUpperCase() === localStorage.get(APP_CONST.LOCAL_STORAGE.USER_GROUP_KEY);
                    });

                    if (!userGroup) {
                        promise.reject('Failed to find user group from list.');
                    }

                    promise.resolve(userGroup.userGroupId);
                })
                .catch(function (error) {
                    promise.reject(error);
                });


            return promise.promise;
        };

        /**
         * Gets the latest tenant config node for the current tenant and saves it locally.
         */
        this.refreshLatestConfig = function () {
            logger.info("config", "Get latest config using current engine settings...");
            if (cyanNative.nativeMode() === "desktop") {
                return this.refresh();
            }

            var self = this;
            return cyanWebApiService.getNodeByTypeAndId("BulkConfig", "TenantConfig")
                .then(function (node) {
                    if (node) {
                        return cyanNative
                            .saveNode({
                                nodeId: node.id,
                                nodeType: node.type,
                                data: JSON.stringify(node)
                            })
                            .then(function () {
                                logger.info("config", "Latest configuration node for tenant [" +
                                    $rootScope.tenantAccessKey + "] has been downloaded.");
                                return self.refresh();
                            });
                    }

                    logger.warn("config", "The configuration node for tenant [" + $rootScope.tenantAccessKey +
                        "] was not found.");
                    return false;
                })
                .catch(function (e) {
                    logger.warn("config", "Failed to retrieve node for tenant [" + $rootScope.tenantAccessKey +
                        "]. Error: " + e);

                    return false;
                });
        };
    }
})();