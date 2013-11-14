rx = new RegExp('\u001b\\[[0-9]{1,2}m', 'g')

exports.strip_color = (v) ->
  v.toString().replace(rx, '')

exports.lpad = (v, size, char = ' ') -> Array(size - exports.strip_color(v).length + 1).join(char) + v.toString()
exports.rpad = (v, size, char = ' ') -> v.toString() + Array(size - exports.strip_color(v).length + 1).join(char)

exports.prefix_length = (prefix) ->
  len = exports.strip_color(prefix).length + 2
  return 10 if len < 10
  ++len until len % 2 is 0
  len
