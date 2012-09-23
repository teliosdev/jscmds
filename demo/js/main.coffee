$( ()->
  window.interfaceInstance = new Interface.Base()
  window.cmdInstance = new Cmd.Base()
  cmdInstance.history = try JSON.parse(localStorage.history)
  catch e
    []
  cmdInstance.console = {}
  cmdInstance.register.add('.',
    all: ()->
      console.log "executing:", @command, @args
      lastCmd = @exc.history[@exc.history.length-1]
      unless lastCmd isnt undefined and lastCmd.cmd is @command and lastCmd.args is @args
        @exc.history.push @basicCmd

      @exc.register.root.me.history.track = @exc.history
      localStorage.history = JSON.stringify(@exc.history) if localStorage isnt undefined

    echo: ()->
      @args.join " "

    default: ()->
      str = @args.join " "
      window.location = ["https://encrypted.google.com/search?q=", encodeURIComponent(str)].join('')

    me:
      history:
        default: ()->
          set = @exc.history[cmdInstance.history.length-6..]
          for s in set
            str = new Cmd.StringBuffer(s.cmd)
            for a in s.args
              str.push a
            interfaceInstance.console.log(str.toString(' '))
          null

        track: []

    man: (page)->
      @exc.manual.find(page)

    data:
      watermelons: "yummy",
      pancakes: "syrupy",
      coins: "gold",
      foo: "bar",
      water: "H20",
      echo: ()->
        @args.join " "

  )

  cmdInstance.manual.addHash(
    ".man"       : "Get information about any command.",
    ".echo"      : "Any arguments passed to it are returned.",
    ".me"        : "Information about the user.",
    ".data"      : "A set of data for the user to play with.",
    ".me.history": "Information about the commands run by the user.",
    ".me.history.track": "A list of all the commands ran."
  )

)
