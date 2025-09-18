function run() {
  var tests = require("./tests.js");
  for (var i in tests.tests){
    tests.tests[i].execute()
  }
  tests.reportErrors();
}

exports.run = run