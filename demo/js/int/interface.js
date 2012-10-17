(function() {
  var ex;

  ex = window.Interface = {};

  ex.Logger = (function() {

    function Logger(base) {
      this.base = base;
    }

    Logger.prototype.log = function(data, className) {
      var e;
      if (className == null) className = 'log';
      if (this.base.inHistoryMode) return;
      e = $(["<div class='entry log ", className, "' id='", this._generateId(), "' />"].join(''));
      e.text(data);
      console.log("logging", e.text());
      this.base.elements.above.append(e);
      return setTimeout((function(el) {
        el.fadeOut(1000);
        return setTimeout((function(el) {
          return el.remove();
        }), 1000, el);
      }), 1000, e);
    };

    Logger.prototype.error = function(data) {
      return this.log(data, 'error');
    };

    Logger.prototype._generateId = function() {
      return atob(Math.round(Math.random() * 4000));
    };

    return Logger;

  })();

  ex.Base = (function() {

    function Base() {
      this.elements = {
        input: $("#cmd"),
        center: $("div.center"),
        above: $("div.center div.above"),
        below: $("div.center div.below")
      };
      this._bindElements();
      this.console = new ex.Logger(this);
      this.inHistoryMode = false;
      this.historyPos = 0;
    }

    Base.prototype.inputChange = function() {
      var a, i, m, n, v, _len, _results;
      v = this.elements.input.val();
      if (v.length === 0) return console.log("v.length:", v.length);
      if (this.inHistoryMode) this._setHistoryMode(false, false);
      a = cmdInstance.a(v).slice(0, 6);
      this.elements.below.children().remove();
      _results = [];
      for (i = 0, _len = a.length; i < _len; i++) {
        n = a[i];
        m = cmdInstance.manual.find(n);
        n = this._HTMLEscape(n);
        if (n.indexOf(v) > -1) {
          n = n.replace(v, ["<span class='b'>", this._HTMLEscape(v), "</span>"].join(''));
        }
        _results.push(this.elements.below.append(['<div class="entry"><span class="cmd">', n, '</span><span class="man_entry">', this._HTMLEscape(m), '</span>', '</div>'].join('')));
      }
      return _results;
    };

    Base.prototype.inputSubmit = function() {
      var line, r;
      console.log("INSIDE INPUT_SUBMIT");
      line = this.elements.input.val();
      this.elements.input.val('');
      if (this.inHistoryMode) this._setHistoryMode(false);
      r = cmdInstance.r(line);
      if (r === false && cmdInstance.register.errno > 0) {
        return this.console.error(cmdInstance.register.resolveError());
      } else if (r !== null) {
        return this.console.log(r);
      }
    };

    Base.prototype.historyMode = function(up) {
      var backEl, current, e, frontEl, reversePos, _i, _j, _len, _len2, _results;
      if (this.inHistoryMode) this.historyPos += up ? 1 : -1;
      this._setHistoryMode(true);
      reversePos = (cmdInstance.history.length - 1) - this.historyPos;
      if (reversePos < 0) {
        reversePos = 0;
        this.historyPos -= 1;
      }
      backEl = cmdInstance.history.slice((reversePos - 6 < 0 ? 0 : reversePos - 6), (reversePos - 1 < 0 ? 0 : reversePos - 1) + 1 || 9e9);
      if (reversePos === 0) backEl.pop();
      current = cmdInstance.history[reversePos];
      frontEl = cmdInstance.history.slice(reversePos + 1, (reversePos + 6) + 1 || 9e9);
      console.log(backEl, current, frontEl, reversePos, this.historyPos);
      if (current === void 0) return this._setHistoryMode(false);
      for (_i = 0, _len = backEl.length; _i < _len; _i++) {
        e = backEl[_i];
        this.elements.above.append("<div class='entry'>" + (this._HTMLEscape(this._joinCommand(e))) + "</div>");
      }
      this.elements.input.val(this._joinCommand(current));
      _results = [];
      for (_j = 0, _len2 = frontEl.length; _j < _len2; _j++) {
        e = frontEl[_j];
        _results.push(this.elements.below.append("<div class='entry'>" + (this._HTMLEscape(this._joinCommand(e))) + "</div>"));
      }
      return _results;
    };

    Base.prototype._bindElements = function() {
      return this.elements.input.on('keyup', this, function(event) {
        console.log(event.which);
        if (event.which === 13) {
          return event.data.inputSubmit();
        } else if (event.which === 38 || event.which === 40) {
          return event.data.historyMode(event.which === 38 ? true : false);
        } else {
          console.log("going to inputChange");
          return event.data.inputChange();
        }
      });
    };

    Base.prototype._setHistoryMode = function(v, cI) {
      if (cI == null) cI = true;
      if (v) {
        this.inHistoryMode = true;
        this._clearElements(cI);
        return this.elements.center.addClass('history_mode');
      } else {
        this.inHistoryMode = false;
        this.historyPos = 0;
        this._clearElements(cI);
        return this.elements.center.removeClass('history_mode');
      }
    };

    Base.prototype._joinCommand = function(c) {
      var a, str, _i, _len, _ref;
      str = new Cmd.StringBuffer(c.cmd);
      _ref = c.args;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        str.push(a);
      }
      return str.toString(' ');
    };

    Base.prototype._clearElements = function(clearInput) {
      if (clearInput == null) clearInput = true;
      this.elements.above.children().remove();
      this.elements.below.children().remove();
      if (clearInput) return this.elements.input.val('');
    };

    Base.prototype._HTMLEscape = function(t) {
      var r, _i, _len, _ref;
      _ref = this._HTMLMap;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        r = _ref[_i];
        t = t.replace(r[0], r[1]);
      }
      return t;
    };

    Base.prototype._HTMLMap = [[/&/g, "&amp;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/"/g, "&quot;"]];

    console.log("events bound");

    return Base;

  })();

}).call(this);
