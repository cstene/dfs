(function (undefined) {
    'use strict';

    angular
        .module('app')
        .config(ConfigureYesNoButtons);

    function ConfigureYesNoButtons(yesNoBtnOptions) {
        'ngInject';

        Object.assign(yesNoBtnOptions, {
            defaults: {
                yesValue: 1,
                noValue: 0
            }
        });

    }

})();