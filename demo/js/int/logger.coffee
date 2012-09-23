class ex.Logger

  constructor: (@base)->

  log: (data, className='log')->
    return if @base.inHistoryMode
    e = $(["<div class='entry log ", className, "' id='", @_generateId(), "' />"].join(''))
    e.text(data)
    console.log("logging", e.text())
    @base.elements.above.append(e)
    setTimeout( ((el)->
      el.fadeOut(1000)
      setTimeout( ((el)->
        el.remove()
      ), 1000, el)
    ), 1000, e)

  error: (data)->
    @log(data, 'error')

  _generateId: ->
    atob(Math.round(Math.random()*4000))
