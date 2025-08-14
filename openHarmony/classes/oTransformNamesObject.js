
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//   $.oTransformNameObject class   //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * Constructor for the $.oTransformNamesObject class
 * @classdesc
 * $.oTransformNamesObject is an array like object with static length that exposes getter setters for
 * each transformation name used by the oTransformSwitchNode. It can use the same methods as any array.
 * @constructor
 * @param {$.oTransformSwitchNode} instance the transform Node instance using this object
 * @property {int} length the number of valid elements in the object.
 */
function oTransformNamesObject (transformSwitchNode){
  Object.defineProperty(this, "transformSwitchNode", {
    enumerable:false,
    get: function(){
      return transformSwitchNode;
    },
  })

  this.refresh();
}
oTransformNamesObject.prototype = Object.create(Array.prototype);


/**
 * creates a $.oTransformSwitch.names property with an index for each name to get/set the name value
 * @private
 */
Object.defineProperty(oTransformNamesObject.prototype, "createGetterSetter", {
  enumerable:false,
  value: function(index){
    var attrName = "transformation_" + (index+1);
    var transformNode = this.transformSwitchNode;

    Object.defineProperty(this, index, {
      enumerable:true,
      configurable:true,
      get: function(){
        return transformNode.transformationnames[attrName];
      },
      set: function(newName){
        newName = newName+""; // convert to string
        this.$.debug("setting "+attrName+" to drawing "+newName+" on "+transformNode.path, this.$.DEBUG_LEVEL.DEBUG)
        if (newName instanceof this.$.oDrawing) newName = newName.name;
        transformNode.transformationnames[attrName] = newName;
      }
    })
  }
})


/**
 * The length of the array of names on the oTransformSwitchNode node. Corresponds to the transformationnames.size subAttribute.
 * @name $.oTransformNamesObject#length
 * @type {int}
 */
 Object.defineProperty(oTransformNamesObject.prototype, "length", {
  enumerable:false,
  get: function(){
    return this.transformSwitchNode.transformationnames.size;
  },
})


/**
 * A string representation of the names list
 * @private
 */
Object.defineProperty(oTransformNamesObject.prototype, "toString", {
  enumerable:false,
  value: function(){
    return this.join(",");
  }
})


/**
 * @private
 */
Object.defineProperty(oTransformNamesObject.prototype, "refresh", {
  enumerable:false,
  value:function(){
    for (var i in this){
      delete this[i];
    }
    for (var i=0; i<this.length; i++){
      this.createGetterSetter(i);
    }
  }
})

exports.oTransformNamesObject = oTransformNamesObject;