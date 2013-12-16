(function() {
  var chalk, q, utils;

  q = require('q');

  chalk = require('chalk');

  utils = require('./utils');

  module.exports = function(prompt_opts) {
    if (prompt_opts == null) {
      prompt_opts = {};
    }
    return function(fields, stream_in, stream_out) {
      var field_names, len, out, prompt_field;
      if (stream_in == null) {
        stream_in = process.stdin;
      }
      if (stream_out == null) {
        stream_out = process.stdout;
      }
      field_names = Object.keys(fields);
      len = Math.max.apply(Math, field_names.map(function(f) {
        return (fields[f].prompt || f).length;
      }));
      prompt_field = function(field, opts) {
        var d, on_data, prefix_len, stop, text;
        d = q.defer();
        stream_in.pause();
        if (prompt_opts.prefix != null) {
          prefix_len = utils.prefix_length(prompt_opts.prefix);
          stream_out.write(utils.rpad(prompt_opts.prefix + ':', prefix_len));
        }
        stream_out.write(chalk.gray(utils.rpad((opts.prompt || field) + ':', len + 2)));
        if (opts.hidden) {
          stream_in.setRawMode(true);
          stop = function() {
            stream_in.removeListener('data', on_data);
            return stream_in.setRawMode(false);
          };
          text = '';
          on_data = function(buffer) {
            var c, _i, _len;
            for (_i = 0, _len = buffer.length; _i < _len; _i++) {
              c = buffer[_i];
              switch (c) {
                case 13:
                  stop();
                  stream_out.write('\n');
                  return d.resolve(text);
                case 3:
                  stop();
                  process.exit(1);
                  break;
                case 127:
                  text = text.slice(0, -1);
                  stream_out.write("\x1B[1D \x1B[1D");
                  break;
                default:
                  text += Buffer([c]).toString();
                  stream_out.write('*');
              }
            }
          };
          stream_in.on('data', on_data);
        } else {
          stream_in.once('data', function(text) {
            return d.resolve(text.toString().trim());
          });
        }
        stream_in.resume();
        return d.promise;
      };
      out = {};
      return field_names.reduce(function(promise, field_name) {
        var field;
        field = fields[field_name];
        return promise.then(function() {
          return prompt_field(field_name, field).then(function(data) {
            return out[field_name] = data;
          });
        });
      }, q()).then(function() {
        return out;
      });
    };
  };

}).call(this);
