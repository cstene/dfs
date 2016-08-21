(function(){
    'use strict';

    angular.module('cyan.app.boxes')
        .config(_config)
        .controller("cyanBoxesController", BoxesController);

    function _config($stateProvider) {
        "ngInject";

        $stateProvider.state("boxes", {
            cache: false,
            url: "/boxes/:box",
            templateUrl: "app/components/boxes/home.html",
            controller: "cyanBoxesController",            
        });
    }

    function BoxesController(_, $scope, $stateParams, $state, cyanNative, localStorage, logger, APP_CONST) {
        "ngInject";

        var
            controller = this,
            INSP_STATUS = APP_CONST.INSP_STATUS;

        $scope.collection = [];
        $scope.logout = logout;
        $scope.box = $stateParams.box;
        $scope.inboundCount = '-';
        $scope.outboundCount = '-';
        $scope.transloadCount = '-';
        $scope.goToInbound = goToInbound;

        activate();

        function activate(){
            controller.box = $stateParams.box;            

            if (controller.box === "inbox") {
                updateInboxCount();
            }
            else {
                loadOutSetBox();
            }
        }

        function updateInboxCount() {
            cyanNative.getChildNodes('BulkRailyard', localStorage.get('login-railyard'), 'BulkInbound')
                .then(function (results) {
                    $scope.inboundCount = getInspectionResultCount(results);
                    //This will return as soon as bulkmatic puts the railyard into place.
                    return cyanNative.getChildNodes('BulkRailyard', localStorage.get('login-railyard'), 'BulkTransload');
                })
                .then(function (results) {                    
                    $scope.transloadCount = getTransloadResultCount(results);
                    return cyanNative.getChildNodes('BulkRailyard', localStorage.get('login-railyard'), 'BulkOutbound');                                        
                })
                .then(function (results) {
                    $scope.outboundCount = getInspectionResultCount(results);
                })
                .catch(function (error) {
                    logger.error("home", "Failed to retrieve transaction counts.", error);
                    $scope.inboundCount = '-';
                    $scope.outboundCount = '-';
                    $scope.transloadCount = '-';
                });
        }

        function getTransloadResultCount(resultSet){
            return _.filter(resultSet, function (n) {
                return !n.props.cyanComplete;
            }).length;
        }

        function getInspectionResultCount(resultSet) {
            return _.filter(resultSet, function (n) {
                return n.props.inspStatus !== INSP_STATUS.C;
            }).length;
        }

        function loadOutSetBox() {
            controller.statuses = [];
            if (controller.box === "outbox") {
                controller.statuses.push('Created', 'Submitted');
            }
            if (controller.box === "sentbox") {
                controller.statuses.push('Accepted', 'Error');
            }

            cyanNative.getLatestMessagesByStatuses(controller.statuses, 25)
                .then(function (results) {
                    $scope.collection = results;
                })
                .catch(function () {

                })
                .finally(function () {

                });
        }

        function goToInbound() {
            $state.go("inbound.list");
        }

        function logout(){
            $state.go("login");
        }
    }
})();