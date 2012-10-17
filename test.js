var Cmd = require("./jscmds.js");
var b = new Cmd.Base();

b.register.add('.', {
  echo: function(){ return this.args.join(' '); },
  defaultAction: function() {
    search = this.args.join(' ');
    console.log("searching for", search, "...");
    return;
  },
  string_tests: {
    deeper: "hi",
    watermelons: "nooooo",
    test: function() { return this.exc.r('.string_tests.no'); }
  }
});

console.log(b.r('.echo foo bar'));

console.log(b.a('.string_tests.n'))

console.log(b.r('.string_tests.no "{\\"lol\\": \\"hi\\"}" JSON'))
no = b.r('.string_tests.no')
console.log(no, typeof no)
console.log(b.r('.string_tests.test'))

//

var b2 = new Cmd.Base();

b2.register.add(".", {
    echo: function(){ return arguments[0]; },
    data: {
        watermelons: "yummy",
        foo: "bar",
        pancakes: "syrup",
        water: "hi"
    }
})

console.log(b2.autoComplete(".data.watermel"))

//

var b3 = new Cmd.Base({ hello: "world" });

b3.register.add(".test", {
  echo: function(){ return this.args.join(" "); },
  access: function(){ return this.hello; }
});

console.log(b3.r('.test.echo helo'))
console.log(b3.r('.test.access'))

//

var b4 = new Cmd.Base()

Cmd.SPLIT_CHAR = "/"

b4.register.add("/", {
  echo: function(){ return this.args.join(" "); },
  test: {
    lolz: "hi"
  }
})

console.log(b4.r("/echo hello world"))
console.log(b4.r("/test/lolz"))
