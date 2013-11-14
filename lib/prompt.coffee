q = require 'q'
chalk = require 'chalk'
utils = require './utils'

module.exports = (prompt_opts = {}) ->
  (fields, stream_in = process.stdin, stream_out = process.stdout) ->
    field_names = Object.keys(fields)
    len = Math.max(field_names.map((f) -> (fields[f].prompt or f).length)...)
  
    prompt_field = (field, opts) ->
      d = q.defer()
      
      stream_in.pause()
      
      if prompt_opts.prefix?
        prefix_len = utils.prefix_length(prompt_opts.prefix)
        stream_out.write utils.rpad(prompt_opts.prefix + ':', prefix_len)
      
      stream_out.write chalk.gray(utils.rpad((opts.prompt or field) + ':', len + 2))
    
      if opts.hidden
        stream_in.setRawMode(true)
        stop = ->
          stream_in.removeListener('data', on_data)
          stream_in.setRawMode(false)
      
        text = ''
        on_data = (c) ->
          switch c[0]
            when 13
              stop()
              stream_out.write('\n')
              return d.resolve(text)
            when 3
              stop()
              process.exit(1)
            when 127
              text = text.slice(0, -1)
              stream_out.write("\x1B[1D \x1B[1D")
            else
              text += c.toString()
              stream_out.write('*')
      
        stream_in.on('data', on_data)
      
      else
        stream_in.once 'data', (text) ->
          d.resolve(text.toString().trim())
    
      stream_in.resume()
      d.promise
  
    out = {}
    field_names.reduce((promise, field_name) ->
      field = fields[field_name]
    
      promise.then ->
        prompt_field(field_name, field)
        .then (data) ->
          out[field_name] = data
    , q())
    .then ->
      out
