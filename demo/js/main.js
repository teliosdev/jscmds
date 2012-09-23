
$(function() {
  window.interfaceInstance = new Interface.Base();
  window.cmdInstance = new Cmd.Base();
  cmdInstance.history = (function() {
    try {
      return JSON.parse(localStorage.history);
    } catch (e) {
      return [];
    }
  })();
  cmdInstance.console = {};
  cmdInstance.register.add('.', {
    all: function() {
      var lastCmd;
      console.log("executing:", this.command, this.args);
      lastCmd = this.exc.history[this.exc.history.length - 1];
      if (!(lastCmd !== void 0 && lastCmd.cmd === this.command && lastCmd.args === this.args)) {
        this.exc.history.push(this.basicCmd);
      }
      this.exc.register.root.me.history.track = this.exc.history;
      if (localStorage !== void 0) {
        return localStorage.history = JSON.stringify(this.exc.history);
      }
    },
    echo: function() {
      return this.args.join(" ");
    },
    "default": function() {
      var str;
      str = this.args.join(" ");
      return window.location = ["https://encrypted.google.com/search?q=", encodeURIComponent(str)].join('');
    },
    me: {
      history: {
        "default": function() {
          var a, s, set, str, _i, _j, _len, _len2, _ref;
          set = this.exc.history.slice(cmdInstance.history.length - 6);
          for (_i = 0, _len = set.length; _i < _len; _i++) {
            s = set[_i];
            str = new Cmd.StringBuffer(s.cmd);
            _ref = s.args;
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              a = _ref[_j];
              str.push(a);
            }
            interfaceInstance.console.log(str.toString(' '));
          }
          return null;
        },
        track: []
      }
    },
    man: function(page) {
      return this.exc.manual.find(page);
    },
    data: {
      watermelons: "yummy",
      pancakes: "syrupy",
      coins: "gold",
      foo: "bar",
      water: "H20",
      echo: function() {
        return this.args.join(" ");
      }
    }
  });
  return cmdInstance.manual.addHash({
    ".man": "Get information about any command.",
    ".echo": "Any arguments passed to it are returned.",
    ".me": "Information about the user.",
    ".data": "A set of data for the user to play with.",
    ".me.history": "Information about the commands run by the user.",
    ".me.history.track": "A list of all the commands ran."
  });
});
