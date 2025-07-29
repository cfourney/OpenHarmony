

exports.debug_level = 0

/**
 * Enum to set the debug level of debug statements.
 * @name    $#DEBUG_LEVEL
 * @enum
 */
exports.DEBUG_LEVEL = {
  'ERROR'   : 0,
  'WARNING' : 1,
  'LOG'     : 2
}

/**
 * The standard debug that uses logic and level to write to the messagelog. Everything should just call this to write internally to a log in OpenHarmony.
 * @function
 * @name    $#debug
 * @param   {obj}   obj            Description.
 * @param   {int}   level          The debug level of the incoming message to log.
 */
exports.debug = function( obj, level ){
  if( level > this.debug_level ) return;

  try{
    if (typeof obj !== 'object') throw new Error();
    this.log(JSON.stringify(obj));
  }catch(err){
    this.log(obj);
  }
}


/**
 * Log the string to the MessageLog.
 * @function
 * @name    $#log
 * @param {string}  str            Text to log.
 */
exports.log = function( str ){
  MessageLog.trace( str );
  System.println( str );
}


/**
 * Log the object and its contents.
 * @function
 * @name    $#logObj
 * @param   {object}   object            The object to log.
 * @param   {int}      debugLevel        The debug level.
 */
exports.logObj = function( object ){
  for (var i in object){
    try {
      if (typeof object[i] === "function") continue;
      exports.log(i+' : '+object[i])
      if (typeof object[i] == "Object"){
        exports.log(' -> ')
        exports.logObj(object[i])
        exports.log(' ----- ')
      }
    }catch(error){}
  }
}
