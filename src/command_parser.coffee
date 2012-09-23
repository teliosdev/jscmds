class ex.CommandParser

  constructor: (@line)->

  parseLine: ()->
    atArg = -1
    inQuote = false
    escChar = 0
    command = { command: new ex.StringBuffer(), args: [] }

    @_eachChar @line, (c, i)->
      if c in ['"', "'"] and escChar is 0
        if inQuote
          inQuote = false
        else
          inQuote = true

      else if c is '\\' and escChar is 0
        escChar = 2

      else if c is ' ' and not inQuote and escChar is 0
        atArg++

      else if atArg is -1
        command.command.push c

      else
        if typeof command.args[atArg] is "undefined"
          command.args[atArg] = new ex.StringBuffer(c)
        else
          command.args[atArg].push c

      if escChar > 0
        escChar--

      null

    command.command = command.command.toString()

    for strBuf, i in command.args
      command.args[i] = strBuf.toString()

    command

  _eachChar: (str, cb)->
    for c, i in str
      cb(c, i)

class ex.StringBuffer

  constructor: (start)->
    @parts = []
    @parts.push start

  append: (str)->
    @parts.push str

  push: (str)->
    @parts.push str

  toString: (j='')->
    @parts.join j
