
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//   $.oTransformSwitchNode class   //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oNode = require("./oNode.js");

/**
 * Constructor for the $.oTransformSwitchNode class
 * @classdesc
 * $.oTransformSwitchNode is a subclass of $.oNode and implements the same methods and properties as $.oNode. <br>
 * It represents transform switches in the scene.
 * @constructor
 * @augments   $.oNode
 * @param   {string}         path            Path to the node in the network.
 * @param   {oScene}         oSceneObject    Access to the oScene object of the DOM.
 * @property {$.oTransformNamesObject} names An array-like object with static indices (starting at 0) for each transformation name, which can be retrieved/set directly.
 * @example
 * // Assuming the existence of a Deformation group applied to a 'Drawing' node at the root of the scene
 * var myNode = $.scn.getNodeByPath("Top/Deformation-Drawing/Transformation-Switch");
 *
 * myNode.names[0] = "B";                              // setting the value for the first transform drawing name to "B"
 *
 * var drawingNames = ["A", "B", "C"]                  // example of iterating over the existing names to set/retrieve them
 * for (var i in myNode.names){
 *   $.log(i+": "+myNode.names[i]);
 *   $.log(myNode.names[i] = drawingNames[i]);
 * }
 *
 * $.log("length: " + myNode.names.length)             // the number of names
 * $.log("names: " + myNode.names)                     // prints the list of names
 * $.log("indexOf 'B': " + myNode.names.indexOf("B"))  // can use methods from Array
 */
function oTransformSwitchNode ( path, oSceneObject ) {
  if (node.type(path) != 'TransformationSwitch') throw "'path' parameter ("+path+") must point to a 'TransformationSwitch' type node. Got: "+node.type(path);
  var instance = this.$.oNode.call( this, path, oSceneObject );
  if (instance) return instance;

  this._type = 'transformSwitchNode';
  this.names = new this.$.oTransformNamesObject(this);
}
oTransformSwitchNode.prototype = Object.create( oNode.prototype );
oTransformSwitchNode.prototype.constructor = oTransformSwitchNode;


/**
 * @private
 */
oTransformSwitchNode.prototype.refreshNames = function(){
  this.refreshAttributes();
  this.names.refresh();
}


exports = oTransformSwitchNode;