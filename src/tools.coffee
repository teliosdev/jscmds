ex.Tools =

  merge: (target, object, deep=true)->
    for nam, val of object
      if typeof val is "object" and deep
        target[nam] = {}
        ex.Tools.merge target[nam], val
      else
        target[nam] = val
    null

  clone: (target, deep=true)->
    ob = {}
    for nam, val of target
      if typeof val is "object" and deep
        console.log("recursing:", nam, val)
        ob[nam] = ex.Tools.clone target[nam]
      else
        ob[nam] = val

    ob

  command: ->
    args = ['']
    for c in arguments
      args.push c
    args.join ex.SPLIT_CHAR

  c: @command

  levenshtein: (((min, split)->
    try
      split = !("0")[0]
    catch i
      split = true

    (a, b)->
      if a == b
        return 0

      if not a.length or not b.length
        return b.length || a.length

      if split
        a = a.split("")
        b = b.split("")

      len1 = a.length+1
      len2 = b.length+1
      I = 0
      i = 0
      d = [[0]]

      while ++i < len2
        d[0][i] = i

      i =0

      while ++i < len1
        c = a[I]
        d[i] = [i]
        j = J = 0

        while ++j < len2
          d[i][j] = min(d[I][j]+1, d[i][J]+1, d[I][J] + (c != b[J]))
          ++J

        ++I

      return d[len1-1][len2-1]


  )(Math.min, false))
