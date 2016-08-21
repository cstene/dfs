(function () {
    'use strict';

    angular
        .module('app')
        .component('appPhotoRow', {
            templateUrl: 'app/components/photo/photo-row.html',
            controller: PhotoRowController,
            bindings: {
                'model': '<',
                'actions': '<'
            }
        });


    function PhotoRowController() {
        'ngInject';
    }

})();