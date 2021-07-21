const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');

function packCss () {
    return gulp.src(['css/*.css'])
        .pipe(concat('stylesheet.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('build/public/css'));
}

gulp.task('default', gulp.series(packCss));
