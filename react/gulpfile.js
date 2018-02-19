// Basics
const del = require("del");
const gulp = require("gulp");
const newer = require("gulp-newer");
const runSequence = require("run-sequence");

// Lint
const esLint = require("gulp-eslint");
const cssLint = require("gulp-stylelint");

// Build
const rollup = require("rollup");
const rollupRe = require("rollup-plugin-re");
const rollupBabel = require("rollup-plugin-babel");
const rollupNodeResolve = require("rollup-plugin-node-resolve");
const rollupGlobals = require("rollup-plugin-node-globals");
const rollupJson = require("rollup-plugin-json");
const rollupBuiltins = require("rollup-plugin-node-builtins");
const rollupCommonjs = require("rollup-plugin-commonjs");
const rollupUglify = require("rollup-plugin-uglify");
// const rollupClosure = require("rollup-plugin-closure-compiler-js"); // https://github.com/google/closure-compiler-js/issues/23
const replace = require("gulp-replace");
const inline = require("gulp-inline");

// Production
const htmlMin = require("gulp-htmlmin");



const SRC = "src";
const DEST = "dist";
const isProduction = process.env.NODE_ENV === "production";



gulp.task("watch", ["lint", "build"], () => {
	gulp.watch([`${SRC}/js/**/*.jsx`, `${SRC}/js/**/*.js`, ".eslintrc.json"], ["esLint", "buildJs"]);
	gulp.watch([`${SRC}/index.htm`], ["buildHtml"]);
	gulp.watch([`${SRC}/img/**`], ["copyAssets"]);
});
gulp.task("lint", ["esLint", "styleLint"]);
gulp.task("build", ["buildJs", "buildHtml", "copyAssets"]);
gulp.task("default", ["build"]);

gulp.task("clean", () => del(DEST));



// ---------- LINT ---------- //

gulp.task("esLint", () => {
	return gulp.src([`${SRC}/js/**/*.jsx`, `${SRC}/js/**/*.js`, "gulpfile.js"])
		.pipe(esLint())
		.pipe(esLint.format())
		.pipe(esLint.failOnError());
});

gulp.task("styleLint", () => {
	return gulp.src([`${SRC}/style/*.scss`])
		.pipe(cssLint({
			// failAfterError: false, // It defaults to true
			reporters: [{ formatter: "string", console: true }]
		}));
});



// ---------- BUILD ---------- //

gulp.task("buildJs", () => {
	return rollup.rollup({
		input: `${SRC}/js/index.jsx`,
		plugins: [
		// rollupReplace({
		// 	"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
		// 	"/(\/\* buildDev:start \*\/)[\s\S]+(\/\* buildDev:end \*\/)/" : "" // eslint-disable-line
		// }),
			rollupRe({
				// exclude: "node_modules/**",
				defines: {
					DEV: !isProduction,
					PROD: isProduction,
				},
				replaces: {
					"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
				}
			}),
			rollupBabel({
				babelrc: false,
				exclude: "node_modules/**",
				presets: [ [ "env", { modules: false } ], "react" ],
				plugins: [ "external-helpers", "babel-plugin-transform-react-display-name", "transform-class-properties" ]
			}),
			rollupNodeResolve({
				jsnext: true,
				preferBuiltins: true,
				browser: true }),
			rollupCommonjs({
				include: "node_modules/**",
				namedExports: {
					"node_modules/react/index.js": [ "cloneElement", "createElement", "Children", "Component" ]
				}
			}),
			rollupJson(),
			rollupGlobals(),
			rollupBuiltins(),
			// isProduction && rollupClosure(),
			isProduction && rollupUglify()
		]
	}).then(bundle => {
		return bundle.write({
			format: "iife",
			file: `${DEST}/bundle.js`,
			sourcemap: !isProduction
		});
	});
});

gulp.task("buildHtml", () => {
	return gulp.src([`${SRC}/index.htm`, `${SRC}/indexSSR.htm`])
		.pipe(gulp.dest(`${DEST}`));
});

gulp.task("copyAssets", () => {
	return gulp.src([`${SRC}/*img/*`, `${SRC}/*data/*`])
		.pipe(newer(DEST))
		.pipe(gulp.dest(`${DEST}`));
});



// ---------- PRODUCTION ---------- //

gulp.task("prod", ["build"], () => {
	return gulp.src([`${DEST}/index.htm`])
		.pipe(inline({
			// base: DEST,
			disabledTypes: ["img"/*, "svg", "js", "css"*/],
			// ignore: [""]
		}))
		// .pipe(replace(/\/\* buildDev:start \*\/[\s\S]*\/\* buildDev:end \*\//, ""))
		.pipe(replace(/(<!-- buildDev:start -->)[\s\S]+(<!-- buildDev:end -->)/, ""))
		.pipe(htmlMin({
			collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: true,
			removeAttributeQuotes: true,
			removeComments: true,
			removeRedundantAttributes: true
		}))
		.pipe(gulp.dest(DEST));
});

gulp.task("buildSsrJs", () => {
	return rollup.rollup({
		input: "serverSSR.jsx",
		plugins: [
			rollupRe({
				defines: {
					DEV: !isProduction,
					PROD: isProduction,
				},
				replaces: {
					"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
				}
			}),
			rollupBabel({
				babelrc: false,
				exclude: "node_modules/**",
				presets: [ [ "env", { modules: false } ], "react" ],
				plugins: [ "external-helpers", "transform-react-display-name", "transform-class-properties" ]
			}),
			rollupNodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
			rollupCommonjs({
				include: "node_modules/**",
				namedExports: {
					"node_modules/react/index.js": [ "cloneElement", "createElement", "Children", "Component" ]
				}
			}),
			rollupJson(),
			rollupGlobals(),
			rollupBuiltins(),
			isProduction && rollupUglify()
		]
	}).then(bundle => {
		return bundle.write({
			format: "iife",
			file: `${DEST}/bundleSSR.js`,
			sourcemap: !isProduction
		});
	});
});

gulp.task("buildSsr", () => {
	runSequence("build", "buildSsrJs", () => {
		return gulp.src([`${DEST}/indexSSR.htm`])
			.pipe(inline({
				disabledTypes: ["img"],
			}))
			.pipe(htmlMin({
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true,
				removeAttributeQuotes: true,
				removeComments: false,
				removeRedundantAttributes: true
			}))
			.pipe(gulp.dest(DEST));
	});
});
