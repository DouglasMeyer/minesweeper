var assign = require('lodash.assign');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var exit = require('gulp-exit');
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

// add custom browserify options here
var customOpts = {
  entries: ['./src/index.jsx'],
  debug: true,
  transform: [babelify]
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .on('error', notify.onError())
    .pipe(source('./src/app.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(rename({
      dirname: ''
    }))
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'))
    .pipe(gutil.env.type === 'production' ? exit() : gutil.noop());
}
