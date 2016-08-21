/// <binding Clean='serve' />
var
    gulp = require('gulp-help')(require('gulp')),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require("del"),
    fs = require("fs"),
    connect = require('gulp-connect'),
    jshint = require("gulp-jshint"),
    watch = require('gulp-watch'),
    templateCache = require('gulp-angular-templatecache'),
    less = require('gulp-less'),
    git = require("gulp-git"),
    ngAnnotate = require('gulp-ng-annotate'),
    cfg = require('./gulpfile.config.js'),
    zip = require("gulp-zip"),
    runSequence = require("run-sequence"),
    q = require("q"),
    merge = require("merge-stream"),

    path = require('path'),
    minimist = require("minimist"),
    options = minimist(process.argv, {
        string: ["version"],
        default: {
            major: 1
        }
    })
;

gulp.task('default', ['build']);


//gulp.task('serve', 'Use this task for development workflow', ['cleanbuild','webserver-dev', 'watch']);
//});
gulp.task('serve', 'Use this task for development workflow', function(done){
    runSequence(
        'cleanbuild',
        'webserver-dev',
        'watch',
        done
    );
});

gulp.task('cleanbuild', function (done) {
    runSequence('clean', 'build', done);
});

gulp.task('build', 'Build the HTML5 client', [
    'build-info',
    'copy',
    'less',
    'lib-js',
    'app-js',
    'templates'
]);


/**
 * Selective choose and concat 
 * library files
 */
gulp.task('lib-js', function () {
    return gulp
       .src(cfg.jslibs)
       .pipe(sourcemaps.init())
           .pipe(concat('lib.js'))
       .pipe(sourcemaps.write('./'))
       .pipe(gulp.dest(cfg.distroot))
});


/**
 * Build Angular 1 js client
 */
gulp.task('app-js', ['validate-code'], function () {
    return gulp.src(cfg.appfiles)
       .pipe(sourcemaps.init())
           .pipe(ngAnnotate())
           .pipe(concat('app.js'))
       .pipe(sourcemaps.write('./'))
       .pipe(gulp.dest(cfg.distroot));
});

gulp.task('copy', 'copy misc assets from src to dist', function (done) {
    var copystreams = cfg.copyfiles.map(function (f) {
        console.info('Copy FROM: ', f.src, ' TO: ', f.dest);

        return gulp.src(f.src)
            .pipe(gulp.dest(f.dest));

    });
    return merge(copystreams);
});

/**
 * Precompile ng templates
 */
gulp.task('templates', function () {
    return gulp.src(cfg.templates)
           .pipe(templateCache({
               module: 'app',
               root: 'app'
           }))
           .pipe(gulp.dest(cfg.distroot));
});

/**
 * Compile less to css
 */
gulp.task('less', function () {
    gulp.src(cfg.lessfiles)
       .pipe(sourcemaps.init())
           .pipe(less({
               rootpath: 'app'
           }))
           .pipe(concat('style.css'))
       .pipe(sourcemaps.write('./'))
       .pipe(gulp.dest(cfg.cssroot));
});

/**
 * web server for development
 */
gulp.task('webserver-dev', function () {
    return connect.server({
        root: 'app/dist',
        livereload: true,
        debug: false
    });
});

/**
 * All watches go here
 */
gulp.task('watch', function () {
    gulp.watch(cfg.appfiles, ['app-js']);
    gulp.watch(cfg.templates, ['templates']);
    gulp.watch(cfg.lessfiles, ['less']);
    gulp.watch(cfg.index, ['copy']);

    return watch(cfg.distfiles)
        .pipe(connect.reload());
});

gulp.task('build-info', function (done) {
    console.info('TARGET ENVIRONMENT => ', process.env.NODE_ENV);
    console.info('# BEGIN USING GULP CONFIG');
    console.dir(cfg);
    console.info('# END USING GULP CONFIG');
    done();
});

gulp.task('zip-package', 'create distribution archive from dist folder', function () {
    var targets = [
        'app/dist/**/*'
    ];
    var version = options.version.split('.').slice(0, 3).join('.');
    var filepath = 'cyan-bulkmatic-' + version + '.zip';
    console.info('WRITING: ', filepath);
    return gulp
        .src(targets)
        .pipe(zip(filepath))
        .pipe(gulp.dest('./dist'));
});

// Applies options.version to the app's package.info file.
gulp.task("apply-version-number", function () {
    var packagejsonpath = path.join(cfg.srcroot, 'app', 'package.json');
    var pkg = JSON.parse(fs.readFileSync(packagejsonpath));
    pkg.version = options.version;
    fs.writeFileSync(packagejsonpath, JSON.stringify(pkg, null, 4));
});

gulp.task("clean", function () {
    return del([
        './dist',
        cfg.distroot,
    ]);
});

// Create a "dev" package for deploying to a device during development.
gulp.task("dev-package", ['cleanbuild'], function (done) {    
    var sequence = [];
    if (!options.version) {
        sequence.push('get-version-number');
    }

    sequence.push('apply-version-number');
    sequence.push('zip-package');
    sequence.push(done);

    runSequence.apply(this, sequence);
});

// Looks for a version number in a "--version" paramter passed to Gulp, or generates the version number using the
// git-tag-distance algorithm.
gulp.task("get-version-number", function () {
    if (options.version) {
        var match = /(\d{1,6})\.(\d{1,6})(?:\.(\d{1,6}))?(?:\.(\d{1,6}))?/.exec(options.version);
        if (match) {
            options.major = parseInt(match[1]);
            options.minor = parseInt(match[2]);
            options.build = parseInt(match[3]) || 0;
            options.release = parseInt(match[4]) || 0;
            options.version = options.major + "." + options.minor + "." + options.build; // + "." + options.release;
            return null;
        }
    }

    var deferred = q.defer();
    var args = "describe --always --long --match build-" + options.major + ".*";
    git.exec({ args: args }, function (err, stdout) {
        if (err) {
            deferred.reject(err);
            return;
        }

        var expr = new RegExp("^build-" + options.major + "\\.(\\d{1,6})(?:\\.(\\d{1,6}))?(?:\\.\\d{1,6})?-(\\d{1,6})-g([a-f0-9]{7})");
        var match = expr.exec(stdout);
        if (match) {
            options.minor = parseInt(match[1]) || 0;
            options.build = (parseInt(match[2]) || 0) + parseInt(match[3]);
            options.release = parseInt("0x" + (match[4] || "0").substring(0, 4));
            options.version = options.major + "." + options.minor + "." + options.build + "." + options.release;
        }
        console.log('GIT VERSION NUMBER => ', options.version);
        deferred.resolve();
    });

    return deferred.promise;
});

// Check the app's js for bugs and coding style.
gulp.task("validate-code", function () {
    return gulp
        .src(cfg.appfiles)
        .pipe(jshint())
        .pipe(jshint.reporter("jshint-stylish", { verbose: true }))
        .pipe(jshint.reporter("fail", {
            ignoreWarning: cfg.isLocalDev
        }));
});