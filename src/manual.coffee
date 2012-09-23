class ex.Manual

  constructor: ()->
    @entries = {}

  add: (location, info)->
    @entries[location] = info

  addHash: (hash)->
    ex.Tools.merge(@entries, hash)

  retreive: (location)->
    @entries[location] || "No manual entry."

  find: @prototype.retreive
