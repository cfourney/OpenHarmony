//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oSignal class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for $.oSignal.
 * @name        $.oSignal
 * @classdesc
 * A Qt like custom signal that can be defined, connected and emitted.
 * As this signal is not actually threaded, the connected callbacks will be executed
 * directly when the signal is emited, and the rest of the code will execute after.
 * @constructor
 */
function oSignal(type){
  // this.emitType = type;
  this.connexions = [];
  this.blocked = false;
}


/**
 * Register the calling object and the slot.
 * @param {object} context
 * @param {function} slot
 */
oSignal.prototype.connect = function (context, slot){
  // support slot.connect(callback) synthax
  if (typeof slot === 'undefined'){
    var slot = context;
    var context = null;
  }
  this.connexions.push ({context: context, slot:slot});
}


/**
 * Remove a connection registered with this Signal.
 * @param {function} [slot] the function to disconnect from the signal. If not specified, all connexions will be removed.
 */
oSignal.prototype.disconnect = function(slot){
  if (typeof slot === "undefined"){
    this.connexions = [];
    return
  }

  for (var i in this.connexions){
    if (this.connexions[i].slot == slot){
      this.connexions.splice(i, 1);
    }
  }
}


/**
 * Call the slot function using the provided context and and any arguments.
 */
oSignal.prototype.emit = function () {
  if (this.blocked) return;

  // if (!(value instanceof this.type)){ // can't make it work for primitives, might try to fix later?
  //   throw new error ("Signal can't emit type "+ (typeof value) + ". Must be : " + this.type)
  // }

  var args = [];
  for (var i=0; i<arguments.length; i++){
    args.push(arguments[i]);
  }

  this.$.debug("emiting signal with "+ args, this.$.DEBUG_LEVEL.LOG);

  for (var i in this.connexions){
    var context = this.connexions[i].context;
    var slot = this.connexions[i].slot;

    // support connecting signals to each other
    if (slot instanceof this.$.oSignal){
      slot.emit.apply(context, args)
    }else{
      slot.apply(context, args);
    }
  }
}


oSignal.prototype.toString = function(){
  return "Signal";
}


exports.oSignal = oSignal;