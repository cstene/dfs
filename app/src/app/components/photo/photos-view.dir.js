(function (undefined) {
	'use strict';

	angular
        .module('app')

        .component('appPhotosView', {
        	templateUrl: 'app/components/photo/photos-view.html',
        	bindings: {
        	    photos: '<',
                actions: '<'
        	},
        	controller: AppPhotosViewController
        });

	function AppPhotosViewController() {
	    'ngInject';
	}

})();