class ex.Register

  constructor: ()->
    @root = {}
    @errno = 0

  add: (at, object)->
    loc = @resolve at, 0, true
    return false if loc is null
    ex.Tools.merge loc, object

  run: (addr, args, scope)->
    loc = @resolve addr
    return false if loc is null and @_setError 1
    if typeof loc is "object"
      if loc[ex.DEFAULT_ACTION[1..]] isnt undefined
        loc = loc[ex.DEFAULT_ACTION[1..]]
      else
        return @_setError(3) and false

    else if typeof loc is "function"
      loc.apply(scope, args)
    else if args.length > 0
      b = @resolve addr, 1
      return false if (typeof loc is "object") and @_setError 3
      n = (()->
        a = addr.split(ex.SPLIT_CHAR)
        return a[a.length-1]
      )()
      b[n] = @_convert args[0], args[1]
    else
      loc

  resolve: (location, from=0, create=false)->
    cPos = @root
    splt = location.split(ex.SPLIT_CHAR)
    splt.pop() while from-- > 0
    for p in splt
      continue if p.length is 0
      if cPos[p] is undefined and create
        cPos[p] = {}
      cPos = cPos[p]
      return null if cPos is undefined
    if cPos is undefined
      null
    else
      cPos

  resolveError: ->
    switch @errno
      when 0
        'no error'
      when 1
        'could not find command'
      when 2
        'could not load command'
      when 3
        'could not execute data'

  _setError: (code)->
    @errno = code
    true


  _convert: (data, to)->
    switch to
      when "Int", "Integer"
        data*1
      when "Float"
        parseFloat(data)
      when "JSON"
        JSON.parse data
      else
        data
