function run() {
  var tests = require("./tests.js");
  for (var i in tests){
    tests[i].execute()
  }
}

exports.run = run