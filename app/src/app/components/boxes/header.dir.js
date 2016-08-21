(function(){
    'use strict';

    angular.module("cyan.app.boxes")
        .controller("cyanBoxesHeaderController", BoxesHeaderDirectiveController)
        .directive("cyanBoxesHeader", BoxesHeaderDirective);
    
    function BoxesHeaderDirectiveController($scope, $state, $stateParams) {
        "ngInject";
        
        $scope.goToInbox = goToInbox;
        $scope.goToOut = goToOut;
        $scope.goToSent = goToSent;

        activate();

        function activate(){
            $scope.box = $stateParams.box;
            $scope.inboxName = $scope.inboxName || "Home";
            $scope.inboxState = $scope.inboxState || "inbox";

            if (!$scope.marginBottom) {
                $scope.marginBottom = "auto";
            }
        }

        function goToInbox() {
            showBox("inbox");
        }

        function goToOut() {
            showBox("outbox");
        }

        function goToSent() {
            showBox("sentbox");
        }

        function showBox(box, state){
            state = state || "boxes";
            if ($scope.box !== box){
                $state.go(state, {box: box});
            }
        }
    }

    function BoxesHeaderDirective() {
        return {
            restrict: "A",
            scope: {
                marginBottom: "@",
                inboxName: "@",
                inboxState: "@"
            },
            templateUrl: "app/components/boxes/header.dir.html",
            controller: "cyanBoxesHeaderController"
        };
    }

})();