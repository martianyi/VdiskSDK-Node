"use strict";

var gulp = require('gulp');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");

// Compiling ES6 to ES5
gulp.task("babel", function () {
    return gulp.src("./src/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel())//babel相关配置详见package.json中babel选项
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("."));
});

gulp.task("default", ['babel']);
