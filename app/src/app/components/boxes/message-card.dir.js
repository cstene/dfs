(function () {
    'use strict';

    angular.module("cyan.app.boxes")
        .controller("messageCardController", messageCardController)
        .directive("messageCard", MessageCardDirective);

        function messageCardController($scope, cyanDateTimeService) {
        "ngInject";

        if ($scope.message.createdDateUtc) {
            //Hack to get around the fact that engine utc dates don't have zulu at the end so the
            //utc date gets displayed instead of the local date.
            var len = $scope.message.createdDateUtc.length;
            var last = $scope.message.createdDateUtc.charAt(len - 1);
            if (last !== "Z") {
                $scope.message.createdDateUtc = $scope.message.createdDateUtc + "Z";
            }
            
            $scope.date = cyanDateTimeService.getLocalDate($scope.message.createdDateUtc);
            $scope.time = cyanDateTimeService.getLocalTime($scope.message.createdDateUtc);
            
        }
    }

    function MessageCardDirective() {
        return {
            restrict: "A",
            templateUrl: "app/components/boxes/message-card.dir.html",
            scope: { message: "=" },
            controller: "messageCardController"
        };
    }
    
})();