var minifyHTML = require('gulp-minify-html');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var install = require('gulp-install');
var connect = require('gulp-connect');
var replace = require('gulp-replace');
var uglify = require('gulp-uglifyjs');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var less = require('gulp-less');
var util = require('gulp-util');
var rm = require('gulp-rm');
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var Q = require('q');
require('dotenv').load();

var Karma = require('karma').Server;

var bowerComponentsJs = [
  'dev/bower_components/jquery/dist/jquery.js',
  'dev/bower_components/lodash/lodash.js',
  'dev/bower_components/bootstrap/dist/js/bootstrap.js',
  'dev/bower_components/fabric.js/dist/fabric.js',
  'dev/bower_components/angular/angular.js',
  'dev/bower_components/angular-ui-router/release/angular-ui-router.js',
  'dev/bower_components/angular-messages/angular-messages.js',
  'dev/bower_components/angular-bootstrap/ui-bootstrap.min.js',
  'dev/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
];
var bowerComponentsCss = [];
var jsFiles = ['dev/app/*.js', 'dev/app/helpers/*.js', 'dev/app/controllers/**/*.js', '!dev/app/controllers/**/*_test.js'];
var cssFiles = 'dev/app/**/*.css';
var lessFiles = 'dev/app/style/**/*.less';
var lessFilesMain = 'dev/app/style/app.less';
var lessFilesOutput = 'dev/app';

gulp.task('default', gulpsync.sync(['webserver', 'install', 'settings', 'less', 'index', 'jsHint']), function () {
  gulp.watch(jsFiles, ['jsHint']);
  gulp.watch(lessFiles, ['less']);
  gulp.watch([].concat(bowerComponentsJs, bowerComponentsCss, jsFiles, [cssFiles]), ['index']);
});

gulp.task('serve', ['default']);

gulp.task('settings', ['settings.js']);

gulp.task('settings.js', function () {
  return gulp.src('dev/app/settings.template')
    //.pipe(replace('SERVER_ADDRESS', process.env.SERVER_ADDRESS))
    .pipe(rename('settings.js'))
    .pipe(gulp.dest('dev/app'));
});

gulp.task('less', function () {
  return gulp.src(lessFilesMain)
    .pipe(sourcemaps.init())
    .pipe(less().on('error', function (err) {
      console.log(err.message);
      this.emit('end');
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(lessFilesOutput));
});

gulp.task('jsHint', function () {
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('index', function () {
  return gulp.src('dev/index.html')
    .pipe(inject(gulp.src(bowerComponentsJs.concat(bowerComponentsCss, jsFiles, [cssFiles])), {relative: true}))
    .pipe(gulp.dest('dev'));
});

gulp.task('install', function () {
  return gulp.src(['bower.json'])
    .pipe(install());
});

gulp.task('webserver', function () {
  return connect.server({
    port: 8000,
    root: ['dev'],
    fallback: 'dev/index.html'
  });
});

gulp.task('build', gulpsync.sync(['install', 'settings', 'build:clean', 'build:copy', 'build:js', 'build:css', 'build:index', 'build:html']));

gulp.task('build:clean', function () {
  return gulp.src('dist/**/*', {read: false})
    .pipe(rm());
});

gulp.task('build:js', function () {
  return gulp.src(bowerComponentsJs.concat(jsFiles))
    .pipe(uglify('app.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:css', function () {
  return gulp.src(bowerComponentsCss.concat([cssFiles]))
    .pipe(minifyCss({keepSpecialComments: 0}))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:copy', function () {
  var cpHome = gulp.src(['dev/index.html', 'dev/favicon.ico', 'dev/.htaccess', 'dev/robots.txt'])
    .pipe(gulp.dest('dist'));
  var cpHTML = gulp.src('dev/app/**/*.html')
    .pipe(gulp.dest('dist/app'));
  return Q.all([cpHome, cpHTML]);
});

gulp.task('build:index', function () {
  return gulp.src('dist/index.html')
    .pipe(inject(gulp.src(['dist/app.css', 'dist/app.js']), {relative: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('build:html', function () {
  return gulp.src('dist/app/**/*.html')
    .pipe(minifyHTML({
      empty: true,
      loose: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['test:unit']);

gulp.task('test:unit', function (done) {
  return new Karma({
    configFile: __dirname + '/karma.conf.js',
    files: []
      .concat(bowerComponentsJs, [
        'dev/bower_components/angular-mocks/angular-mocks.js',
        'dev/app/**/*.js',
        {
          pattern: 'dev/mock-data/**',
          watched: false,
          included: false,
          served: true
        }
      ])
  }, done).start();
});
