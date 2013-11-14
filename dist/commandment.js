(function() {
  var Commandment, Logger, chalk, fs, nopt, path, prompt, q, util,
    __slice = [].slice;

  q = require('q');

  fs = require('fs');

  nopt = require('nopt');

  path = require('path');

  util = require('util');

  chalk = require('chalk');

  prompt = require('./prompt');

  Logger = require('./logger');

  Commandment = (function() {
    Commandment.nopt = nopt;

    Commandment.chalk = chalk;

    Commandment.prompt = prompt;

    function Commandment(opts) {
      if (!(this instanceof Commandment)) {
        return new Commandment(opts);
      }
      this._properties = {};
      this.name = opts.name;
      if (opts.command_dir != null) {
        this.commands = fs.readdirSync(opts.command_dir).reduce(function(o, file) {
          var k, v, _ref, _ref1;
          if ((_ref = file[0]) === '.' || _ref === '_') {
            return o;
          }
          _ref1 = require(path.join(opts.command_dir, file));
          for (k in _ref1) {
            v = _ref1[k];
            o[k] = v;
          }
          return o;
        }, {});
      }
      if (this.commands == null) {
        this.commands = opts.commands;
      }
      this.filters = {
        before: [],
        after: []
      };
    }

    Commandment.prototype._parse_args = function(argv) {
      var args, data, opts;
      opts = nopt(argv);
      args = Array.prototype.slice.call(opts.argv.remain);
      delete opts.argv;
      data = {
        opts: opts
      };
      if (!(args.length > 0)) {
        return data;
      }
      data.name = args.shift();
      data.args = args;
      data.command = this.commands[data.name];
      return data;
    };

    Commandment.prototype._before_execute = function(context) {
      return this.filters.before.reduce(function(promise, filter) {
        return promise.then(function() {
          return filter(context);
        });
      }, q());
    };

    Commandment.prototype._after_execute = function(context, err) {
      return this.filters.after.reduce(function(promise, filter) {
        return promise.then(function() {
          return filter(context, err);
        });
      }, q());
    };

    Commandment.prototype._execute_command = function(data) {
      var args, command, context, logger, name, opts,
        _this = this;
      name = data.name, args = data.args, opts = data.opts, command = data.command;
      logger = Logger();
      context = {
        command: name,
        params: args || [],
        opts: opts,
        properties: this._properties,
        get: this.get.bind(this),
        set: function() {
          _this.set.apply(_this, arguments);
          return context;
        },
        log: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if ((logger[name] != null) && name !== 'log') {
            return logger[name].apply(logger, args);
          }
          return logger.log(util.format.apply(util, args), {
            prefix: name,
            color: 'magenta'
          });
        },
        error: logger.error.bind(logger),
        logger: logger,
        prompt: prompt({
          prefix: chalk.magenta(name)
        })
      };
      return this._before_execute(context).then(function() {
        return command.apply(context, context.params);
      }).then(function() {
        return _this._after_execute(context);
      })["catch"](function(err) {
        return _this._after_execute(context, err);
      });
    };

    Commandment.prototype.before_execute = function(cb) {
      this.filters.before.push(cb);
      return this;
    };

    Commandment.prototype.after_execute = function(cb) {
      this.filters.after.push(cb);
      return this;
    };

    Commandment.prototype.get = function(key) {
      return this._properties[key];
    };

    Commandment.prototype.set = function(vals) {
      var k, v;
      for (k in vals) {
        v = vals[k];
        this._properties[k] = v;
      }
      return this;
    };

    Commandment.prototype.execute = function(argv) {
      var args, data;
      data = this._parse_args(argv);
      if (data.command != null) {
        args = [data];
      } else if (((data.name != null) && (this.commands.help != null)) || ((data.name == null) && (this.commands.__default__ == null))) {
        args = [
          {
            name: 'help',
            opts: data.opts,
            command: this.commands.help
          }
        ];
      } else if ((data.name == null) && (this.commands.__default__ != null)) {
        args = [
          {
            name: this.name,
            opts: data.opts,
            command: this.commands.__default__
          }
        ];
      } else {
        process.exit(1);
      }
      return this._execute_command.apply(this, args).then(function() {
        return process.exit(0);
      });
    };

    return Commandment;

  })();

  module.exports = Commandment;

}).call(this);
