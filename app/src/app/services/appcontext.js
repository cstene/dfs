(function () {
    'use strict';

    angular.module('app')
        .factory('AppContext', AppContextFactory);

    function AppContextFactory(APP_CONST, localStorage) {
        'ngInject';

        return {
            getCurrentUser: getCurrentUser,
            getCurrentRailyard: getCurrentRailyard,
            getCurrentUserType: getCurrentUserType,
            getCurrentTerminal: getCurrentTerminal
        };

        function getCurrentUser() {
            return localStorage.get(APP_CONST.LOCAL_STORAGE.USER_NAME);
        }

        function getCurrentUserType() {
            return localStorage.get(APP_CONST.LOCAL_STORAGE.USER_TYPE);
        }

        function getCurrentRailyard() {
            return localStorage.get('login-railyard');
        }

        function getCurrentTerminal() {
            return localStorage.get('login-terminal');
        }
    }



})();