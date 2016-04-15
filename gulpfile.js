var watchify = require('watchify'),
    browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    assign = require('lodash.assign'),
    rename = require('gulp-rename'),
    babelify = require('babelify'),
    uglify = require('gulp-uglify'),
    exit = require('gulp-exit');

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
