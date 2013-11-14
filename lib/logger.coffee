util = require 'util'
chalk = require 'chalk'
utils = require './utils'

class Logger
  constructor: (stream = process.stdout) ->
    return new Logger(stream) unless @ instanceof Logger
    @stream = stream

  log: (text, opts) ->
    len = utils.prefix_length(opts.prefix)
    prefix = utils.rpad(chalk[opts.color](opts.prefix) + ':', len)
    @stream.write(prefix + line + '\n') for line in text.split('\n')
    undefined

  info: (args...) ->
    @log(util.format(args...), prefix: 'info', color: 'green')

  error: (args...) ->
    @log(util.format(args...), prefix: 'error', color: 'red')
  
  help: (args...) ->
    @log(util.format(args...), prefix: 'help', color: 'cyan')

module.exports = Logger
