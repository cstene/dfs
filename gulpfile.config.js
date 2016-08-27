require('es6-shim');
var
    path = require('path');

var cfg = {
    srcroot: './app/src',
    distroot: './app/dist',
    cssroot: './app/dist/css',
    vendorroot: 'app/src/vendor',
    isLocalDev: !process.env.NODE_ENV || process.env.NODE_ENV === 'LOCAL-DEV'
};

Object.assign(cfg, {
    distfiles: [
        'app/dist/**/*'
    ],

    index: 'app/src/index.html',

    jslibs: [
        //
        // 3rd party
        'es6-shim/es6-shim.js',
        'string/dist/string.js',
        'jquery/dist/jquery.js',
        'lodash/dist/lodash.js',
        'angular/angular.js',
        'angular-sanitize/angular-sanitize.js',
        'angular-messages/angular-messages.js',
        'bootstrap/dist/js/bootstrap.js',
        'moment/moment.js',
        'angular-animate/angular-animate.js',
        'angular-ui-router/release/angular-ui-router.js',
        'angular-bootstrap/ui-bootstrap-tpls.js',
        'angular-moment/angular-moment.js',
        'angular-block-ui/dist/angular-block-ui.js',
        'angular-aria/angular-aria.js',
        'angular-material/angular-material.js',
        'validate/validate.js',
        'angular-ui-grid/ui-grid.js',
        //
        // cyan
        'cyan-client-ng-core/lib/rncryptor.js',
        'cyan-client-ng-core/lib/sjcl.js',
        cfg.isLocalDev
            ? 'cyan-client-ng-core/dist/cyan-desktop.js'
            : 'cyan-client-ng-core/dist/cyan-native-debug.js',
        'cyan-client-ng-bootstrap/dist/cyan-ng-bootstrap-debug.js',
        'angular-xml2json/angular-xml2json.js'
    ].map(function (file) {
        return path.join(cfg.vendorroot, file);
    }),

    appfiles: [
        'app/src/app/app.js',
        'app/src/app/**/_mod.js',
        'app/src/app/**/*.js'
    ],

    templates: [
        'app/src/app/**/*.html',
        '!app/src/app/index.html',
    ],

    lessfiles: [
        'app/src/app/**/*.less',
        '!app/src/vendor'
    ],

    copyfiles: [
        // MISC
        {
            src: [
                'app/src/app/index.html',
                'app/src/app/package.json'
            ],
            dest: 'app/dist'
        },
        // FONTS
        {
            src: [
                'app/src/vendor/bootstrap/fonts/glyphicons*.*',
                'app/src/vendor/font-awesome/fonts/*.*'
            ],
            dest: 'app/dist/fonts'
        },
        // IMAGES
        {
            src: [
                'app/src/vendor/cyan-client-ng-bootstrap/img/**/*',
                'app/src/app/img/**/*.*'
            ],
            dest: 'app/dist/img'
        },
        // CSS
        {
            src:[
                'app/src/vendor/angular-ui-grid/ui-grid.eot',
                'app/src/vendor/angular-ui-grid/ui-grid.svg',
                'app/src/vendor/angular-ui-grid/ui-grid.ttf',
                'app/src/vendor/angular-ui-grid/ui-grid.woff'
            ],
            dest: 'app/dist/css'
        }
    ]
});

if (cfg.isLocalDev) {
    cfg.copyfiles.push({
        src: 'app/src/data/**/*',
        dest: 'app/dist/data'
    });
}

module.exports = cfg;