(function(){
    'use strict';

    angular.module("cyan.app.boxes")
        .controller("cyanBoxesItemController", BoxesItemController)
        .directive("cyanBoxesItem", BoxesItem);

    BoxesItemController.$inject = ["$scope"];

    function BoxesItemController($scope){

        $scope.getLocalDate = getLocalDate;

        function getLocalDate(message){
            //todo: Need to import latest ng-core and use product date/time approach
            //return moment(message.createdDateUtc, "YYYY-MM-DDTHH:mm:ss Z").format("M/D/YY h:mm a");
            return message.createdDateUtc;
        }
    }

    BoxesItem.$inject = [];

    function BoxesItem(){
        return {
            restrict: "A",
            scope: { item: "=" },
            templateUrl: "app/components/boxes/boxes-item.html",
            controller: "cyanBoxesItemController"
        };
    }

})();