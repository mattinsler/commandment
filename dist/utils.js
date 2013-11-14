(function() {
  var rx;

  rx = new RegExp('\u001b\\[[0-9]{1,2}m', 'g');

  exports.strip_color = function(v) {
    return v.toString().replace(rx, '');
  };

  exports.lpad = function(v, size, char) {
    if (char == null) {
      char = ' ';
    }
    return Array(size - exports.strip_color(v).length + 1).join(char) + v.toString();
  };

  exports.rpad = function(v, size, char) {
    if (char == null) {
      char = ' ';
    }
    return v.toString() + Array(size - exports.strip_color(v).length + 1).join(char);
  };

  exports.prefix_length = function(prefix) {
    var len;
    len = exports.strip_color(prefix).length + 2;
    if (len < 10) {
      return 10;
    }
    while (len % 2 !== 0) {
      ++len;
    }
    return len;
  };

}).call(this);
