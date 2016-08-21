(function(){
    'use strict';

    angular.module("cyan.app.boxes")
        .controller("outSentCtrl", OutSentCtrl)
        .directive("outSent", OutSent);

    //OutSentCtrl.$inject = ['$scope', '$location'];

    function OutSentCtrl() {
        "ngInject";
    }

    function OutSent() {
        return {
            restrict: "A",
            templateUrl: "app/components/boxes/out-sent.dir.html",
            controller: "outSentCtrl",
            scope: { messages: "=" }
        };
    }

})();