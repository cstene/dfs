(function (undefined) {
    'use strict';

    angular
        .module('app')
        .component('appSealInput', {
            templateUrl: 'app/components/seals/seal-input.html',
            controller: SealInputController,            
            bindings: {
                model: '=',
                onClear: '&',
                onSelect: '&',
                onChange: '&',
                onBlur: '&'
            }
        });

    function SealInputController($log, $scope) {
        'ngInject';

        var vm = this;

        Object.assign(vm, {
            trigger: trigger
        });

        function trigger(event, name, data) {
            $scope.$emit(name, data, vm, event);
        }
    }    

})();