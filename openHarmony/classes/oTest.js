

/**
 * The constructor for $.oTest.
 * @classdesc
 * The base Class that contains the testing logic used by openHarmony tests for internal development to ensure library functionality
 * @constructor
 * @example
 * // To run the test, copy paste these lines into the harmony sandbox
 * include("openHarmony.js")
 *
 * // tests are described in the files contained in the /tests folder
 * $.tests.run()
 */
function oTest(params){
  this.assert(typeof (params.message), 'string', '"message" argument must be a string');
  this.assert(typeof (params.prepare), 'function', '"prepare" argument must be a function');
  this.assert(typeof (params.run), 'function', '"run" argument must be a function');
  this.assert(typeof (params.check), 'function', '"check" argument must be a function');

  this.params = params
}

// member of the oTest class
oTest.errors = [];

oTest.prototype.execute = function(){
  MessageLog.trace(" Test : "+this.params.message);
  try{
    this.params.prepare();
    this.params.run();
    this.params.check();
    MessageLog.trace(" Test : "+this.params.message + " passed successfully");
  }catch(e){
    MessageLog.trace(" Test : "+this.params.message + " failed : "+e)
    oTest.errors.push(" Test : "+this.params.message + " failed : "+e)
  }
}

/**
 * pythonic "assert" function to check a variable against an expected value and throw a custom error if not correct
 * @param   {any}      variable      the variable tested
 * @param   {any}      value         the expected value
 * @param   {string}   message       a message that will be printed in the error thrown if the variable value isn't correct
 */
oTest.prototype.assert = require("../tests/assert.js")


/**
 * Classmethod to report all errors at once
 */
oTest.reportErrors = function(){
  if (oTest.errors.length != 0){
    MessageLog.trace("========== Following errors occured: =========")
    oTest.errors.forEach(function(x){
      MessageLog.trace(x)
    })
  } else {
    MessageLog.trace("========== All tests passed successfully =========")
  }
  oTest.errors = []; // flush errors buffer
}

exports.oTest = oTest;
