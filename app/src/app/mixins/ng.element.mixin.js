(function () {
    'use strict';

    angular

        .module('cyan-ng-mixins')

        .run(mixInController);

    function mixInController() {
        /**
         * Retrieve child controllers for this element.
         * 
         * NOTE: Calling methods which mutate state on a child controller
         * will likely require a $scope.$apply to allow elements to re-render.
         * 
         * @param elementName(string) - html element name
         * @param controllerName(string) - optional: the controller name to retrieve. Default is to retrieve the controller bound to element
         * 
         * @example - $element.getChildControllers('my-custom-element')
         */
        angular.element.prototype.getChildControllers = function getChildControllers(elementName, controllerName) {
            controllerName = controllerName || angular.element.camelCase(elementName);

            return this.find(elementName).map(function (idx, el) {
                return angular.element(el).controller(controllerName);
            }).get();
        };

    }

})();