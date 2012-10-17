(function() {
  var ex, expose;

  ex = expose = (function() {
    try {
      return exports;
    } catch (e) {
      return window.Cmd = {};
    }
  })();

  ex.Tools = {
    merge: function(target, object, deep) {
      var nam, val;
      if (deep == null) deep = true;
      for (nam in object) {
        val = object[nam];
        if (typeof val === "object" && deep) {
          target[nam] = {};
          ex.Tools.merge(target[nam], val);
        } else {
          target[nam] = val;
        }
      }
      return null;
    },
    clone: function(target, deep) {
      var nam, ob, val;
      if (deep == null) deep = true;
      ob = {};
      for (nam in target) {
        val = target[nam];
        if (typeof val === "object" && deep) {
          console.log("recursing:", nam, val);
          ob[nam] = ex.Tools.clone(target[nam]);
        } else {
          ob[nam] = val;
        }
      }
      return ob;
    },
    command: function() {
      var args, c, _i, _len;
      args = [''];
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        c = arguments[_i];
        args.push(c);
      }
      return args.join(ex.SPLIT_CHAR);
    },
    c: this.command,
    levenshtein: (function(min, split) {
      try {
        split = !"0"[0];
      } catch (i) {
        split = true;
      }
      return function(a, b) {
        var I, J, c, d, j, len1, len2;
        if (a === b) return 0;
        if (!a.length || !b.length) return b.length || a.length;
        if (split) {
          a = a.split("");
          b = b.split("");
        }
        len1 = a.length + 1;
        len2 = b.length + 1;
        I = 0;
        i = 0;
        d = [[0]];
        while (++i < len2) {
          d[0][i] = i;
        }
        i = 0;
        while (++i < len1) {
          c = a[I];
          d[i] = [i];
          j = J = 0;
          while (++j < len2) {
            d[i][j] = min(d[I][j] + 1, d[i][J] + 1, d[I][J] + (c !== b[J]));
            ++J;
          }
          ++I;
        }
        return d[len1 - 1][len2 - 1];
      };
    })(Math.min, false)
  };

  ex.CommandParser = (function() {

    function CommandParser(line) {
      this.line = line;
    }

    CommandParser.prototype.parseLine = function() {
      var atArg, command, escChar, i, inQuote, strBuf, _len, _ref;
      atArg = -1;
      inQuote = false;
      escChar = 0;
      command = {
        command: new ex.StringBuffer(),
        args: []
      };
      this._eachChar(this.line, function(c, i) {
        if ((c === '"' || c === "'") && escChar === 0) {
          if (inQuote) {
            inQuote = false;
          } else {
            inQuote = true;
          }
        } else if (c === '\\' && escChar === 0) {
          escChar = 2;
        } else if (c === ' ' && !inQuote && escChar === 0) {
          atArg++;
        } else if (atArg === -1) {
          command.command.push(c);
        } else {
          if (typeof command.args[atArg] === "undefined") {
            command.args[atArg] = new ex.StringBuffer(c);
          } else {
            command.args[atArg].push(c);
          }
        }
        if (escChar > 0) escChar--;
        return null;
      });
      command.command = command.command.toString();
      _ref = command.args;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        strBuf = _ref[i];
        command.args[i] = strBuf.toString();
      }
      return command;
    };

    CommandParser.prototype._eachChar = function(str, cb) {
      var c, i, _len, _results;
      _results = [];
      for (i = 0, _len = str.length; i < _len; i++) {
        c = str[i];
        _results.push(cb(c, i));
      }
      return _results;
    };

    return CommandParser;

  })();

  ex.StringBuffer = (function() {

    function StringBuffer(start) {
      this.parts = [];
      this.parts.push(start);
    }

    StringBuffer.prototype.append = function(str) {
      return this.parts.push(str);
    };

    StringBuffer.prototype.push = function(str) {
      return this.parts.push(str);
    };

    StringBuffer.prototype.toString = function(j) {
      if (j == null) j = '';
      return this.parts.join(j);
    };

    return StringBuffer;

  })();

  ex.Register = (function() {

    function Register() {
      this.root = {};
      this.errno = 0;
    }

    Register.prototype.add = function(at, object, sep) {
      var loc;
      if (sep == null) sep = '.';
      loc = this.resolve(at, 0, true, sep);
      if (loc === null) return false;
      return ex.Tools.merge(loc, object);
    };

    Register.prototype.run = function(addr, args, scope) {
      var b, loc, n;
      loc = this.resolve(addr);
      if (loc === null && this._setError(1)) return false;
      if (typeof loc === "object") {
        if (loc[ex.DEFAULT_ACTION.slice(1)] !== void 0) {
          return loc = loc[ex.DEFAULT_ACTION.slice(1)];
        } else {
          return this._setError(3) && false;
        }
      } else if (typeof loc === "function") {
        return loc.apply(scope, args);
      } else if (args.length > 0) {
        b = this.resolve(addr, 1);
        if ((typeof loc === "object") && this._setError(3)) return false;
        n = (function() {
          var a;
          a = addr.split(ex.SPLIT_CHAR);
          return a[a.length - 1];
        })();
        return b[n] = this._convert(args[0], args[1]);
      } else {
        return loc;
      }
    };

    Register.prototype.resolve = function(location, from, create, sep) {
      var cPos, p, splt, start, _i, _len;
      if (from == null) from = 0;
      if (create == null) create = false;
      if (sep == null) sep = ex.SPLIT_CHAR;
      cPos = this.root;
      splt = location.split(sep);
      while (from-- > 0) {
        splt.pop();
      }
      start = 0;
      for (_i = 0, _len = splt.length; _i < _len; _i++) {
        p = splt[_i];
        if (p.length === 0 && start === 0) continue;
        if (cPos[p] === void 0 && create) cPos[p] = {};
        cPos = cPos[p];
        if (cPos === void 0) return null;
        start++;
      }
      if (cPos === void 0) {
        return null;
      } else {
        return cPos;
      }
    };

    Register.prototype.resolveError = function() {
      switch (this.errno) {
        case 0:
          return 'no error';
        case 1:
          return 'could not find command';
        case 2:
          return 'could not load command';
        case 3:
          return 'could not execute data';
      }
    };

    Register.prototype._setError = function(code) {
      this.errno = code;
      return true;
    };

    Register.prototype._convert = function(data, to) {
      switch (to) {
        case "Int":
        case "Integer":
          return data * 1;
        case "Float":
          return parseFloat(data);
        case "JSON":
          return JSON.parse(data);
        default:
          return data;
      }
    };

    return Register;

  })();

  ex.Manual = (function() {

    function Manual() {
      this.entries = {};
    }

    Manual.prototype.add = function(location, info) {
      console.log("adding entry to", location, "data", info);
      this.entries[location] = info;
      return this;
    };

    Manual.prototype.addHash = function(hash) {
      return ex.Tools.merge(this.entries, hash);
    };

    Manual.prototype.addArray = function(array) {
      var e, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        e = array[_i];
        console.warn(e[0], e[1]);
        _results.push(this.add(ex.Tools.command.apply(ex.Tools, e[0]), e[1]));
      }
      return _results;
    };

    Manual.prototype.retreive = function(location) {
      return this.entries[location] || "No manual entry.";
    };

    Manual.prototype.find = Manual.prototype.retreive;

    return Manual;

  })();

  ex.MAX_LEVEN_DISTANCE = 3;

  ex.DEFAULT_ACTION = '.default';

  ex.SPLIT_CHAR = '.';

  ex.Base = (function() {

    function Base(cb) {
      this.register = new ex.Register();
      this.manual = new ex.Manual();
      this.defaultCmd = {};
      if (typeof cb === "function") {
        cb(this.defaultCmd);
      } else if (typeof cb === "object") {
        this.defaultCmd = cb;
      }
      this.defaultCmd.exc = this;
    }

    Base.prototype.receiveCommand = function(line) {
      var cmd, r;
      cmd = this._resolveCommand(line);
      r = this.register.run(cmd.command, cmd.args, cmd);
      if (this.register.resolve(ex.Tools.command('all')) !== null) {
        this.register.run(ex.Tools.command('all'), cmd.args, cmd);
      }
      return r;
    };

    Base.prototype.r = Base.prototype.receiveCommand;

    Base.prototype.tryCommand = function(line) {
      var a, cmd, r;
      cmd = this._resolveCommand(line);
      r = this.register.run(cmd.command, cmd.args, cmd);
      if (r === false && this.register.errno === 1) {
        a = this.autoComplete(line, cmd);
        if (a.length === 0) return false;
        console.log("trying command", a[0]);
        return this.register.run(a[0], cmd.args, cmd);
      } else {
        return r;
      }
    };

    Base.prototype.t = Base.prototype.tryCommand;

    Base.prototype.autoComplete = function(line, cmd) {
      var distances, e, full, i, o, out, p, parts, str, _, _len;
      if (cmd == null) cmd = null;
      if (line[0] !== ex.SPLIT_CHAR) return [];
      if (cmd === null) cmd = this._resolveCommand(line);
      o = this.register.resolve(cmd.command);
      parts = cmd.command.split(ex.SPLIT_CHAR);
      out = [];
      distances = {};
      console.log(parts);
      for (i = 0, _len = parts.length; i < _len; i++) {
        p = parts[i];
        full = parts.slice(0, i + 1 || 9e9).join(ex.SPLIT_CHAR);
        o = this.register.resolve(full);
        if (o !== null) {
          for (e in o) {
            _ = o[e];
            if (e !== ex.DEFAULT_ACTION.slice(1) && e !== 'all') {
              str = [full, e];
              str = str.join(ex.SPLIT_CHAR);
              distances[str] = ex.Tools.levenshtein(line, str);
              if (!(distances[str] > ex.MAX_LEVEN_DISTANCE)) out.push(str);
            }
          }
        }
      }
      out = out.sort(function(a, b) {
        if (distances[a] > distances[b]) {
          return 1;
        } else if (distances[b] > distances[a]) {
          return -1;
        } else {
          return 0;
        }
      });
      return out;
    };

    Base.prototype.a = Base.prototype.autoComplete;

    Base.prototype._resolveCommand = function(line) {
      var cmd;
      console.log("command:", line);
      if (line[0] !== ex.SPLIT_CHAR) line = [ex.DEFAULT_ACTION, line].join(" ");
      cmd = (new ex.CommandParser(line)).parseLine();
      ex.Tools.merge(cmd, ex.Tools.clone(this.defaultCmd, false), false);
      cmd.basicCmd = {
        cmd: cmd.command,
        args: cmd.args
      };
      return cmd;
    };

    return Base;

  })();

}).call(this);
