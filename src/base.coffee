ex.MAX_LEVEN_DISTANCE = 10
ex.DEFAULT_ACTION     = '.default' # .all is taken too
ex.SPLIT_CHAR         = '.'

class ex.Base

  constructor: (cb)->
    @register = new ex.Register()
    @manual   = new ex.Manual()
    @defaultCmd = {}
    if typeof cb is "function"
      cb(@defaultCmd)
    else if typeof cb is "object"
      @defaultCmd = cb
    @defaultCmd.exc = this

  receiveCommand: (line)->
    cmd = @_resolveCommand line
    r = @register.run cmd.command, cmd.args, cmd
    if @register.resolve(".all") isnt null
      @register.run ".all", cmd.args, cmd

    r

  r: @prototype.receiveCommand

  tryCommand: (line)->
    cmd = @_resolveCommand line
    r = @register.run cmd.command, cmd.args, cmd
    if r is false and @register.errno is 1
      a = @autoComplete(line, cmd)
      return false if a.length is 0
      console.log("trying command", a[0])
      @register.run a[0], cmd.args, cmd
    else
      return r

  t: @prototype.tryCommand

  autoComplete: (line,cmd=null)->
    cmd = @_resolveCommand line unless cmd isnt null
    o = @register.resolve cmd.command
    #return [] if o isnt null or cmd.command is ex.DEFAULT_ACTION
    # we're assuming the caller wants any and all suggestions anyway, even if the command is valid
    parts = cmd.command.split(ex.SPLIT_CHAR)
    out   = []
    distances = {}
    console.log(parts)
    for p, i in parts
      full = parts[0..i].join(ex.SPLIT_CHAR)
      o    = @register.resolve full
      if o isnt null
        for e, _ of o
          if e isnt ex.DEFAULT_ACTION[1..] and e isnt 'all'
            str = [full,e]
            str = str.join(ex.SPLIT_CHAR)
            distances[str] = ex.Tools.levenshtein(line, str)
            out.push str unless distances[str] > ex.MAX_LEVEN_DISTANCE

    out = out.sort (a,b)->
      if distances[a] > distances[b]
        return 1
      else if distances[b] > distances[a]
        return -1
      else
        return 0

    out

  a: @prototype.autoComplete


  _resolveCommand: (line)->
    console.log("command:", line)
    if line[0] isnt ex.SPLIT_CHAR
      line = [ex.DEFAULT_ACTION, line].join(" ")
    cmd = (new ex.CommandParser(line)).parseLine()
    ex.Tools.merge cmd, ex.Tools.clone(@defaultCmd, false), false
    cmd.basicCmd = {
      cmd: cmd.command,
      args: cmd.args
    }
    cmd
