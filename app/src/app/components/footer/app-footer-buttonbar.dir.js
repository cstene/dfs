//BEGIN: footer-back-forward.dir.js

/**
 * Usage: <app-footer-buttonbar buttons="vm.footerbuttons"></app-footer-buttonbar>
 * 
 * buttons (object): 
 *  left (Button)
 *  center (Button)
 *  right (Button)
 * 
 *  Button (Object)
 *          caption (String)
 *          onClick (Function)
 *          iconCss (String)
 *          show (Bool)
 */
(function () {
    'use strict';

    angular.module('app.common.footer', ['ngMaterial'])
        .constant('footerbutton', {
            back: function (options) {
                return Object.assign({
                    caption: 'Back',
                    iconCss: 'fa fa-arrow-left'
                }, options);
            },

            camera: function(options){
                return Object.assign({
                    iconCss: 'fa fa-camera'
                }, options);
            },

            save: function (options) {
                return Object.assign({
                    caption: 'Save',
                    iconCss: 'fa fa-save'
                }, options);
            },

            add: function (options) {
                return Object.assign({
                    caption: 'Add',
                    iconCss: 'fa fa-plus'
                }, options);
            }
        })

        .component('appFooterButtonbar', {
            bindings: {
                buttons: '<'
            },
            templateUrl: 'app/components/footer/app-footer-buttonbar.html',
            controller: FooterBarController
        });

    function FooterBarController() {
        "ngInject";

    }

})();