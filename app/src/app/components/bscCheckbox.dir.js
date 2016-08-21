(function () {
    'use strict';

    angular
      .module('app')
    .component('bscCheckbox', {
        template: [
          '<div class="bsc-checkbox-btn btn-group">',
            '<button class="btn btn-default" type="button" style="width: 46px; height: 46px;"',
              'ng-click="$ctrl.setValue()" ng-disabled="$ctrl.isDisabled">',
              '<i class="fa fa-check" ng-if="$ctrl.isChecked"></i>',
            '</button>',
          '</div>'
        ].join('\n'),
        controller: CheckboxController,
        bindings:{
            readonly: '<'
        },
        require: {
            ngModelCtrl: 'ngModel'
        }
    });
    
    function CheckboxController() {
        var ctrl = this;

        // public
        Object.assign(ctrl, {            
            $onInit: init,
            setValue: setValue
        });
        // public computed
        Object.defineProperties(ctrl, {
            isChecked: {
                get: function getIsChecked() {
                    return ctrl.ngModelCtrl.$modelValue;
                }
            },
            isDisabled: {
                get: function(){
                    return ctrl.readonly === true;
                }
            }
        });

        function init() {
            ctrl.ngModelCtrl.$isEmpty = isEmpty;
        }

        function isEmpty() {
            var value = ctrl.ngModelCtrl.$viewValue || ctrl.ngModelCtrl.$modelValue;
           return value === true;
        }

        function setValue() {
            ctrl.ngModelCtrl.$setViewValue(!ctrl.ngModelCtrl.$modelValue);
        }
    }
})();