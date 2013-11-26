q = require 'q'
fs = require 'fs'
nopt = require 'nopt'
path = require 'path'
util = require 'util'
chalk = require 'chalk'
prompt = require './prompt'
Logger = require './logger'

class Commandment
  @nopt: nopt
  @chalk: chalk
  @prompt: prompt
  
  constructor: (opts) ->
    return new Commandment(opts) unless @ instanceof Commandment
    
    @_properties = {}
    @name = opts.name
    if opts.command_dir?
      @commands = fs.readdirSync(opts.command_dir).reduce (o, file) ->
        return o if file[0] in ['.', '_']
        o[k] = v for k, v of require(path.join(opts.command_dir, file))
        o
      , {}
    
    @commands ?= opts.commands
    
    @filters =
      before: []
      after: []
  
  _parse_args: (argv) ->
    opts = nopt({}, {}, argv, 2)
    args = Array::slice.call(opts.argv.remain)
    delete opts.argv
    
    data =
      opts: opts
    
    return data unless args.length > 0

    data.name = args.shift()
    data.args = args
    data.command = @commands[data.name]
    
    data
  
  _before_execute: (context) ->
    @filters.before.reduce (promise, filter) ->
      promise.then -> filter(context)
    , q()
  
  _after_execute: (context, err) ->
    @filters.after.reduce (promise, filter) ->
      promise.then -> filter(context, err)
    , q()
  
  _execute_command: (data) ->
    {name, args, opts, command} = data
    
    logger = Logger()
    
    context =
      command: name
      params: args or []
      opts: opts
      properties: @_properties
      get: @get.bind(@)
      set: =>
        @set(arguments...)
        context
      
      log: (args...) ->
        return logger[name](args...) if logger[name]? and name isnt 'log'
        logger.log(util.format(args...), prefix: name, color: 'magenta')
      error: logger.error.bind(logger)
      logger: logger
      prompt: prompt(prefix: chalk.magenta(name))
    
    @_before_execute(context)
    .then ->
      command.apply(context, context.params)
    .then =>
      @_after_execute(context)
    .catch (err) =>
      @_after_execute(context, err)
  
  before_execute: (cb) ->
    @filters.before.push(cb)
    @

  after_execute: (cb) ->
    @filters.after.push(cb)
    @
  
  get: (key) ->
    @_properties[key]
  
  set: (vals) ->
    @_properties[k] = v for k, v of vals
    @
  
  execute: (argv) ->
    data = @_parse_args(argv)
    
    if data.command?
      args = [data]
    else if (data.name? and @commands.help?) or (!data.name? and !@commands.__default__?)
      args = [name: 'help', opts: data.opts, command: @commands.help]
    else if !data.name? and @commands.__default__?
      args = [name: @name, opts: data.opts, command: @commands.__default__]
    else
      process.exit(1)
    
    @_execute_command(args...)
    .then ->
      process.exit(0)

module.exports = Commandment
