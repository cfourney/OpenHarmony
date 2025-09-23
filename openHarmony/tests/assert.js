exports = function(variable, value, message){
  if (typeof message === 'undefined') var message = '';
  if (variable != value) throw new Error(message + " : expected " + value + ", got " + variable + ".");
}