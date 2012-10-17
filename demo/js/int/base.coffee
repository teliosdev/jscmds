class ex.Base

  constructor: ()->
    @elements = \
      input: $("#cmd"),
      center: $("div.center"),
      above: $("div.center div.above"),
      below: $("div.center div.below")

    @_bindElements()
    @console = new ex.Logger(this)
    @inHistoryMode = false
    @historyPos = 0

  inputChange: ()->
    v = @elements.input.val()
    return console.log("v.length:", v.length) if v.length is 0
    @_setHistoryMode false, false if @inHistoryMode
    a = cmdInstance.a(v)[0..5]
    @elements.below.children().remove()
    for n, i in a
      m = cmdInstance.manual.find(n)
      n = @_HTMLEscape(n)
      if n.indexOf(v) > -1
        n = n.replace(v, ["<span class='b'>",@_HTMLEscape(v),"</span>"].join(''))
      @elements.below.append(['<div class="entry"><span class="cmd">', n, '</span><span class="man_entry">', @_HTMLEscape(m), '</span>', '</div>'].join(''))

  inputSubmit: ()->
    console.log "INSIDE INPUT_SUBMIT"
    line = @elements.input.val()
    @elements.input.val('')
    @_setHistoryMode false if @inHistoryMode
    r = cmdInstance.r(line)
    if r is false and cmdInstance.register.errno > 0
      @console.error(cmdInstance.register.resolveError())
    else if r isnt null
      @console.log(r)

  # the default number of history items in any direction is 5
  historyMode: (up)->
    (@historyPos+= if up then 1 else -1) if @inHistoryMode
    @_setHistoryMode true
    reversePos = (cmdInstance.history.length-1)-@historyPos
    if reversePos < 0
      reversePos = 0
      @historyPos-= 1
    backEl =  cmdInstance.history[\
      (if reversePos-6 < 0 then 0 else reversePos-6)..(if reversePos-1 < 0 then 0 else reversePos-1)
    ] # the last five commands
    backEl.pop() if reversePos is 0
    current = cmdInstance.history[reversePos]
    frontEl = cmdInstance.history[reversePos+1..reversePos+6] # the next five commands
    console.log(backEl, current, frontEl, reversePos, @historyPos)
    if current is undefined # they went to the end or beginning of the list
      return @_setHistoryMode false
    for e in backEl
      @elements.above.append("<div class='entry'>#{@_HTMLEscape(@_joinCommand(e))}</div>")

    @elements.input.val(@_joinCommand(current))

    for e in frontEl
      @elements.below.append("<div class='entry'>#{@_HTMLEscape(@_joinCommand(e))}</div>")

  _bindElements: ()->
    @elements.input.on('keyup', this, (event)->
      console.log(event.which)
      if event.which is 13 # they hit enter
        event.data.inputSubmit()
      else if event.which is 38 or event.which is 40
        event.data.historyMode(if event.which is 38 then true else false)
      else
        console.log("going to inputChange")
        event.data.inputChange()
    )

  _setHistoryMode: (v, cI=true)->
    if v
      @inHistoryMode = true
      @_clearElements(cI)
      @elements.center.addClass('history_mode')
    else
      @inHistoryMode = false
      @historyPos = 0
      @_clearElements(cI)
      @elements.center.removeClass('history_mode')

  _joinCommand: (c)->
    str = new Cmd.StringBuffer(c.cmd)
    for a in c.args
      str.push a
    str.toString(' ')

  _clearElements: (clearInput=true)->
    @elements.above.children().remove()
    @elements.below.children().remove()
    @elements.input.val('') if clearInput

  _HTMLEscape: (t)->
    for r in @_HTMLMap
      t = t.replace r[0], r[1]
    t

  _HTMLMap: [
    [/&/g, "&amp;"],
    [/</g, "&lt;"],
    [/>/g, "&gt;"],
    [/"/g, "&quot;"]
  ]

  console.log "events bound"
