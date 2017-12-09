'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _gulpUtil = require('gulp-util');

var _jestCli = require('jest-cli');

var _jestCli2 = _interopRequireDefault(_jestCli);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var PLUGIN_NAME = 'gulp-jest-cli';

var runCLI = function runCLI(argv, projects, done) {
  _jestCli2.default.runCLI(argv, projects, function (result) {
    if (result.numFailedTestSuites || result.numFailedTests) {
      var error = new _gulpUtil.PluginError(PLUGIN_NAME, 'Jest failed');
      error.jest = true;
      done(error);
      return;
    }

    done();
  });
};

var plugin = function plugin() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.version) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, '`version` flag is not supported.');
  }

  var count = 0;
  function onceOrThrow(file, _, done) {
    count += 1;

    if (count > 1) {
      this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, '`gulp.src` replaces `rootDir`. Use of `glob`s in `gulp.src` is discouraged.'));
      return;
    }

    if (!file || !file.isDirectory() || !file.path) {
      this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, 'gulp.src should be set to Jest rootDir'));
      return;
    }

    var rootDir = file.path;

    var cwd = (0, _path.resolve)(process.cwd(), '..');

    if (options.config && options.config.rootDir) {
      var configRootDir = (0, _path.relative)(cwd, options.config.rootDir);
      var gulpSrcRootDir = (0, _path.relative)(cwd, rootDir);

      if (configRootDir !== gulpSrcRootDir) {
        // TODO(jmurzy) Also print below warning if `rootDir` is set in an external config
        (0, _gulpUtil.log)(PLUGIN_NAME, _gulpUtil.colors.red('rootDir defined in `gulp.src` does not match Jest config:'), _gulpUtil.colors.magenta(gulpSrcRootDir), _gulpUtil.colors.red('!=='), _gulpUtil.colors.magenta(configRootDir));
      }
    }

    var config = options.config,
        rest = _objectWithoutProperties(options, ['config']);

    var argv = rest;

    // `undefined` config will make jest parse package.json for its config.
    if (config) {
      argv = _extends({}, argv, {
        config: config
      });
    }

    runCLI(argv, [rootDir], done);
  }

  return _through2.default.obj(onceOrThrow);
};

exports.default = plugin;