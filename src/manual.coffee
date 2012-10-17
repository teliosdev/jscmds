class ex.Manual

  constructor: ()->
    @entries = {}

  add: (location, info)->
    console.log "adding entry to", location, "data", info
    @entries[location] = info
    this

  addHash: (hash)->
    ex.Tools.merge(@entries, hash)

  addArray: (array)->
    for e in array
      console.warn e[0], e[1]
      @add ex.Tools.command.apply(ex.Tools, e[0]), e[1]

  retreive: (location)->
    @entries[location] || "No manual entry."

  find: @prototype.retreive
