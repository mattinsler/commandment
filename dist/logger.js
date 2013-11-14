(function() {
  var Logger, chalk, util, utils,
    __slice = [].slice;

  util = require('util');

  chalk = require('chalk');

  utils = require('./utils');

  Logger = (function() {
    function Logger(stream) {
      if (stream == null) {
        stream = process.stdout;
      }
      if (!(this instanceof Logger)) {
        return new Logger(stream);
      }
      this.stream = stream;
    }

    Logger.prototype.log = function(text, opts) {
      var len, line, prefix, _i, _len, _ref;
      len = utils.prefix_length(opts.prefix);
      prefix = utils.rpad(chalk[opts.color](opts.prefix) + ':', len);
      _ref = text.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        this.stream.write(prefix + line + '\n');
      }
      return void 0;
    };

    Logger.prototype.info = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.log(util.format.apply(util, args), {
        prefix: 'info',
        color: 'green'
      });
    };

    Logger.prototype.error = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.log(util.format.apply(util, args), {
        prefix: 'error',
        color: 'red'
      });
    };

    Logger.prototype.help = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.log(util.format.apply(util, args), {
        prefix: 'help',
        color: 'cyan'
      });
    };

    return Logger;

  })();

  module.exports = Logger;

}).call(this);
