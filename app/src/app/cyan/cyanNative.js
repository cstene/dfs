(function() {
    "use strict";

    angular
        .module("app.cyan")
        .factory("cyanNativeBuilder", cyanNativeBuilder);

    /**
     * Overrides the data access features in the "desktop" `cyanNative` to access the server directly, turning it into
     * a hosted-mode `cyanNative`.
     */
    function cyanNativeBuilder($rootScope, $q, $http, $timeout, $window, _, sessionStorage, cyanNative,
        guard, localStorage, logger, cyanWebApiService) {
        "ngInject";

        var builder = {};

        /**
         * Applies changes to the `logger` service.
         */
        builder.patch = function() {
            if (!($rootScope.isHosted && cyanNative.nativeMode() === "desktop")) {
                return;
            }

            var base = {
                reinitSync: cyanNative.reinitSync
            };

            /**
             * Removes any nodes from session storage, then calls the given function.
             */
            function _clearNodeStorage() {
                _.each(sessionStorage.keys(), function(k) {
                    if (_.startsWith(k, "node:")) {
                        sessionStorage.remove(k);
                        logger.debug("hostedNative", "Cleared [" + k + "] from session storage.");
                    }
                });
            }

            /**
             * Gets all available nodes with the specified "type", and/or parent, from session storage, or the server. 
             */
            function _getNodesImpl(type, parentType, parentId) {
                var deferred = $q.defer();
                var childMode = !(_.isUndefined(parentType) && _.isUndefined(parentId));
                if (childMode) {
                    guard.isNonEmptyString(parentType, "parentType", "cyanNative.getNodes");
                    guard.isNonEmptyString(parentId, "parentId", "cyanNative.getNodes");
                } else {
                    guard.isNonEmptyString(type, "type", "cyanNative.getNodes");
                }

                // Get nodes from the server first.
                (childMode ?
                        cyanWebApiService.getRoutedChildNodes(parentType, parentId, type) :
                        cyanWebApiService.getRoutedNodesByType(type))
                    .then(function(nodes) {
                        var localNodes = {};
                        if (!_.isArray(nodes)) {
                            nodes = [];
                        }

                        // Get local nodes of the specified type, or specified type and parent.
                        _.each(sessionStorage.keys(), function(k) {
                            if (_.startsWith(k, "node:" + type + ":")) {
                                var node = sessionStorage.getObject(k);
                                if (node && childMode) {
                                    if (node.parentType === parentType && node.parentId === parentId) {
                                        localNodes[k] = node;
                                    }
                                } else if (node) {
                                    localNodes[k] = node;
                                }
                            }
                        });

                        // Replace downloaded nodes with any local matches, or remove locally deleted nodes.
                        for (var i = 0; i < nodes.length; i++) {
                            var key = "node:" + type + ":" + nodes[i].id;
                            var local = localNodes[key];
                            if (local) {
                                if (local.deleted) {
                                    logger.debug("hostedNative", "Node [" + type + ":" + nodes[i].id + "] was deleted locally.");
                                    nodes.splice(i, 1);
                                    i--;
                                } else {
                                    logger.debug("hostedNative", "Loaded node [" + type + ":" + nodes[i].id + "] from session storage.");
                                    nodes[i] = local;
                                }
                                delete localNodes[key];
                            }
                        }

                        // Add any additional local nodes matching the criteria.
                        _.each(_.keys(localNodes), function(k) {
                            if (!localNodes[k].deleted) {
                                logger.debug("hostedNative", "Loaded node [" + type + ":" + localNodes[k].id + "] from session storage.");
                                nodes.push(localNodes[k]);
                            }
                        });

                        deferred.resolve(nodes);
                    });

                return deferred.promise;
            }


            /**
             * Deletes the specified node from session storage.
             * @param {String} type The "type" of the node to delete.
             * @param {String} id The "id" of the node to delete.
             * @returns A promise that resolves when the node has been deleted.
             */
            cyanNative.deleteNode = function deleteNode(type, id) {
                var deferred = $q.defer();
                $timeout(function() {
                    logger.debug("hostedNative", "Deleting node [" + type + ":" + id + "] from session storage...");
                    sessionStorage.setObject("node:" + type + ":" + id, { deleted: true });
                    deferred.resolve();
                }, 500, false);

                return deferred.promise;
            };

            /**
             * Gets all child nodes of the specified parent from session storage, or the server. 
             * @param {String} parentType The "parentType" of the nodes to retrieve.
             * @param {String} parentId The "parentId" of the nodes to retrieve.
             * @param {String} childType The "childType" of the nodes to retrieve.
             * @returns A promise that resolves to an array of node objects.
             */
            cyanNative.getChildNodes = function getChildNodes(parentType, parentId, childType) {
                return cyanNative.getNodes(childType, parentType, parentId);
            };

            /**
             * Gets information about the device and engine.
             * @returns A promise that resolves to an object containing:
             *          - applicationId: The ID of the current application.
             *          - deviceId: A GUID that uniquely identifies the device.
             *          - deviceName: A string that identifies the device.
             *          - version: The version of the engine.
             */
            cyanNative.getDeviceInfo = function getDeviceInfo() {
                var deferred = $q.defer();
                $http.get("data/device-info.json", { cache: true })
                    .then(function(response) {
                        deferred.resolve(response.data);
                    })
                    .catch(function() {
                        deferred.resolve();
                    });                

                return deferred.promise;
            };

            /**
             * Gets the current Cyan engine settings.
             * @returns A promise that resolves to an object representing the engine settings.
             */
            cyanNative.getEnginePreferences = function getEnginePreferences() {
                var deferred = $q.defer();
                $http.get("data/engine-preferences.json", { cache: true })
                    .then(function(response) {
                        deferred.resolve(response.data);
                    })
                    .catch(function() {
                        deferred.resolve();
                    });

                return deferred.promise
                    .then(function(prefs) {
                        prefs = prefs || {};
                        var auth = localStorage.get("webApiAuthorization");
                        var userName, password;
                        if (auth) {
                            var rawAuth = $window.atob(auth.substring(6));
                            userName = rawAuth.substring(0, rawAuth.indexOf(":"));
                            password = rawAuth.substring(userName.length + 1);
                        }
                        var obj = {
                            BASE_URI: localStorage.get("webApiBaseUri") || prefs.BASE_URI || "",
                            USERNAME: userName || prefs.USERNAME || "",
                            PASSWORD: password || prefs.PASSWORD || "",
                            TENANT_ACCESS_KEY: localStorage.get("tenantAccessKey") || prefs.TENANT_ACCESS_KEY || ""
                        };
                        return obj;
                    });
            };

            /**
             * Gets the specified node from session storage, or from the server. If the node cannot be found, or has been 
             * deleted locally, an error is thrown, mimicking the error thrown by the "cordova" `cyanNative`.
             * @param {String} type The "type" of the node to retrieve.
             * @param {String} id The "id" of the node to retrieve.
             * @returns A promise that resolves to a node object, or to an error if the node could not be found.
             */
            cyanNative.getNode = function getNode(type, id) {
                guard.isNonEmptyString(type, "type", "cyanNative.getNode");
                guard.isNonEmptyString(id, "id", "cyanNative.getNode");

                var deferred = $q.defer();
                var node = sessionStorage.getObject("node:" + type + ":" + id);
                if (node && node.deleted) {
                    logger.debug("hostedNative", "Node [" + type + ":" + id + "] was deleted locally.");
                    deferred.reject(guard.makeError("NotFoundError", "Node not found"));
                } else if (node) {
                    logger.debug("hostedNative", "Loaded node [" + type + ":" + id + "] from session storage.");
                    deferred.resolve(node);
                } else {
                    cyanWebApiService.getRoutedNodeByTypeAndId(type, id)
                        .then(function(webNode) {
                            if (webNode) {
                                logger.debug("hostedNative", "Loaded node [" + type + ":" + id + "] from the server.");
                                deferred.resolve(webNode);
                            } else {
                                logger.debug("hostedNative", "Node [" + type + ":" + id + "] not found.");
                                deferred.reject(guard.makeError("NotFoundError", "Node not found"));
                            }
                        })
                        .catch(function(error) {
                            deferred.reject(error);
                        });
                }

                return deferred.promise;
            };

            /**
             * Gets all nodes with the specified "type" from session storage, or the server. 
             * @param {String} type The "type" of the nodes to retrieve.
             * @returns A promise that resolves to an array of node objects.
             */
            cyanNative.getNodes = function getNodes(type) {
                return _getNodesImpl(type);
            };

            /*
             * Authenticates the user against the server.
             */
            cyanNative.login = function login(data) {
                var deferred = $q.defer();
                var message = {
                    body: JSON.stringify(data),
                    senderNote: "Authentication message"
                };

                cyanWebApiService.postLoginMessage(message)
                    .then(function(response) {
                        var user = JSON.parse(response.body);
                        if (user) {
                            if (_.isNonEmptyString(user.userName)) {
                                cyanWebApiService.setSetting("applicationUserName", user.userName);
                            }
                            if (_.isNotEmptyString(user.userId)) {
                                cyanWebApiService.setSetting("applicationUserId", user.userId);
                            }
                            if (_.isNotEmptyString(user.userGroupId)) {
                                cyanWebApiService.setSetting("applicationUserGroupId", user.userGroupId);
                            }
                        }
                        deferred.resolve(user);
                    })
                    .catch(function(error) {
                        deferred.reject("Failed to authenticate user: " + error);
                    });
                return deferred.promise;
            };

            /**
             * Indicates which Cyan native object this is.
             * @returns One of the values from `cyanConstants.nativeMode`.
             */
            cyanNative.nativeMode = function nativeMode() {
                return "hosted";
            };

            /**
             * Clears the nodes from the database and syncs the latest data from the server.
             * @returns A promise that resolves when synchronization has started. 
             */
            cyanNative.reinitSync = function reinitSync() {
                _clearNodeStorage();
                return base.reinitSync();
            };

            /**
             * Saves the given node to session storage.
             */
            cyanNative.saveNode = function saveNode(options) {
                guard.isNonEmptyString(options.nodeId, "options.nodeId", "cyanNative.saveNode");
                guard.isNonEmptyString(options.nodeType, "options.nodeType", "cyanNative.saveNode");
                guard.isNonEmptyString(options.data, "options.data", "cyanNative.saveNode");

                var saving = $q.defer();
                $timeout(function() {
                    logger.debug("hostedNative", "Saving node [" + options.nodeType + ":" + options.nodeId +
                        "] to session storage...");
                    sessionStorage.set("node:" + options.nodeType + ":" + options.nodeId, options.data);
                    saving.resolve(options);
                }, 500, false);

                return saving.promise;
            };
        };

        return builder;
    }
})();