//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oNodeTypes class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oNodeTypes class
 * @classdesc
 * repository of types for each node type of Harmony.
 * Stores modified copies of oNode prototypes for each subtype of node available in harmony,
 * with attributes getter setters created for each node type.
 * @constructor
 * @param   {string}         path                          Path to the node in the network.
 * @param   {$.oScene}         [oSceneObject]                  Access to the oScene object of the DOM.
 * @see NodeType
 */
function oNodeTypes (){
  this.types = {};
}


/**
 * Gets the prototype for the given node, from a cache, or create it dynamically on first access
 * @param {string} path
 * @returns object
 * @private
 */
oNodeTypes.prototype.getPrototype = function(nodePath) {
  var typeName = node.type(nodePath);
  if (!typeName) throw new Error("Path "+nodePath+" doesn't point to an existing node");

  var typeProto = this.types[typeName];

  if (!typeProto) {
    var _type;
    switch(typeName){
      case "READ" :
        _type = this.$.oDrawingNode;
        break;
      case "PEG" :
        _type = this.$.oPegNode;
        break;
      case "COLOR_OVERRIDE_TVG" :
        _type = this.$.oColorOverrideNode;
        break;
      case "TransformationSwitch" :
        _type = this.$.oTransformSwitchNode;
        break;
      case "GROUP" :
        _type = this.$.oGroupNode;
        break;
      default:
        _type = this.$.oNode;
    }

    // creating a new custom class for this type to receive getter/setters, inheriting from the correct oNode subclass
    var Class = function(){
      var _class = function(nodePath){
        _type.call(this, nodePath);
      };
      _class.prototype = Object.create(_type.prototype);
      _class.toString = _type.toString; // toString is created dynamically on each class during loading to create obfuscation
      return _class;
    }();

    var _attributesList = node.getAttrList( nodePath, 1);
    for (var i in _attributesList){
      var attr = new this.$.oAttribute(null, _attributesList[i]);
      attr.createGetterSetter(Class.prototype);
    }

    this.types[typeName] = Class;
  }

  return this.types[typeName];
}


/**
 * Creates and returns a oNode subclass instance to wrap a given node
 * @param {string} nodePath    the path of the node in the scene
 * @returns {$.oNode}          the created instance.
 */
oNodeTypes.prototype.getInstance = function(nodePath) {
  var typeClass = this.getPrototype(nodePath);
  return new typeClass(nodePath);
}


exports.oNodeTypes = oNodeTypes;