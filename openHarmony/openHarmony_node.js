//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library
//
//
//         Developped by Mathieu Chaptel, Chris Fourney
//
//
//   This library is an open source implementation of a Document Object Model
//   for Toonboom Harmony. It also implements patterns similar to JQuery
//   for traversing this DOM.
//
//   Its intended purpose is to simplify and streamline toonboom scripting to
//   empower users and be easy on newcomers, with default parameters values,
//   and by hiding the heavy lifting required by the official API.
//
//   This library is provided as is and is a work in progress. As such, not every
//   function has been implemented or is garanteed to work. Feel free to contribute
//   improvements to its official github. If you do make sure you follow the provided
//   template and naming conventions and document your new methods properly.
//
//   This library doesn't overwrite any of the objects and classes of the official
//   Toonboom API which must remains available.
//
//   This library is made available under the Mozilla Public license 2.0.
//   https://www.mozilla.org/en-US/MPL/2.0/
//
//   The repository for this library is available at the address:
//   https://github.com/cfourney/OpenHarmony/
//
//
//   For any requests feel free to contact m.chaptel@gmail.com
//
//
//
//
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

include(specialFolders.resource+"/scripts/TB_orderNetworkUp.js"  );
include(specialFolders.userScripts+"/TB_orderNetworkUp.js");       // for older versions of harmony

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           $.oNode class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


//TODO: Smart pathing, network movement, better duplication handling
//TODO: Metadata, settings, aspect, camera peg, view.
//TODO: group's multi-in-ports, multi-out-port modules

/**
 * Constructor for $.oNode class
 * @classdesc
 * The oNode class represents a node in the Harmony scene. <br>
 * It holds the value of its position in the node view, and functions to link to other nodes, as well as set the attributes of the node.<br>
 * @constructor
 * @param   {string}         path                          Path to the node in the network.
 * @param   {$.oScene}         [oSceneObject]                  Access to the oScene object of the DOM.
 * @see NodeType
 * @example
 * // To grab a node object from the scene, it's possible to create a new node object by calling the constructor:
 * var myNode = new $.oNode("Top/Drawing", $.scn)
 *
 * // However, most nodes will be grabbed directly from the scene object.
 * var doc = $.scn
 * var nodes = doc.nodes;                   // grabs the list of all the nodes in the scene
 *
 * // It's possible to grab a single node from the path in the scene
 * var myNode = doc.getNodeByPath("Top/Drawing")
 * var myNode = doc.$node("Top/Drawing")    // short synthax but same function
 *
 * // depending on the type of node, oNode objects returned by these functions can actually be an instance the subclasses
 * // oDrawingNode, oGroupNode, oPegNode...
 *
 * $.log(myNode instanceof $.oNode)           // true
 * $.log(myNode instanceof $.oDrawingNode)  // true
 *
 * // These other subclasses of nodes have other methods that are only shared by nodes of a certain type.
 *
 * // Not documented in this class, oNode objects have attributes which correspond to the values visible in the Layer Properties window.
 * // The attributes values can be accessed and set by using the dot notation on the oNode object:
 *
 * myNode.can_animate = false;
 * myNode.position.separate = true;
 * myNode.position.x = 10;
 *
 * // To access the oAttribute objects in the node, call the oNode.attributes object that contains them
 *
 * var attributes = myNode.attributes;
 */
$.oNode = function( path, oSceneObject ){
    this._path = path;
    this.type  = node.type(this.path);
    this.scene = (typeof oSceneObject === 'undefined')?this.$.scene:oSceneObject;

    this._type = 'node';

    this.refreshAttributes();
}


/**
 * Initialize the attribute cache.
 * @private
 */
$.oNode.prototype.attributesBuildCache = function (){
  //Cache time can be used at later times, to check for auto-rebuild of caches. Not yet implemented.
  this._cacheTime = (new Date()).getTime();

  var _attributesList = node.getAttrList( this.path, 1 );
  var _attributes = {};

  for (var i in _attributesList){

      var _attribute = new this.$.oAttribute(this, _attributesList[i]);
      var _keyword = _attribute.keyword;

      _attributes[_keyword] = _attribute;
  }

  this._attributes_cached = _attributes;
}


/**
 * Private function to create attributes setters and getters as properties of the node
 * @private
 * @return  {void}   Nothing returned.
 */
$.oNode.prototype.setAttrGetterSetter = function (attr, context){
    if (typeof context === 'undefined') context = this;
    // this.$.debug("Setting getter setters for attribute: "+attr.keyword+" of node: "+this.name, this.$.DEBUG_LEVEL.LOG)

    var _keyword = attr.shortKeyword;

    // MC Note : this seems to break the subattributes getter setter ?
    // if( typeof( this[_keyword] ) !== 'undefined' ){
      // Already exists in properties.
      // return;
    // }

    Object.defineProperty( context, _keyword, {
        enumerable : false,
        configurable : true,
        get : function(){
            // MessageLog.trace("getting attribute "+attr.keyword+". animated: "+(attr.column != null))
            var _subAttrs = attr.subAttributes;
            if (_subAttrs.length == 0){
                // if attribute has animation, return the frames
                if (attr.column != null) return attr.frames;
                // otherwise return the value
                var _value =  attr.getValue();
            }else{
                // if there are subattributes, create getter setters for each on the returned object
                var _value = (attr.column != null)?new this.$.oList(attr.frames, 1):attr.getValue();
                for (var i in _subAttrs){
                    this.setAttrGetterSetter( _subAttrs[i], _value );
                }
            }
            return _value;
        },

        set : function(newValue){
            // this.$.debug("setting attribute through getter setter "+attr.keyword+" to value: "+newValue, this.$.DEBUG_LEVEL.LOG)
            // if attribute has animation, passed value must be a frame object
            var _subAttrs = attr.subAttributes;

            if (_subAttrs.length == 0){
                if (attr.column != null) {
                    if (!(newValue instanceof oFrame)) {
                        // throw new Error("must pass an oFrame object to set an animated attribute")
                        // fallback to set frame 1
                        newValue = {value:newValue, frameNumber:1};
                    }
                    attr.setValue(newValue.value, newValue.frameNumber)
                }else{
                    return attr.setValue(newValue)
                }
            }else{
                var _frame = 1;
                var _value = newValue;
                // dealing with value being an object with frameNumber for animated values
                if (attr.column != null) {
                    if (!(newValue instanceof oFrame)) {
                        // throw new Error("must pass an oFrame object to set an animated attribute")
                        // fallback to set frame 1
                        newValue = {value:newValue, frameNumber:1};
                    }

                    _frame = newValue.frameNumber;
                    _value = newValue.value;
                }

                for (var i in _subAttrs){
                    // ignore the getter setters by setting each subAttr individually, and only set the ones that exist in the provided object
                    var _keyword = _subAttrs[i].shortKeyword;
                    if (_value.hasOwnProperty(_keyword)) _subAttrs[i].setValue(_value[_keyword], _frame);
                }
            }
        }
    });
};


/**
 * The derived path to the node.
 * @deprecated use oNode.path instead
 * @name $.oNode#fullPath
 * @type {string}
 */
Object.defineProperty($.oNode.prototype, 'fullPath', {
    get : function( ){
      return this._path;
    },

    set : function( str_path ){
      //A move and rename might be in order. . .  Manage this here.

      this.$.debug( "ERROR - Setting oNode.fullPath is not supported yet: " + this._path, this.$.DEBUG_LEVEL.WARNING );
      //throw "ERROR - changing the path is not supported yet."
    }
});


/**
 * The derived path to the node.
 * @name $.oNode#path
 * @type {string}
 */
Object.defineProperty($.oNode.prototype, 'path', {
    get : function( ){
      return this._path;
    },

    set : function( str_path ){
      //A move and rename might be in order. . .  Manage this here.

      this.$.debug( "ERROR - Setting oNode.path is not supported yet: " + this._path, this.$.DEBUG_LEVEL.WARNING );
      //throw "ERROR - changing the path is not supported yet."
    }
});


/**
 * The type of the node.
 * @name $.oNode#type
 * @readonly
 * @type {string}
 */
Object.defineProperty( $.oNode.prototype, 'type', {
    get : function( ){
      return node.type( this.path );
    }
});


/**
 * Is the node a group?
 * @name $.oNode#isGroup
 * @type {bool}
 */
Object.defineProperty($.oNode.prototype, 'isGroup', {
    get : function( ){
      if( this.root ){
        //in a sense, its a group.
        return true;
      }

      return node.isGroup( this.path );
    },

    set : function( bool_exist ){
    }
});


/**
 * The $.oNode objects contained in this group. This is deprecated and was moved to oGroupNode
 * @DEPRECATED Use oGroupNode.children instead.
 * @name $.oNode#children
 * @type {$.oNode[]}
 */
Object.defineProperty($.oNode.prototype, 'children', {
    get : function( ){
      if( !this.isGroup ){ return []; }

      var _children = [];
      var _subnodes = node.subNodes( this.path );
      for( var n=0; n<_subnodes.length; n++ ){
        _children.push( this.scene.getNodeByPath( _subnodes[n] ) );
      }

      return _children;
    },

    set : function( arr_children ){
      //Consider a way to have this group adopt the children, move content here?
      //this may be a bit tough to extend.
    }
});


/**
 * Does the node exist?
 * @name $.oNode#exists
 * @type {bool}
 */
Object.defineProperty($.oNode.prototype, 'exists', {
    get : function(){
      if( this.type ){
        return true;
      }else{
        return false;
      }
    }
});


/**
 * Is the node selected?
 * @name $.oNode#selected
 * @type {bool}
 */
Object.defineProperty($.oNode.prototype, 'selected', {
    get : function(){
      for( var n=0;n<selection.numberOfNodesSelected;n++ ){
          if( selection.selectedNode(n) == this.path ){
            return true;
          }
      }

      return false;
    },

    //Add it to the selection.
    set : function( bool_exist ){
      if( bool_exist ){
        selection.addNodeToSelection( this.path );
      }else{
        selection.removeNodeFromSelection( this.path );
      }
    }

});


/**
 * The node's name.
 * @name $.oNode#name
 * @type {string}
 */
Object.defineProperty($.oNode.prototype, 'name', {
  get : function(){
     return node.getName(this.path);
  },

  set : function(newName){
    var _parent = node.parentNode(this.path);
    var _node = node.rename(this.path, newName);
    this._path = _parent+'/'+newName;
  }
});


/**
 * The group containing the node.
 * @name $.oNode#group
 * @readonly
 * @type {oGroupNode}
 */
Object.defineProperty($.oNode.prototype, 'group', {
    get : function(){
         return this.scene.getNodeByPath( node.parentNode(this.path) )
    }/*,

    // moved this into its own function oNode.moveToGroup()
    set : function(newPath){
        if (newPath instanceof oGroupNode) newPath = newPath.path;
        // TODO: make moveNode() method?
        var _name = this.name;
        node.moveToGroup(this.path, newPath);
        this.path = newPath + '/' + _name;
    }*/
});


/**
 * The $.oNode object for the parent in which this node exists.
 * @name $.oNode#parent
 * @readonly
 * @type {$.oNode}
 */
Object.defineProperty( $.oNode.prototype, 'parent', {
    get : function(){
      if( this.root ){ return false; }

      return this.scene.getNodeByPath( node.parentNode( this.path ) );
    }/*,

    set : function(newPath){
        // TODO: make moveNode() method?
    }*/
});


/**
 * Is the node enabled?
 * @name $.oNode#enabled
 * @type {bool}
 */
Object.defineProperty($.oNode.prototype, 'enabled', {
    get : function(){
         return node.getEnable(this.path)
    },

    set : function(enabled){
         node.setEnable(this.path, enabled)
    }
});


/**
 * Is the node locked?
 * @name $.oNode#locked
 * @type {bool}
 */
Object.defineProperty($.oNode.prototype, 'locked', {
    get : function(){
         return node.getLocked(this.path)
    },

    set : function(locked){
         node.setLocked(this.path, locked)
    }
});


/**
 * Is the node the root?
 * @name $.oNode#isRoot
 * @readonly
 * @type {bool}
 */
Object.defineProperty($.oNode.prototype, 'isRoot', {
    get : function(){
         return this.path == "Top"
    }
});


/**
 * The position of the node.
 * @name $.oNode#nodePosition
 * @type {oPoint}
 */
Object.defineProperty($.oNode.prototype, 'nodePosition', {
    get : function(){
      var _z = 0.0;
      try{ _z = node.coordZ(this.path); } catch( err ){this.$.debug("setting coordZ not implemented in Harmony versions before 17.", this.$.DEBUG_LEVEL.ERROR)}
      return new this.$.oPoint(node.coordX(this.path), node.coordY(this.path), _z );
    },

    set : function(newPosition){
        node.setCoord(this.path, newPosition.x, newPosition.y, newPosition.y);
    }
});


/**
 * The horizontal position of the node in the node view.
 * @name $.oNode#x
 * @type {float}
 */
Object.defineProperty($.oNode.prototype, 'x', {
    get : function(){
         return node.coordX(this.path)
    },

    set : function(x){
        var _pos = this.nodePosition;
        node.setCoord(this.path, x, _pos.y)
    }
});


/**
 * The vertical position of the node in the node view.
 * @name $.oNode#y
 * @type {float}
 */
Object.defineProperty($.oNode.prototype, 'y', {
    get : function(){
         return node.coordY(this.path)
    },

    set : function(y){
        var _pos = this.nodePosition;
        node.setCoord(this.path, _pos.x, y)
    }
});


/**
 * The depth position of the node in the node view.
 * @name $.oNode#z
 * @type {float}
 */
Object.defineProperty($.oNode.prototype, 'z', {
    get : function(){
        var _z = 0.0;
        try{ _z = node.coordZ(this.path); } catch( err ){ this.$.debug("setting coordZ not implemented in Harmony versions before 17.", this.$.DEBUG_LEVEL.ERROR)}

        return _z;
    },

    set : function(z){
        var _pos = this.nodePosition;
        node.setCoord( this.path, _pos.x, _pos.y, z );
    }
});


/**
 * The width of the node in the node view.
 * @name $.oNode#width
 * @readonly
 * @type {float}
 */
Object.defineProperty($.oNode.prototype, 'width', {
    get : function(){
         return node.width(this.path)
    }
});



/**
 * The height of the node in the node view.
 * @name $.oNode#height
 * @readonly
 * @type {float}
 */
Object.defineProperty($.oNode.prototype, 'height', {
    get : function(){
         return node.height(this.path)
    }
});



/**
 * The list of oNodeLinks objects descibing the connections to the inport of this node, in order of inport.
 * @name $.oNode#inLinks
 * @readonly
 * @type {$.oNodeLink[]}
 */
Object.defineProperty($.oNode.prototype, 'inLinks', {
    get : function(){
        var nodeRef = this;
        var newList = new this.$.oList( [], 0, node.numberOfInputPorts(this.path),
                                           function( listItem, index ){ return new this.$.oNodeLink( false, false, nodeRef, index, false ); },
                                           function(){ throw new ReferenceError("Unable to set inLinks"); },
                                           false
                                         );
        return newList;
    }
});


/**
 * The list of nodes connected to the inport of this node, in order of inport.
 * @name $.oNode#inNodes
 * @readonly
 * @type {$.oNode[]}
*/
Object.defineProperty($.oNode.prototype, 'inNodes', {
    get : function(){
        var _inNodes = [];
        var _inPorts = this.inPorts;
        // TODO: ignore/traverse groups
        for (var i = 0; i < _inPorts; i++){
            var _node = this.getLinkedInNode(i);
            if (_node != null) _inNodes.push(_node)
        }
        return _inNodes;
    }
});


/**
 * The number of link ports on top of the node, connected or not.
 * @name $.oNode#inPorts
 * @readonly
 * @type {int}
*/
Object.defineProperty($.oNode.prototype, 'inPorts', {
  get : function(){
    return node.numberOfInputPorts(this.path);
  }
});


/**
 * The list of nodes connected to the outports of this node
 * @name $.oNode#outNodes
 * @readonly
 * @type {$.oNode[][]}
*/
Object.defineProperty($.oNode.prototype, 'outNodes', {
    get : function(){
        var _outNodes = [];
        var _outPorts = this.outPorts;

        for (var i = 0; i < _outPorts; i++){
            var _outLinks = [];
            var _outLinksNumber = this.getOutLinksNumber(i);
            for (var j = 0; j < _outLinksNumber; j++){
                var _node = this.getLinkedOutNode(i, j);

                if (_node != null) _outLinks.push(_node);
                // if (_node != null) _outNodes.push(_node);
            }

            //Always return the list of links for consistency.
            // _outNodes.push(_outLinks);


            // MCNote: move to concat so we always have a flat list?
            //Deprecated.
            // if (_outLinks.length > 1){
                _outNodes.push(_outLinks);
            // }else{
                // _outNodes = _outNodes.concat(_outLinks);
            // }
        }
        return _outNodes;
    }
});


/**
 * The number of link ports at the bottom of the node, connected or not.
 * @name $.oNode#outPorts
 * @readonly
 * @type {int}
*/
Object.defineProperty($.oNode.prototype, 'outPorts', {
  get : function(){
    return node.numberOfOutputPorts(this.path);
  }
});


/**
 * The list of oNodeLinks objects descibing the connections to the outports of this node, in order of outport.
 * @name $.oNode#outLinks
 * @readonly
 * @type {$.oNodeLink[]}
 */
Object.defineProperty($.oNode.prototype, 'outLinks', {
    get : function(){
        var nodeRef = this;

        var lookup_list = [];
        for (var i = 0; i < node.numberOfOutputPorts(this.path); i++){
          if( node.numberOfOutputLinks(this.path, i) > 0 ){
            for (var j = 0; j < node.numberOfOutputLinks(this.path, i); j++){
              lookup_list.push( [i,j] );
            }
          }else{
            lookup_list.push( [i,0] );
          }
        }

        var newList = new this.$.oList( [], 0, lookup_list.length,
                                           function( listItem, index ){ return new this.$.oNodeLink( nodeRef, lookup_list[index][0], false, false, lookup_list[index][1] ); },
                                           function(){ throw new ReferenceError("Unable to set inLinks"); },
                                           false
                                         );
        return newList;
    }
});


/**
 * The list of nodes connected to the inport of this node, in order of inport.
 * @name $.oNode#ins
 * @readonly
 * @type {$.oNode[]}
*/
Object.defineProperty($.oNode.prototype, 'ins', {
    get : function(){
      return this.inNodes;
    }
});


/**
 * The list of nodes connected to the outport of this node, in order of outport and links.
 * @name $.oNode#outs
 * @readonly
 * @type {$.oNode[][]}
*/
Object.defineProperty($.oNode.prototype, 'outs', {
    get : function(){
      return this.outNodes;
    }
});


/**
 * An object containing all attributes of this node.
 * @name $.oNode#attributes
 * @readonly
 * @type {oAttribute}
 * @example
 * // You can get access to the actual oAttribute object for a node parameter by using the dot notation:
 *
 * var myNode = $.scn.$node("Top/Drawing")
 * var drawingAttribute = myNode.attributes.drawing.element
 *
 * // from there, it's possible to set/get the value of the attribute, get the column, the attribute keyword etc.
 *
 * drawingAttribute.setValue ("1", 5);           // creating an exposure of drawing 1 at frame 5
 * var drawingColumn = drawingAttribute.column;  // grabbing the column linked to the attribute that holds all the animation
 * $.log(drawingAttribute.keyword);              // "DRAWING.ELEMENT"
 *
 * // for a more direct way to access an attribute, it's possible to also call:
 *
 * var drawingAttribute = myNode.getAttributeByName("DRAWING.ELEMENT");
*/
Object.defineProperty($.oNode.prototype, 'attributes', {
  get : function(){
      return this._attributes_cached;
  }
});


/**
 * The bounds of the node.
 * @name $.oNode#bounds
 * @readonly
 * @type {oBox}
*/
Object.defineProperty( $.oNode.prototype, 'bounds', {
  get : function(){
    return new this.$.oBox(this.x, this.y, this.x+this.width, this.y+this.height);
  }
});


/**
 * The linked columns associated with the node.
 * @name $.oNode#linkedColumns
 * @readonly
 * @type {oColumn[]}
*/
Object.defineProperty($.oNode.prototype, 'linkedColumns', {
  get : function(){
    var _attributes = this.attributes;
    var _columns = [];

    for (var i in _attributes){
      _columns = _columns.concat(_attributes[i].getLinkedColumns());
    }
    return _columns;
  }
})



/**
 * Whether the node can create new in-ports.
 * @name $.oNode#canCreateInPorts
 * @readonly
 * @type {bool}
*/
Object.defineProperty($.oNode.prototype, 'canCreateInPorts', {
  get : function(){
    return ["COMPOSITE",
            "GROUP",
            "MULTIPORT_OUT"]
            .indexOf(this.type) != -1;
  }
})


/**
 * Whether the node can create new out-ports.
 * @name $.oNode#canCreateOutPorts
 * @readonly
 * @type {bool}
*/
Object.defineProperty($.oNode.prototype, 'canCreateOutPorts', {
  get : function(){
    return ["GROUP",
            "MULTIPORT_IN"]
            .indexOf(this.type) != -1;
  }
})


/**
 * Returns the number of links connected to an in-port
 * @param   {int}      outPort      the number of the port to get links from.
 */
$.oNode.prototype.getInLinksNumber = function(inPort){
  if (this.inPorts < inPort) return null;
  return node.isLinked(this.path, inPort)?1:0;
}


/**
 * Returns the oLink object representing the connection of a specific inPort
 * @param   {int}      inPort      the number of the port to get links from.
 * @return  {$.oLink}  the oLink Object representing the link connected to the inport
 */
$.oNode.prototype.getInLink = function(inPort){
  if (this.inPorts < inPort) return null;
  var _info = node.srcNodeInfo(this.path, inPort);
  // this.$.log(this.path+" "+inPort+" "+JSON.stringify(_info))

  if (!_info) return null;

  var _inNode = this.scene.getNodeByPath(_info.node);
  var _inLink = new this.$.oLink(_inNode, this, _info.port, inPort, _info.link, true);

  // this.$.log("inLink: "+_inLink)
  return _inLink;
}


/**
 * Returns all the valid oLink objects describing the links that are connected into this node.
 * @return {$.oLink[]}  An array of $.oLink objects.
 */
$.oNode.prototype.getInLinks = function(){
  var _inPorts = this.inPorts;
  var _inLinks = [];

  for (var i = 0; i<_inPorts; i++){
    var _link = this.getInLink(i);
    if (_link != null) _inLinks.push(_link);
  }

  return _inLinks;
}


/**
 * Returns a free unconnected in-port
 * @param  {bool}  [createNew=true]  Whether to allow creation of new ports
 * @return {int} the port number that isn't connected
 */
$.oNode.prototype.getFreeInPort = function(createNew){
  if (typeof createNew === 'undefined') var createNew = true;

  var _inPorts = this.inPorts;

  for (var i=0; i<_inPorts; i++){
    if (this.getInLinksNumber(i) == 0) return i;
  }
  if (_inPorts == 0 && this.canCreateInPorts) return 0;
  if (createNew && this.canCreateInPorts) return _inPorts;
  this.$.debug("can't get free inPort for node "+this.path, this.$.DEBUG_LEVEL.ERROR);
  return null
}


/**
 * Links this node's inport to the given module, at the inport and outport indices.
 * @param   {$.oNode}   nodeToLink             The node to link this one's inport to.
 * @param   {int}       [ownPort]              This node's inport to connect.
 * @param   {int}       [destPort]             The target node's outport to connect.
 * @param   {bool}      [createPorts]          Whether to create new ports on the nodes.
 *
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.linkInNode = function( nodeToLink, ownPort, destPort, createPorts){

  var link = (new this.$.oLink(nodeToLink, this, destPort, ownPort)).getValidLink(createPorts, createPorts);
  if (link == null) return;
  this.$.debug("linking "+this.path+" to "+nodeToLink+" "+link._outPort+" "+link._inPort+" "+createPorts+" type: "+nodeToLink.type+" "+nodeToLink.inNodes.length, this.$.DEBUG_LEVEL.LOG);

  return link.connect();
};


/**
 * Searches for and unlinks the $.oNode object from this node's inNodes.
 * @param   {$.oNode}   oNodeObject            The node to link this one's inport to.
 * @return  {bool}    The result of the unlink.
 */
$.oNode.prototype.unlinkInNode = function( oNodeObject ){
  //CF Note: Should be able to define the port.
  var _node = oNodeObject.path;
  var _inPorts = this.inPorts;

  for (var i=0; i<_inPorts; i++){
    if (node.srcNode(this.path, i) == _node) return this.unlinkInPort(i);
  }
  return false;
};


/**
 * Unlinks a specific port from this node's inport.
 * @param   {int}       inPort                 The inport to disconnect.
 *
 * @return  {bool}    The result of the unlink, if successful.
 */
$.oNode.prototype.unlinkInPort = function( inPort ){
  // Default values for optional parameters
  if (typeof inPort === 'undefined') inPort = 0;

  return node.unlink( this.path, inPort );
};


/**
 * Returns the node connected to a specific in-port
 * @param   {int}      inPort      the number of the port to get the linked Node from.
 * @return  {int}    the number of links
 */
$.oNode.prototype.getLinkedInNode = function(inPort){
  if (this.inPorts < inPort) return null;
  return this.scene.getNodeByPath(node.srcNode(this.path, inPort));
}


/**
 * Returns the number of links connected to an outPort
 * @param   {int}      outPort      the number of the port to get links from.
 * @return  {int}    the number of links
 */
$.oNode.prototype.getOutLinksNumber = function(outPort){
  if (this.outPorts < outPort) return null;
  return node.numberOfOutputLinks(this.path, outPort);
}


/**
 * Returns the $.oLink object representing the connection of a specific outPort / link
 * @param   {int}      outPort      the number of the port to get the link from.
 * @param   {int}      [outLink]    the index of the link.
 * @return {$.oLink}   The link object describing the connection
 */
$.oNode.prototype.getOutLink = function(outPort, outLink){
  if (typeof outLink === 'undefined') var outLink = 0;

  if (this.outPorts < outPort) return null;
  if (this.getOutLinksNumber(outPort) < outLink) return null;

  var _info = node.dstNodeInfo(this.path, outPort, outLink);
  if (!_info) return null;

  var _outNode = this.scene.getNodeByPath(_info.node);
  var _outLink = this.$.oLink(this, _outNode, outPort, _info.port, outLink, true);

  return _outLink;
}


/**
 * Returns all the valid oLink objects describing the links that are coming out of this node.
 * @return {$.oLink[]}  An array of $.oLink objects.
 */
$.oNode.prototype.getOutLinks = function(){
  var _outPorts = this.outPorts;
  var _links = [];

  for (var i = 0; i<_outPorts; i++){
    var _outLinks = this.getOutLinksNumber(i);
    for (var j = 0; j<_outLinks; j++){
      var _link = this.getOutLink(i);
      if (_link != null) _links.push(_link);
    }
  }

  return _links;
}


/**
 * Returns a free unconnected out-port
 * @param  {bool}  [createNew=true]  Whether to allow creation of new ports
 * @return {int} the port number that isn't connected
 */
$.oNode.prototype.getFreeOutPort = function(createNew){
  if (typeof createNew === 'undefined') var createNew = false;

  var _outPorts = this.outPorts;
  for (var i=0; i<_outPorts; i++){
    if (this.getOutLinksNumber(i) == 0) return i;
  }

  if (_outPorts == 0 && this.canCreateOutPorts) return 0;

  if (createNew && this.canCreateOutPorts) return _outPorts;

  return _outPorts-1; // if no empty outPort can be found, return the last one
}


/**
 * Links this node's out-port to the given module, at the inport and outport indices.
 * @param   {$.oNode} nodeToLink             The node to link this one's outport to.
 * @param   {int}     [ownPort]              This node's outport to connect.
 * @param   {int}     [destPort]             The target node's inport to connect.
 * @param   {bool}    [createPorts]          Whether to create new ports on the nodes.
 *
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.linkOutNode = function(nodeToLink, ownPort, destPort, createPorts){
  var link = (new this.$.oLink(this, nodeToLink, ownPort, destPort)).getValidLink(createPorts, createPorts);
  if (link == null) return;

  this.$.debug("linking "+this.path+" to "+nodeToLink+" "+link._outPort+" "+link._inPort+" "+createPorts+" type: "+nodeToLink.type+" "+nodeToLink.inNodes.length, this.$.DEBUG_LEVEL.LOG);

  return link.connect();

}


/**
 * Links this node's out-port to the given module, at the inport and outport indices.
 * @param   {$.oNode}   oNodeObject            The node to unlink from this node's outports.
 *
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.unlinkOutNode = function( oNodeObject ){
  //CF Note: Should be able to define the port.
  var _node = oNodeObject.path;
  var _outPorts = oNodeObject.outPorts;

  for (var i=0; i<_outPorts; i++){
    var _outLinks = oNodeObject.getOutLinksNumber(i);
    for (var j=0; j<_outLinks; j++){
      if (node.dstNode(this.path, i, j) == _node){
        return this.unlinkOutPort(i, j);
      }
    }
  }
  return false;
};


/**
 * Returns the node connected to a specific outPort
 * @param   {int}      outPort      the number of the port to get the node from.
 * @param   {int}      [outLink=0]  the index of the link.
 */
$.oNode.prototype.getLinkedOutNode = function(outPort, outLink){
  if (typeof outLink == 'undefined') var outLink = 0;
  if (this.outPorts < outPort || this.getOutLinksNumber(outPort) < outLink) return null;
  return this.scene.getNodeByPath(node.dstNode(this.path, outPort, outLink));
}


/**
 * Unlinks a specific port/link from this node's output.
 * @param   {int}     outPort                 The outPort to disconnect.
 * @param   {int}     outLink                 The outLink to disconnect.
 *
 * @return  {bool}    The result of the unlink, if successful.
 */
$.oNode.prototype.unlinkOutPort = function( outPort, outLink ){
    // Default values for optional parameters
    if (typeof outLink === 'undefined') outLink = 0;

    try{
      var dstNodeInfo = node.dstNodeInfo(this.path, outPort, outLink);
      if (dstNodeInfo) node.unlink(dstNodeInfo.node, dstNodeInfo.port);
      return true;
    }catch(err){
      this.$.debug("couldn't unlink port "+outPort+" of node "+this.path, this.$.DEBUG_LEVEL.ERROR)
      return false;
    }
};


/**
 * Inserts the $.oNodeObject provided as an innode to this node, placing it between any existing nodes if the link already exists.
 * @param   {int}     inPort                 This node's inport to connect.
 * @param   {$.oNode} oNodeObject            The node to link this one's outport to.
 * @param   {int}     inPortTarget           The target node's inPort to connect.
 * @param   {int}     outPortTarget          The target node's outPort to connect.
 *
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.insertInNode = function( inPort, oNodeObject, inPortTarget, outPortTarget ){
    var _node = oNodeObject.path;

    //QScriptValue
    if( this.ins[inPort] ){
      //INSERT BETWEEN.
      var node_linkinfo = node.srcNodeInfo( this.path, inPort );
      node.link( node_linkinfo.node, node_linkinfo.port, _node, inPortTarget, true, true );
      node.unlink( this.path, inPort );
      return node.link( oNodeObject.path, outPortTarget, this.path, inPort, true, true );
    }

    return this.linkInNode( oNodeObject, inPort, outPortTarget );
};


/**
 * Moves the node into the specified group. This doesn't create any composite or links to the multiport nodes. The node will be unlinked.
 * @param   {oGroupNode}   group      the group node to move the node into.
 */
$.oNode.prototype.moveToGroup = function(group){
  var _name = this.name;
  if (group instanceof oGroupNode) group = group.path;

  if (this.group != group){
    this.$.beginUndo("oH_moveNodeToGroup_"+_name)

    var _groupNodes = node.subNodes(group);

    node.moveToGroup(this.path, group);
    this._path = group+"/"+_name;

    // detect creation of a composite and remove it
    var _newNodes = node.subNodes(group)
    if (_newNodes.length > _groupNodes.length+1){
      for (var i in _newNodes){
        if (_groupNodes.indexOf(_newNodes[i]) == -1 && _newNodes[i] != this.path) {
           var _comp = this.scene.getNodeByPath(_newNodes[i]);
           if (_comp && _comp.type == "COMPOSITE") _comp.remove();
           break;
        }
      }
    }

    // remove automated links
    var _inPorts = this.inPorts;
    for (var i=0; i<_inPorts; i++){
      this.unlinkInPort(i);
    }

    var _outPorts = this.outPorts;
    for (var i=0; i<_outPorts; i++){
      var _outLinks = this.getOutLinksNumber(i);
      for (var j=_outLinks-1; j>=0; j--){
        this.unlinkOutPort(i, j);
      }
    }

    this.$.endUndo();
  }
}


/**
 * Retrieves the nodes index in the timeline provided.
 * @param   {oTimeline}   timeline            The timeline object to search the nodes index.
 *
 * @return  {int}    The index within that timeline.
 */
$.oNode.prototype.timelineIndex = function(timeline){
  var _timeline = timeline.nodesList;
  return _timeline.indexOf(this.path);
}


 /**
 * obtains the nodes contained in the group, allows recursive search. This method is deprecated and was moved to oGroupNode
 * @DEPRECATED
 * @param   {bool}   recurse           Whether to recurse internally for nodes within children groups.
 *
 * @return  {$.oNode[]}    The subbnodes contained in the group.
 */
$.oNode.prototype.subNodes = function(recurse){
    if (typeof recurse === 'undefined') recurse = false;
    var _nodes = node.subNodes(this.path);
    var _subNodes = [];
    for (var _node in _nodes){
        var _oNodeObject = new this.$.oNode( _nodes[_node] );
        _subNodes.push(_oNodeObject);
        if (recurse && node.isGroup(_nodes[_node])) _subNodes = _subNodes.concat(_$.oNodeObject.subNodes(recurse));
    }

    return _subNodes;
};


 /**
 * Place a node above one or more nodes with an offset.
 * @param   {$.oNode[]}     oNodeArray                The array of nodes to center this above.
 * @param   {float}         xOffset                   The horizontal offset to apply after centering.
 * @param   {float}         yOffset                   The vertical offset to apply after centering.
 *
 * @return  {oPoint}   The resulting position of the node.
 */
$.oNode.prototype.centerAbove = function( oNodeArray, xOffset, yOffset ){
    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = -30;

    // Works with nodes and nodes array

    var _box = new this.$.oBox();
    _box.includeNodes( oNodeArray );

    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.top - this.height + yOffset;

    return new this.$.oPoint(this.x, this.y, this.z);
};


 /**
 * Place a node below one or more nodes with an offset.
 * @param   {$.oNode[]} oNodeArray           The array of nodes to center this below.
 * @param   {float}     xOffset              The horizontal offset to apply after centering.
 * @param   {float}     yOffset              The vertical offset to apply after centering.
 *
 * @return  {oPoint}   The resulting position of the node.
 */
$.oNode.prototype.centerBelow = function( oNodeArray, xOffset, yOffset){
    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = 30;

    // Works with nodes and nodes array
    if (typeof oNodeArray === '$.oNode') oNodeArray = [oNodeArray];

    var _box = new this.$.oBox();
    _box.includeNodes(oNodeArray);

    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.bottom + yOffset;

    return new this.$.oPoint(this.x, this.y, this.z);
}


 /**
 * Place at center of one or more nodes with an offset.
 * @param   {$.oNode[]} oNodeArray           The array of nodes to center this below.
 * @param   {float}     xOffset              The horizontal offset to apply after centering.
 * @param   {float}     yOffset              The vertical offset to apply after centering.
 *
 * @return  {oPoint}   The resulting position of the node.
 */
$.oNode.prototype.placeAtCenter = function( oNodeArray, xOffset, yOffset ){
    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = 0;

    // Works with nodes and nodes array
    if (typeof oNodeArray === 'oNode') oNodeArray = [oNodeArray];

    var _box = new this.$.oBox();
    _box.includeNodes(oNodeArray);

    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.center.y - this.height/2 + yOffset;

    return new this.$.oPoint(this.x, this.y, this.z);
}


 /**
 * Create a clone of the node.
 * @param   {string}    newName              The new name for the cloned module.
 * @param   {oPoint}    newPosition          The new position for the cloned module.
 */
$.oNode.prototype.clone = function( newName, newPosition ){
  // Defaults for optional parameters
  if (typeof newPosition === 'undefined') var newPosition = this.nodePosition;
  if (typeof newName === 'undefined') var newName = this.name+"_1";

  this.$.beginUndo("oH_cloneNode_"+this.name);

  var _clonedNode = this.group.addNode(this.type, newName, newPosition);
  var _attributes = this.attributes;

  for (var i in _attributes){
    var _clonedAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
    _clonedAttribute.setToAttributeValue(_attributes[i]);
  }

  this.$.endUndo();

  return _clonedNode;
};


 /**
 * Duplicates a node by creating an independent copy.
 * @param   {string}    [newName]              The new name for the duplicated node.
 * @param   {oPoint}    [newPosition]          The new position for the duplicated node.
 */
$.oNode.prototype.duplicate = function(newName, newPosition){
  if (typeof newPosition === 'undefined') var newPosition = this.nodePosition;
  if (typeof newName === 'undefined') var newName = this.name+"_1";

  this.$.beginUndo("oH_cloneNode_"+this.name);

  var _duplicateNode = this.group.addNode(this.type, newName, newPosition);
  var _attributes = this.attributes;

  for (var i in _attributes){
    var _duplicateAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
    _duplicateAttribute.setToAttributeValue(_attributes[i], true);
  }

  this.$.endUndo();

  return _duplicateNode;
};


 /**
 * Removes the node from the scene.
 * @param   {bool}    deleteColumns              Should the columns of drawings be deleted as well?
 * @param   {bool}    deleteElements             Should the elements of drawings be deleted as well?
 *
 * @return  {void}
 */
$.oNode.prototype.remove = function( deleteColumns, deleteElements ){
  if (typeof deleteFrames === 'undefined') var deleteColumns = true;
  if (typeof deleteElements === 'undefined') var deleteElements = true;

  this.$.beginUndo("oH_deleteNode_"+this.name)
  // restore links for special types;
  if (this.type == "PEG"){
    var inNodes = this.inNodes; //Pegs can only have one inNode but we'll implement the general case for other types
    var outNodes = this.outNodes;
    for (var i in inNodes){
      for (var j in outNodes){
        for( var k in outNodes[j] ){
          inNodes[i].linkOutNode(outNodes[j][k]);
        }
      }
    }
  }

  node.deleteNode(this.path, deleteColumns, deleteElements);
  this.$.endUndo();
}


 /**
 * Provides a matching attribute based on provided keyword name. Keyword can include "." to get subattributes.
 * @param   {string}    keyword                    The attribute keyword to search.
 * @return  {oAttribute}   The matched attribute object, given the keyword.
 */
$.oNode.prototype.getAttributeByName = function( keyword ){
  keyword = keyword.toLowerCase();
  keyword = keyword.split(".");

  // we go through the keywords, trying to access an attribute corresponding to the name
  var _attribute = this.attributes;
  for (var i in keyword){
    var _keyword = keyword[i];

    // applying conversion to the name 3dpath
    if (_keyword == "3dpath") _keyword = "path3d";

    if (!(_keyword in _attribute)) return null;

    _attribute = _attribute[_keyword];
  }

  if (_attribute instanceof this.$.oAttribute) return _attribute;
  return null;
}


 /**
 * Used in converting the node to a string value, provides the string-path.
 * @return  {string}   The node path's as a string.
 */
$.oNode.prototype.toString = function(){
    return this.path;
}


 /**
 * Provides a matching attribute based on the column name provided. Assumes only one match at the moment.
 * @param   {string}       columnName                    The column name to search.
 * @return  {oAttribute}   The matched attribute object, given the column name.
 */
$.oNode.prototype.getAttributeByColumnName = function( columnName ){
  // var attribs = [];

  //Initially check for cache.
  var cdate = (new Date()).getTime();
  if( this.$.cache_columnToNodeAttribute[columnName] ){
    if( ( cdate - this.$.cache_columnToNodeAttribute[columnName].date ) < 5000 ){
      //Cache is in form : { "node":oAttributeObject.node, "attribute": this, "date": (new Date()).getTime() }
      // attribs.push( this.$.cache_columnToNodeAttribute[columnName].attribute );
      return this.$.cache_columnToNodeAttribute[columnName].attribute;
    }
  }

  var _attributes = this.attributes;

  for( var n in _attributes){
    var t_attrib = _attributes[n];
    if( t_attrib.subAttributes.length>0 ){
      //Also check subattributes.
      for( var t=0; t<t_attrib.subAttributes.length; t++ ){
        var t_attr = t_attrib.subAttributes[t];
        if( t_attr.column && t_attr.column.uniqueName == columnName) return t_attr;
      }
    }

    if( t_attrib.column && t_attrib.column.uniqueName == columnName) return t_attrib;
  }

  return false;
  // return attribs;
}


 /**
 * Provides a column->attribute lookup table for timeline building.
 * @private
 * @return  {object}   The column_name->attribute object LUT.  {colName: { "node":oNode, "column":oColumn } }
 */
$.oNode.prototype.getAttributesColumnCache = function( obj_lut ){
  if (typeof obj_lut === 'undefined') obj_lut = {};

  for( var n in this.attributes ){
    var t_attrib = this.attributes[n];
    if( t_attrib.subAttributes.length>0 ){
      //Also check subattributes.
      for( var t=0;t<t_attrib.subAttributes.length;t++ ){
        var t_attr = t_attrib.subAttributes[t];
        if( t_attr.column ){
          // if( !obj_lut[ t_attr.column.uniqueName ] ){
            // obj_lut[ t_attr.column.uniqueName ] = [];
          // }
          // obj_lut[ t_attr.column.uniqueName ].push( { "node":this, "attribute":t_attr } );
          obj_lut[ t_attr.column.uniqueName ] = { "node":this, "attribute":t_attr };
        }
      }
    }

    if( t_attrib.column ){
      // if( !obj_lut[ t_attr.column.uniqueName ] ){
        // obj_lut[ t_attr.column.uniqueName ] = [];
      // }
      // obj_lut[ t_attr.column.uniqueName ].push( { "node":this, "attribute":t_attr } );
      obj_lut[ t_attr.column.uniqueName ] = { "node":this, "attribute":t_attr };
    }
  }

  return obj_lut;
}


/**
 * Creates an $.oNodeLink and connects this node to the target via this nodes outport.
 * @param   {oNode}         nodeToLink                          The target node as an in node.
 * @param   {int}           ownPort                             The out port on this node to connect to.
 * @param   {int}           destPort                            The in port on the inNode to connect to.
 *
 * @return {$.oNodeLink}    the resulting created link.
 * @example
 *  var peg1     = $.scene.getNodeByPath( "Top/Peg1" );
 *  var peg2     = $.scene.getNodeByPath( "Top/Group/Peg2" );
 *  var newLink  = peg1.addOutLink( peg2, 0, 0 );
 */
$.oNode.prototype.addOutLink = function( nodeToLink, ownPort, destPort ){
  if (typeof ownPort == 'undefined') var ownPort = 0;
  if (typeof destPort == 'undefined') var destPort = 0;

  var newLink = new this.$.oNodeLink( this, ownPort, nodeToLink, destPort );
  newLink.apply();

  return newLink;
};

/**
 * Creates a new dynamic attribute in the node.
 * @param   {string}   attrName                   The attribute name to create.
 * @param   {string}   [type="string"]            The type of the attribute ["string", "bool", "double", "int"]
 * @param   {string}   [displayName=attrName]     The visible attribute name to the GUI user.
 * @param   {bool}     [linkable=false]           Whether the attribute can be linked to a column.
 *
 * @return  {$.oAttribute}     The resulting attribute created.
 */
$.oNode.prototype.createAttribute = function( attrName, type, displayName, linkable ){
  if( !attrName ){ return false; }
  attrName = attrName.toLowerCase();

  if (typeof type === 'undefined') type = 'string';
  if (typeof displayName === 'undefined') displayName = attrName;
  if (typeof linkable === 'undefined') linkable = false;

  var res = node.createDynamicAttr( this.path, type.toUpperCase(), attrName, displayName, linkable );
  if( !res ){
    return false;
  }

  this.refreshAttributes();

  var res_split = attrName.split(".");
  if( res_split.length>0 ){
    //Its a sub attribute created.
    try{
      var sub_attr = this.attributes[ res_split[0] ];
      for( x = 1; x<res_split.length;x++ ){
        sub_attr = sub_attr[ res_split[x] ];
      }
      return sub_attr;

    }catch( err ){
      return false;
    }
  }

  var res = this.attributes[ attrName ];
  return this.attributes[ attrName ];
}


/**
 * Removes an existing dynamic attribute in the node.
 * @param   {string}   attrName                   The attribute name to remove.
 *
 * @return  {bool}     The result of the removal.
 */
$.oNode.prototype.removeAttribute = function( attrName ){
  attrName = attrName.toLowerCase();
  return node.removeDynamicAttr( this.path, attrName );
}


/**
 * Refreshes/rebuilds the attributes and getter/setters.
 * @param   {$.oNode}   oNodeObject            The node to link this one's inport to.
 * @return  {bool}    The result of the unlink.
 */
$.oNode.prototype.refreshAttributes = function( ){
    // generate properties from node attributes to allow for dot notation access
    this.attributesBuildCache();

    // for each attribute, create a getter setter as a property of the node object
    // that handles the animated/not animated duality
    var _attributes = this.attributes
    for (var i in _attributes){
      var _attr = _attributes[i];
      if( !this.hasOwnProperty( _attr.shortKeyword ) ){
        this.setAttrGetterSetter(_attr);
      }
    }
}



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          $.oPegNode class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * The peg module base class for the node.
 * @constructor
 * @augments   $.oNode
 * @classdesc  Peg Moudle Class
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * <br> The constructor for the scene object, new this.$.oScene($) to create a scene with DOM access.
 */
$.oPegNode = function( path, oSceneObject ) {
    if (node.type(path) != 'PEG') throw "'path' parameter must point to a 'PEG' type node";
    this.$.oNode.call( this, path, oSceneObject );

    this._type = 'pegNode';
}

// extends $.oNode and can use its methods
$.oPegNode.prototype = Object.create( $.oNode.prototype );

//CF NOTE: Use Separate is ambiguous, as scale, and position can be separate too. Perhaps useSeparate is distinct for position, and rotationUseSeparate otherwise?
// MC Node: Agreed. Do we even want this class? Right now I can't think of anything to put in here...

 /*
 * Whether the position is separate.
 * @Deprecated
 * @name $.oPegNode#useSeparate
 * @type {bool}
 */
 /*
Object.defineProperty($.oPegNode.prototype, "useSeparate", {
    get : function(){

    },

    set : function( _value ){
        // TODO: when swapping from one to the other, copy key values and link new columns if missing
    }
})*/




//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oDrawingNode class      //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

//CFNote: DrawingNode is incorrect in terms of Harmony-- its actually a 'Read' module.

/**
 * The constructor for the scene object.
 * @classdesc  The drawing node base class.
 * @constructor
 * @augments   $.oNode
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * @example
 * // Drawing Nodes are more than a node, as they do not work without an associated Drawing column and element.
 * // adding a drawing node will automatically create a column and an element, unless they are provided as arguments.
 * // Creating an element makes importing a drawing file possible.
 *
 * var doc = $.scn;
 *
 * var drawingName = "myDrawing";
 * var myElement = doc.addElement(drawingName, "TVG");                      // add an element that holds TVG(Toonboom Vector Drawing) files
 * var myDrawingColumn = doc.addColumn("DRAWING", drawingName, myElement);  // create a column and link the element created to it
 *
 * var sceneRoot = doc.root;                                                // grab the scene root group
 *
 * // Creating the Drawing node and linking the previously created element and column
 * var myDrawingNode = sceneRoot.addDrawingNode(drawingName, new $.oPoint(), myDrawingColumn, myElement);
 *
 * // This also works:
 *
 * var myOtherNode = sceneRoot.addDrawingNode("Drawing2");
 */
$.oDrawingNode = function(path, oSceneObject) {
    // $.oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'READ') throw "'path' parameter must point to a 'READ' type node";
    this.$.oNode.call(this, path, oSceneObject);

    this._type = 'drawingNode';
}

$.oDrawingNode.prototype = Object.create($.oNode.prototype);


/**
 * The element that holds the drawings displayed by the node.
 * @name $.oDrawingNode#element
 * @type {oElement}
 */
Object.defineProperty($.oDrawingNode.prototype, "element", {
  get : function(){
    var _column = this.attributes.drawing.element.column;
    return ( new this.$.oElement( node.getElementId(this.path), _column ) );
  },

  set : function( oElementObject ){
    var _column = this.attributes.drawing.element.column;
    column.setElementIdOfDrawing( _column.uniqueName, oElementObject.id );
  }
});


/**
 * An array of the colorIds contained within the drawings displayed by the node.
 * @name $.oDrawingNode#usedColorIds
 * @type {int[]}
 */
Object.defineProperty($.oDrawingNode.prototype, "usedColorIds", {
  get : function(){
    // this.$.log("used colors in node : "+this.name)
    var _timings = this.timings;
    var _colors = [];

    for (var i in _timings){
      var _drawingColors = DrawingTools.getDrawingUsedColors({node: this.path, frame: _timings[i].frameNumber});
      // this.$.log(this.path+" frame: "+_timings[i].frameNumber+" has colors: "+_drawingColors)
      for (var c in _drawingColors){
        if (_colors.indexOf(_drawingColors[c]) == -1) _colors.push(_drawingColors[c]);
      }
    }

    return _colors;
  }
});


/**
 * The drawing.element keyframes.
 * @name $.oDrawingNode#timings
 * @type {oFrames[]}
 * @example
 * // The timings hold the keyframes that display the drawings across time.
 *
 * var timings = $.scn.$node("Top/Drawing").timings;
 * for (var i in timings){
 *   $.log( timings.frameNumber+" : "+timings.value);      // outputs the frame and the value of each keyframe
 * }
 *
 * // timings are keyframe objects, so they are dynamic.
 * timings[2].value = "5";                                 // sets the displayed image of the second key to the drawing named "5"
 *
 * // to set a new value to a frame that wasn't a keyframe before, it's possible to use the attribute keyword like so:
 *
 * var myNode = $.scn.$node("Top/Drawing");
 * myNode.drawing.element = {frameNumber: 5, value: "10"}             // setting the value of the frame 5
 * myNode.drawing.element = {frameNumber: 6, value: timings[1].value} // setting the value to the same as one of the timings
 */
Object.defineProperty($.oDrawingNode.prototype, "timings", {
    get : function(){
        return this.attributes.drawing.element.getKeyframes();
    }
})


/**
 * The element palettes linked to the node.
 * @name $.oDrawingNode#palettes
 * @type {oPalette[]}
 */
Object.defineProperty($.oDrawingNode.prototype, "palettes", {
    get : function(){
      var _element = this.element;
      var _paletteList = PaletteObjectManager.getPaletteListByElementId(_element.id);
      var _palettes = [];
      for (var i=0; i<_paletteList.numPalettes; i++){
        _palettes.push( new this.$.oPalette( _paletteList.getPaletteByIndex(i), this, _paletteList ) );
      }
      return _palettes;
    }
})


// Class Methods

 /**
 * Gets the list of palettes containing colors used by a drawing node. This only gets palettes with the first occurence of the colors.
 * @return  {$.oPalette[]}   The palettes that contain the color IDs used by the drawings of the node.
 */
$.oDrawingNode.prototype.getUsedPalettes = function(){
  var _palettes = this.scene.palettes;
  var _usedPalettes = [];

  var _usedColorIds = this.usedColorIds;
  for (var i in _usedColorIds){
    for (var j in _palettes){
      var _color = _palettes[j].getColorById(_usedColorIds[i]);
      // color found
      if (_color != null){
        if (_usedPalettes.indexOf(_palettes[j]) == -1) _usedPalettes.push(_palettes[j]);
        break;
      }
    }
  }

  return _usedPalettes;
}


 /**
 * Links a palette to a drawing node as Element Palette.
 * @param {$.oPalette}     oPaletteObject      the palette to link to the node
 * @param {int}            [index]             The index of the list at which the palette should appear once linked
 *
 * @return  {$.oPalette}   The linked element Palette.
 */
$.oDrawingNode.prototype.linkPalette = function(oPaletteObject, index){
  return this.element.linkPalette(oPaletteObject, index);
}



 /**
 * Duplicates a node by creating an independent copy.
 * @param   {string}    [newName]              The new name for the duplicated node.
 * @param   {oPoint}    [newPosition]          The new position for the duplicated node.
 * @param   {bool}      [duplicateElement]     Wether to also duplicate the element.
 */
$.oDrawingNode.prototype.duplicate = function(newName, newPosition, duplicateElement){
  if (typeof newPosition === 'undefined') var newPosition = this.nodePosition;
  if (typeof newName === 'undefined') var newName = this.name+"_1";

  var _duplicateNode = this.group.addNode(this.type, newName, newPosition);
  var _attributes = this.attributes;

  for (var i in _attributes){
    var _duplicateAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
    _duplicateAttribute.setToAttributeValue(_attributes[i], true);
  }

  var _duplicateAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
  _duplicateAttribute.setToAttributeValue(_attributes[i], true);

  return _duplicateNode;
};


 /**
 * Updates the imported drawings in the node.
 * @param {$.oFile}   sourcePath        the oFile object pointing to the source to update from
 * @param {string}    [drawingName]       the drawing to import the updated bitmap into
 * @todo implement a memory of the source through metadata
 */
$.oDrawingNode.prototype.update = function(sourcePath, drawingName){
  if (!this.element) return; // no element means nothing to update, import instead.
  if (typeof drawingName === 'undefined') var drawingName = this.element.drawings[0].name;

  var _drawing = this.element.getDrawingByName(drawingName);

  _drawing.importBitmap(sourcePath);
  _drawing.refreshPreview();
}


 /**
 * Extracts the position information on a drawing node, and applies it to a new peg instead.
 * @return  {$.oPegNode}   The created peg.
 */
$.oDrawingNode.prototype.extractPeg = function(){
    var _drawingNode = this;
    var _peg = this.group.addNode("PEG", this.name+"-P");
    var _columns = _drawingNode.linkedColumns;

    _peg.position.separate = _drawingNode.offset.separate;
    _peg.scale.separate = _drawingNode.scale.separate;

    // link each column that can be to the peg instead and reset the drawing node
    for (var i in _columns){
        var _attribute = _columns[i].attributeObject;
        var _keyword = _attribute._keyword;

        var _nodeAttribute = _drawingNode.getAttributeByName(_keyword);

        if (_keyword.indexOf("OFFSET") != -1) _keyword = _keyword.replace("OFFSET", "POSITION");

        var _pegAttribute = _peg.getAttributeByName(_keyword);

        if (_pegAttribute !== null){
            _pegAttribute.column = _columns[i];
            _nodeAttribute.column = null;
            _drawingNode[_keyword] = _attribute.defaultValue;
        }
    }

    _drawingNode.offset.separate = false; // doesn't work?
    _drawingNode.can_animate = false;

    _peg.centerAbove(_drawingNode, -1, -30)
    _drawingNode.linkInNode(_peg)

    return _peg;
}


 /**
 * Gets the contour curves of the drawing, as a concave hull.
 * @param   {int}          [count]                          The number of points on the contour curve to derive.
 * @param   {int}          [frame]                          The frame to derive the contours.
 *
 * @return  {oPoint[][]}   The contour curves.
 */
$.oDrawingNode.prototype.getContourCurves = function( count, frame ){

  if (typeof frame === 'undefined') var frame = this.scene.currentFrame;
  if (typeof count === 'undefined') var count = 3;

  var res = EnvelopeCreator().getDrawingBezierPath( this.path,
                           frame,      //FRAME
                           2.5,        //DISCRETIZER
                           0,          //K
                           count,      //DESIRED POINT COUNT
                           0,          //BLUR
                           0,          //EXPAND
                           false,      //SINGLELINE
                           true,       //USE MIN POINTS,
                           0,          //ADDITIONAL BISSECTING

                           false
                        );
  if( res.success ){
    var _curves = res.results.map(function(x){return [
                                                      new this.$.oPoint( x[0][0], x[0][1], 0.0 ),
                                                      new this.$.oPoint( x[1][0], x[1][1], 0.0 ),
                                                      new this.$.oPoint( x[2][0], x[2][1], 0.0 ),
                                                      new this.$.oPoint( x[3][0], x[3][1], 0.0 )
                                                    ]; } );
    return _curves;
  }

  return [];
}


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oGroupNode class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * Constructor for the $.oGroupNode class
 * @classdesc
 * $.oGroupNode is a subclass of $.oNode and implements the same methods and properties as $.oNode. <br>
 * It represents groups in the scene. From this class, it's possible to add nodes, and backdrops, import files and templates into the group.
 * @constructor
 * @augments   $.oNode
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * @example
 * // to add a new node, grab the group it'll be created in first
 * var doc = $.scn
 * var sceneRoot = doc.root;                                              // grab the scene root group
 *
 * var myGroup = sceneRoot.addGrop("myGroup", false, false);              // create a group in the scene root, with a peg and composite but no nodes
 * var MPO = myGroup.multiportOut;                                        // grab the multiport in of the group
 *
 * var myNode = myGroup.addDrawingNode("myDrawingNode");                  // add a drawing node inside the group
 * myNode.linkOutNode(MPO);                                               // link the newly created node to the multiport
 * myNode.centerAbove(MPO);
 *
 * var sceneComposite = doc.$node("Top/Composite");                       // grab the scene composite node
 * myGroup.linkOutNode(sceneComposite);                                   // link the group to it
 *
 * myGroup.centerAbove(sceneComposite);
 */
$.oGroupNode = function(path, oSceneObject) {
    // $.oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'GROUP') throw "'path' parameter must point to a 'GROUP' type node";
    this.$.oNode.call(this, path, oSceneObject);

    this._type = 'groupNode';
}
$.oGroupNode.prototype = Object.create($.oNode.prototype);


/**
 * The multiport in node of the group.
 * @name $.oGroupNode#multiportIn
 * @readonly
 * @type {$.oNode}
 */
Object.defineProperty($.oGroupNode.prototype, "multiportIn", {
    get : function(){
        if (this.isRoot) return null
        var _MPI = this.scene.getNodeByPath(node.getGroupInputModule(this.path, "Multiport-In", 0,-100,0),this.scene)
        return (_MPI)
    }
})


/**
 * The multiport out node of the group.
 * @name $.oGroupNode#multiportOut
 * @readonly
 * @type {$.oNode}
 */
Object.defineProperty($.oGroupNode.prototype, "multiportOut", {
    get : function(){
        if (this.isRoot) return null
        var _MPO = this.scene.getNodeByPath(node.getGroupOutputModule(this.path, "Multiport-Out", 0, 100,0),this.scene)
        return (_MPO)
    }
});

 /**
 * All the nodes contained within the group, one level deep.
 * @name $.oGroupNode#nodes
 * @readonly
 * @type {$.oNode[]}
 */
Object.defineProperty($.oGroupNode.prototype, "nodes", {
  get : function() {
    var _path = this.path;
    var _nodes = node.subNodes(_path);

    var self = this;
    return _nodes.map(function(x){return self.scene.getNodeByPath(x)});
  }
});



 /**
 * All the backdrops contained within the group.
 * @name $.oGroupNode#backdrops
 * @readonly
 * @type {$.oBackdrop[]}
 */
Object.defineProperty($.oGroupNode.prototype, "backdrops", {
  get : function() {
    var _path = this.path;
    var _backdropObjects = Backdrop.backdrops(this.path);
    var _backdrops = [];
    _backdropObjects.map(function(x){_backdrops.push(new this.$.oBackdrop(_path, x))});

    return _backdrops;
  }
});


 /**
 * Returns a node from within a group based on its name.
 * @param   {string}      name           The name of the node.
 *
 * @return  {$.oNode}     The node, or null if can't be found.
 */
$.oGroupNode.prototype.getNodeByName = function(name){
  var _path = this.path+"/"+name;

  return this.scene.getNodeByPath(_path);
}


 /**
 * Returns a child node in a group based on a search.
 * @param   {string}      name           The name of the node.
 *
 * @return  {$.oNode}     The node, or null if can't be found.
 */
$.oGroupNode.prototype.$node = function(name){
  return this.getNodeByName(name);
}


 /**
 * Gets all the nodes contained within the group.
 * @param   {bool}    [recurse=false]             Whether to recurse the groups within the groups.
 *
 * @return  {$.oNode[]}   The nodes in the group
 */
$.oGroupNode.prototype.subNodes = function(recurse){
    if (typeof recurse === 'undefined') recurse = false;

    var _nodes = node.subNodes(this.path);
    var _subNodes = [];

    for (var i in _nodes){
        var _oNodeObject = this.scene.getNodeByPath(_nodes[i]);
        _subNodes.push(_oNodeObject);
        if (recurse && node.isGroup(_nodes[i])) _subNodes = _subNodes.concat(_oNodeObject.subNodes(recurse));
    }

    return _subNodes;
}


 /**
 * Gets all children of the group.
 * @param   {bool}    [recurse=false]             Whether to recurse the groups within the groups.
 *
 * @return  {$.oNode[]}   The nodes in the group
 */
$.oGroupNode.prototype.children = function(recurse){
  return this.subNodes(recurse);
}



 /**
 * Creates an in-port on top of a group
 * @param   {int}         portNum            The port number where a port will be added
 * @type    {string}
 *
 * @return  {int}   The number of the created port in case the port specified was not correct (for example larger than the current number of ports + 1)
 */
$.oGroupNode.prototype.addInPort = function(portNum, type){
  var _inPorts = this.inPorts;

  if (typeof portNum === 'undefined') var portNum = _inPorts;
  if (portNum > _inPorts) portNum = _inPorts;

  var _type = (type=="transform")?"READ":"none"
  var _dummyNode = this.addNode(_type, "dummy_add_port_node");
  var _MPI = this.multiportIn;
  _dummyNode.linkInNode(_MPI, 0, portNum, true);
  _dummyNode.unlinkInNode(_MPI);
  _dummyNode.remove();

  return portNum;
}


 /**
 * Creates an out-port at the bottom of a group. For some reason groups can have many unconnected in-ports but only one unconnected out-port.
 * @param   {int}         [portNum]            The port number where a port will be added
 * @type    {string}
 *
 * @return  {int}   The number of the created port in case the port specified was not correct (for example larger than the current number of ports + 1)
 */
$.oGroupNode.prototype.addOutPort = function(portNum, type){
  var _outPorts = this.outPorts;

  if (typeof portNum === 'undefined') var portNum = _outPorts;
  if (portNum > _outPorts) portNum = _outPorts;
    this.$.log(portNum)
  var _type = (type=="transform")?"PEG":"none"
  var _dummyNode = this.addNode(_type, "dummy_add_port_node");
  var _MPO = this.multiportOut;

  _dummyNode.linkOutNode(_MPO, 0, portNum, true);
  _dummyNode.unlinkOutNode(_MPO);
  _dummyNode.remove();

  return portNum;
}

 /**
 * Gets all children of the group.
 * @param   {bool}    [recurse=false]             Whether to recurse the groups within the groups.
 *
 * @return  {$.oNode[]}   The nodes in the group
 */
$.oGroupNode.prototype.children = function(recurse){
  return this.subNodes(recurse);
}



 /**
 * Sorts out the node view inside the group
 * @param   {bool}    [recurse=false]             Whether to recurse the groups within the groups.
 */
$.oGroupNode.prototype.orderNodeView = function(recurse){
    if (typeof recurse === 'undefined') var recurse = false;

    TB_orderNetworkUpBatchFromList( node.subNodes(this.path) );

    if (!this.isRoot){
        var _MPO = this.multiportOut;
        var _MPI = this.multiportIn;

        _MPI.x = _MPO.x
    }

    if (recurse){
        var _subNodes = this.subNodes().filter(function(x){return x.type == "GROUP"});
        for (var i in _subNodes){
            _subNodes[i].orderNodeView(recurse);
        }
    }
}


/**
 * Adds a node to the group.
 * @param   {string}        type                   The type-name of the node to add.
 * @param   {string}        [name=type]            The name of the newly created node.
 * @param   {$.oPoint}      [nodePosition={0,0,0}] The position for the node to be placed in the network.
 *
 * @return {$.oNode}   The created node, or bool as false.
 * @example
 * // to add a node, simply call addNode on the group you want the node to be added to.
 * var sceneRoot = $.scn.root; // grab the scene root group ("Top")
 *
 * var peg = sceneRoot.addNode("PEG", "MyNewlyCreatedPeg");           // adding a peg
 *
 * // Now we'll also create a drawing node to connect under the peg
 * var sceneComposite = $.scn.getNodeByPath("Top/Composite");         // can also use $.scn.$node("Top/Composite") for shorter synthax
 *
 * var drawingNode = sceneRoot.addDrawingNode("myNewDrawingNode");
 * drawingNode.linkOutNode(sceneComposite);
 * drawingNode.can_animate = false                // setting some attributes on the newly created Node
 *
 * peg.linkOutNode(drawingNode);
 *
 * //through all this we didn't specify nodePosition parameters so we'll sort evertything at once
 *
 * sceneRoot.orderNodeView();
 *
 * // we can also do:
 *
 * peg.centerAbove(drawingNode);
 *
 */
$.oGroupNode.prototype.addNode = function( type, name, nodePosition ){
    // Defaults for optional parameters
    if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();

    var _group = this.path;

    // sanitize input for node name creation
    name = name.split(" ").join("_");

    // increment name if a node with the same name already exists
    var _name = name.split("_");
    var _count = parseInt(_name.pop(), 10);

    // get name without suffix
    if ( isNaN( _count ) ) { // check for NaN value -> no number already added
        _name = name;
        _count = 0;
    }else{
        _name = _name.join("_");
    }

    // loop to increment until we get a node name that is free
    var _nodePath = _group+"/"+_name;
    var _node = new this.$.oNode(_nodePath)

    while( _node.exists ){
        _count++;
        name = _name+"_"+_count;
        _nodePath = _group+"/"+name;
        _node = new this.$.oNode( _nodePath );
    }

    // create node and return result
    var _path = node.add( _group, name, type, nodePosition.x, nodePosition.y, nodePosition.z );
    _node = this.scene.$node(_path)

    return _node;
}


/**
 * Adds a drawing layer to the group, with a drawing column and element linked. Possible to specify the column and element to use.
 * @param   {string}     name                     The name of the newly created node.
 * @param   {$.oPoint}   [nodePosition={0,0,0}]   The position for the node to be placed in the network.
 * @param   {$.object}   [element]                The element to attach to the column.
 * @param   {object}     [drawingColumn]          The column to attach to the drawing module.

 * @return {$.oNode}     The created node, or bool as false.
 */

$.oGroupNode.prototype.addDrawingNode = function( name, nodePosition, oElementObject, drawingColumn){
    // add drawing column and element if not passed as parameters
    this.$.beginUndo("oH_addDrawingNode_"+name);

    if (typeof oElementObject === 'undefined') var oElementObject = this.scene.addElement( name );
    if (typeof drawingColumn === 'undefined') var drawingColumn = this.scene.addColumn( "DRAWING", name, oElementObject );

    // Defaults for optional parameters
    if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();

    var _node = this.addNode( "READ", name, nodePosition );

    // setup the node
    // setup animate mode/separate based on preferences?
    _node.attributes.drawing.element.column = drawingColumn;

    this.$.endUndo();

    return _node;
}


/**
 * Adds a new group to the group, and optionally move the specified nodes into it.
 * @param   {string}     name                           The name of the newly created group.
 * @param   {$.oPoint}   [addComposite=false]           Whether to add a composite.
 * @param   {bool}       [addPeg=false]                 Whether to add a peg.
 * @param   {string}     [includeNodes]                 The nodes to add to the group.
 * @param   {$.oPoint}   [nodePosition={0,0,0}]         The position for the node to be placed in the network.

 * @return {$.oGroupNode}   The created node, or bool as false.
 */
$.oGroupNode.prototype.addGroup = function( name, addComposite, addPeg, includeNodes, nodePosition ){
    // Defaults for optional parameters
    if (typeof addPeg === 'undefined') var addPeg = false;
    if (typeof addComposite === 'undefined') var addComposite = false;
    if (typeof includeNodes === 'undefined') var includeNodes = [];

    this.$.beginUndo("oH_addGroup_"+name);

    var nodeBox = new this.$.oBox();
    includeNodes = includeNodes.filter(function(x){return !!x}) // filter out all invalid types
    if (includeNodes.length > 0) nodeBox.includeNodes(includeNodes);

    if (typeof nodePosition === 'undefined') var nodePosition = includeNodes.length?nodeBox.center:new this.$.oPoint(0,0,0);

    var _group = this.addNode( "GROUP", name, nodePosition );

    var _MPI = _group.multiportIn;
    var _MPO = _group.multiportOut;

    if (addComposite){
      var _composite = _group.addNode("COMPOSITE", name+"_Composite");
      _composite.composite_mode = "Pass Through"; // get preference?
      _composite.linkOutNode(_MPO);
      _composite.centerAbove(_MPO);
    }

    if (addPeg){
      var _peg = _group.addNode("PEG", name+"-P");
      _peg.linkInNode(_MPI);
      _peg.centerBelow(_MPI);
    }

    // moves nodes into the created group and recreates their hierarchy and links
    if (includeNodes.length > 0){
      var _timeline = this.scene.getTimeline();
      includeNodes = includeNodes.sort(function(b, a){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})

      var _links = this.scene.getNodesLinks(includeNodes);

      for (var i in includeNodes){
        includeNodes[i].moveToGroup(_group);
      }

      for (var i in _links){
        _links[i].connect();
      }

      // link all unconnected nodes to the peg/MPI and comp/MPO
      var _topNode = _peg?_peg:_MPI;
      var _bottomNode = _composite?_composite:_MPO;

      for (var i in includeNodes){
        for (var j=0; j < includeNodes[i].inPorts; j++){
          if (includeNodes[i].getInLinksNumber(j) == 0) includeNodes[i].linkInNode(_topNode);
        }

        for (var j=0; j < includeNodes[i].outPorts; j++){
          if (includeNodes[i].getOutLinksNumber(j) == 0) includeNodes[i].linkOutNode(_bottomNode,0,0);
        }
      }

      //shifting MPI/MPO/peg/comp out of the way of included nodes
      if (_peg){
        _peg.centerAbove(includeNodes);
        includeNodes.push(_peg);
      }

      if (_composite){
        _composite.centerBelow(includeNodes);
        includeNodes.push(_composite);
      }

      _MPI.centerAbove(includeNodes);
      _MPO.centerBelow(includeNodes);
    }

    this.$.endUndo();
    return _group;
}


/**
 * Imports the specified template into the scene.
 * @param   {string}           tplPath                                        The path of the TPL file to import.
 * @param   {$.oNode[]}        [destinationNodes=false]                       The nodes affected by the template.
 * @param   {bool}             [extendScene=true]                             Whether to extend the exposures of the content imported.
 * @param   {$.oPoint}         [nodePosition={0,0,0}]                         The position to offset imported new nodes.
 * @param   {object}           [pasteOptions]                                 An object containing paste options as per Harmony's standard paste options.
 *
 * @return {$.oNode[]}         The resulting pasted nodes.
 */
$.oGroupNode.prototype.importTemplate = function( tplPath, destinationNodes, extendScene, nodePosition, pasteOptions ){
  if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
  if (typeof destinationNodes === 'undefined' || destinationNodes.length == 0) var destinationNodes = false;
  if (typeof extendScene === 'undefined') var extendScene = true;

  if (typeof pasteOptions === 'undefined') var pasteOptions = copyPaste.getCurrentPasteOptions();
  pasteOptions.extendScene = extendScene;

  this.$.beginUndo("oH_importTemplate");

  var _group = this.path;

  if(tplPath instanceof this.$.oFolder) tplPath = tplPath.path;

  this.$.debug("importing template : "+tplPath, this.$.DEBUG_LEVEL.LOG);

  var _copyOptions = copyPaste.getCurrentCreateOptions();
  var _tpl = copyPaste.copyFromTemplate(tplPath, 0, 999, _copyOptions); // any way to get the length of a template before importing it?

  if (destinationNodes){
    // TODO: deal with import options to specify frames
    copyPaste.paste(_tpl, destinationNodes.map(function(x){return x.path}), 0, 999, pasteOptions);
    var _nodes = destinationNodes;
  }else{
    log("pasting as new nodes")
    copyPaste.pasteNewNodes(_tpl, _group, pasteOptions);
    var _scene = this.scene;
    var _nodes = selection.selectedNodes().map(function(x){return _scene.$node(x)});
    for (var i in _nodes){
     // _nodes[i].x += nodePosition.x;
     // _nodes[i].y += nodePosition.y;
    }
  }

  this.$.endUndo();
  return _nodes;
}


/**
 * Adds a backdrop to a group in a specific position.
 * @param   {string}           [title="Backdrop"]                The title of the backdrop.
 * @param   {string}           [body=""]                         The body text of the backdrop.
 * @param   {$.oColorValue}    [color="#323232ff"]               The oColorValue of the node.
 * @param   {float}            [x=0]                             The X position of the backdrop, an offset value if nodes are specified.
 * @param   {float}            [y=0]                             The Y position of the backdrop, an offset value if nodes are specified.
 * @param   {float}            [width=30]                        The Width of the backdrop, a padding value if nodes are specified.
 * @param   {float}            [height=30]                       The Height of the backdrop, a padding value if nodes are specified.
 *
 * @return {$.oBackdrop}       The created backdrop.
 */
$.oGroupNode.prototype.addBackdrop = function(title, body, color, x, y, width, height ){
  if (typeof color === 'undefined') var color = new this.$.oColorValue("#323232ff");
  if (typeof body === 'undefined') var body = "";

  if (typeof x === 'undefined') var x = 0;
  if (typeof y === 'undefined') var y = 0;
  if (typeof width === 'undefined') var width = 30;
  if (typeof height === 'undefined') var height = 30;

  var position = {"x":x, "y":y, "w":width, "h":height};

  if (typeof groupPath === 'undefined') var groupPath = "Top";

  if(groupPath instanceof this.$.oGroupNode) groupPath = groupPath.path;
  if(!(color instanceof this.$.oColorValue)) color = new this.$.oColorValue(color);


  // incrementing title so that two backdrops can't have the same title
  if (typeof title === 'undefined') var title = "Backdrop";

  var _groupBackdrops = Backdrop.backdrops(groupPath);
  var names = _groupBackdrops.map(function(x){return x.title.text})
  var count = 0;
  var newTitle = title;

  while (names.indexOf(newTitle) != -1){
    count++;
    newTitle = title+"_"+count;
  }
  title = newTitle;


  var _backdrop = {
  "position"    : position,
  "title"       : {"text":title, "color":4278190080, "size":12, "font":"Arial"},
  "description" : {"text":body, "color":4278190080, "size":12, "font":"Arial"},
  "color"       : color.toInt()
  }

  Backdrop.addBackdrop(groupPath, _backdrop)
  return new this.$.oBackdrop(groupPath, _backdrop)
};


/**
 * Adds a backdrop to a group around specified nodes
 * @param   {$.oNode[]}        nodes                             The nodes that the backdrop encompasses.
 * @param   {string}           [title="Backdrop"]                The title of the backdrop.
 * @param   {string}           [body=""]                         The body text of the backdrop.
 * @param   {$.oColorValue}    [color=#323232ff]                 The oColorValue of the node.
 * @param   {float}            [x=0]                             The X position of the backdrop, an offset value if nodes are specified.
 * @param   {float}            [y=0]                             The Y position of the backdrop, an offset value if nodes are specified.
 * @param   {float}            [width=20]                        The Width of the backdrop, a padding value if nodes are specified.
 * @param   {float}            [height=20]                       The Height of the backdrop, a padding value if nodes are specified.
 *
 * @return {$.oBackdrop}       The created backdrop.
 * @example
 * function createColoredBackdrop(){
 *  // This script will prompt for a color and create a backdrop around the selection
 *  $.beginUndo()
 *
 *  var doc = $.scn; // grab the scene
 *  var nodes = doc.getSelectedNodes(); // grab the selection
 *
 *  if(!nodes) return    // exit the function if no nodes are selected
 *
 *  var color = pickColor(); // prompt for color
 *
 *  var group = doc.$node("Top") // get the group to add the backdrop to
 *  var backdrop = group.addBackdropToNodes(nodes, "BackDrop", "", color)
 *
 *  $.endUndo();
 *
 *  // function to get the color chosen by the user
 *  function pickColor(){
 *    var d = new QColorDialog;
 *    d.exec();
 *    var color = d.selectedColor();
 *    return new $.oColorValue({r:color.red(), g:color.green(), b:color.blue(), a:color.alpha()})
 *  }
 * }
 */
$.oGroupNode.prototype.addBackdropToNodes = function( nodes, title, body, color, x, y, width, height ){
  if (typeof color === 'undefined') var color = new this.$.oColorValue("#323232ff");
  if (typeof body === 'undefined') var body = "";
  if (typeof x === 'undefined') var x = 0;
  if (typeof y === 'undefined') var y = 0;
  if (typeof width === 'undefined') var width = 20;
  if (typeof height === 'undefined') var height = 20;


  // get default size from node bounds
  if (typeof nodes === 'undefined') var nodes = [];

  if (nodes.length > 0) {
    var _nodeBox = new this.$.oBox();
    _nodeBox.includeNodes(nodes);

    x = _nodeBox.left - x - width;
    y = _nodeBox.top - y - height;
    width = _nodeBox.width  + width*2;
    height = _nodeBox.height + height*2;
  }

  var _backdrop = this.addBackdrop(title, body, color, x, y, width, height)

  return _backdrop;
};


/**
 * Imports a PSD into the group.
 * @param   {string}         path                          The PSD file to import.
 * @param   {bool}           [separateLayers=true]         Separate the layers of the PSD.
 * @param   {bool}           [addPeg=true]                 Whether to add a peg.
 * @param   {bool}           [addComposite=true]           Whether to add a composite.
 * @param   {string}         [alignment="ASIS"]            Alignment type.
 * @param   {$.oPoint}       [nodePosition={0,0,0}]        The position for the node to be placed in the node view.
 *
 * @return {$.oNode[]}     The nodes being created as part of the PSD import.
 * @example
 * // This example browses for a PSD file then import it in the root of the scene, then connects it to the main composite.
 *
 * function importCustomPSD(){
 *   $.beginUndo("importCustomPSD");
 *   var psd = $.dialog.browseForFile("get PSD", "*.psd");       // prompt for a PSD file
 *
 *   if (!psd) return;                                           // dialog was cancelled, exit the function
 *
 *   var doc = $.scn;                                            // get the scene object
 *   var sceneRoot = doc.root                                    // grab the scene root group
 *   var psdNodes = sceneRoot.importPSD(psd);                    // import the psd with default settings
 *   var psdComp = psdNodes.pop()                                // get the composite node at the end of the psdNodes array
 *   var sceneComp = doc.$node("Top/Composite")                  // get the scene main composite
 *   psdComp.linkOutNode(sceneComp);                             // ... and link the two.
 *   sceneRoot.orderNodeView();                                  // orders the node view inside the group
 *   $.endUndo();
 * }
 */
$.oGroupNode.prototype.importPSD = function( path, separateLayers, addPeg, addComposite, alignment, nodePosition){
  if (typeof alignment === 'undefined') var alignment = "ASIS" // create an enum for alignments?
  if (typeof addComposite === 'undefined') var addComposite = true;
  if (typeof addPeg === 'undefined') var addPeg = true;
  if (typeof separateLayers === 'undefined') var separateLayers = true;
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);

  var _psdFile = (path instanceof this.$.oFile)?path:new this.$.oFile( path );
  if (!_psdFile.exists){
    this.$.debug("Error: can't import PSD file "+_psdFile.path+" because it doesn't exist", this.$.DEBUG_LEVEL.ERROR);
    return null;
  }

  this.$.beginUndo("oH_importPSD_"+_psdFile.name);

  var _elementName = _psdFile.name;

  var _xSpacing = 45;
  var _ySpacing = 30;

  var _element = this.scene.addElement(_elementName, "PSD");
  var _column = this.scene.addColumn(_elementName, "DRAWING", _element);

  // save scene otherwise PSD is copied correctly into the element
  // but the TGA for each layer are not generated
  // TODO: how to go around this to avoid saving?
  scene.saveAll();
  var _drawing = _element.addDrawing(1);

  if (addPeg) var _peg = this.addNode("PEG", _elementName+"-P", nodePosition);
  if (addComposite) var _comp = this.addNode("COMPOSITE", _elementName+"-Composite", nodePosition);

  // Import the PSD in the element
  CELIO.pasteImageFile({ src : _psdFile.path, dst : { elementId : _element.id, exposure : _drawing.name}});
  var _layers = CELIO.getLayerInformation(_psdFile.path);
  var _info = CELIO.getInformation(_psdFile.path);

  // create the nodes for each layer

  var _nodes = [];
  if (separateLayers){

    var _scale = _info.height/scene.defaultResolutionY();
    var _x = nodePosition.x - _layers.length/2*_xSpacing;
    var _y = nodePosition.y - _layers.length/2*_ySpacing;

    // TODO: discover and generate the groups present in the PSD

    for (var i in _layers){
      // generate nodes and set them to show the element for each layer
      var _layer = _layers[i].layer;
      var _layerName = _layers[i].layerName.split(" ").join("_");
      var _nodePosition = new this.$.oPoint(_x+=_xSpacing, _y +=_ySpacing, 0);

      //TODO: set into right group according to PSD organisation
      // var _group = group; //"Top/"+_layers[i].layerPathComponents.join("/");

      var _node = this.addDrawingNode(_layerName, _nodePosition, _element)

      _node.enabled = _layers[i].visible;
      _node.can_animate = false; // use general pref?
      _node.apply_matte_to_color = "Straight";
      _node.alignment_rule = alignment;
      _node.scale.x = _scale;
      _node.scale.y = _scale;

      _node.attributes.drawing.element.setValue(_layer != ""?"1:"+_layer:1, 1);
      _node.attributes.drawing.element.column.extendExposures();

      if (addPeg) _node.linkInNode(_peg);
      if (addComposite) _node.linkOutNode(_comp, 0, 0);

      _nodes.push(_node);
    }
  }else{
    this.$.endUndo();
    throw new Error("importing PSD as a flattened layer not yet implemented");
  }

  if (addPeg){
    _peg.centerAbove(_nodes, 0, -_ySpacing )
    _nodes.unshift(_peg)
  }

  if (addComposite){
    _comp.centerBelow(_nodes, 0, _ySpacing )
    _nodes.push(_comp)
  }
  // TODO how to display only one node with the whole file
  this.$.endUndo()

  return _nodes
}


/**
 * Updates a PSD previously imported into the group
 * @param   {string}       path                          The updated psd file to import.
 * @param   {bool}         [separateLayers=true]         Separate the layers of the PSD.
 *
 * @return  {$.oNode[]}    The nodes that have been updated/created
 */
$.oGroupNode.prototype.updatePSD = function( path, separateLayers ){
  if (typeof separateLayers === 'undefined') var separateLayers = true;

  var _psdFile = (path instanceof this.$.oFile)?path:new this.$.oFile(path);
  if (!_psdFile.exists){
    this.$.debug("Error: can't import PSD file "+_psdFile.path+" for update because it doesn't exist", this.$.DEBUG_LEVEL.ERROR);
    return null;
  }

  this.$.beginUndo("oH_updatePSD_"+_psdFile.name)

  // get info from the PSD
  var _info = CELIO.getInformation(_psdFile.path);
  var _layers = CELIO.getLayerInformation(_psdFile.path);
  var _scale = _info.height/scene.defaultResolutionY();

  // use layer information to find nodes from precedent export
  if (separateLayers){
    var _nodes = this.subNodes(true).filter(function(x){return x.type == "READ"});
    var _nodeNames = _nodes.map(function(x){return x.name});

    var _psdNodes = [];
    var _missingLayers = [];
    var _PSDelement = "";
    var _positions = new Array(_layers.length);
    var _scale = _info.height/scene.defaultResolutionY();

    // for each layer find the node by looking at the column name
    for (var i in _layers){
      var _layer = _layers[i];
      var _layerName = _layers[i].layerName.split(" ").join("_");
      var _found = false;

      // find the node
      for (var j in _nodes){
        if (_nodes[j].element.format != "PSD") continue;

        var _drawingColumn = _nodes[j].attributes.drawing.element.column;

        // update the node if found
        if (_drawingColumn.name == _layer.layerName){
          _psdNodes.push(_nodes[j]);
          _found = true;

           // update scale in case PSDfile size changed
          _nodes[j].scale.x = _scale;
          _nodes[j].scale.y = _scale;

          _positions[_layer.position] = _nodes[j];

          // store the element
          _PSDelement = _nodes[j].element

          break;
        }
        // if not found, add to the list of layers to import
        _found = false;
      }

      if (!_found) _missingLayers.push(_layer);
    }


    if (_psdNodes.length == 0){
      // PSD was never imported, use import instead?
      this.$.debug("can't find a PSD element to update", this.$.DEBUG_LEVEL.ERROR);
      this.$.endUndo();
      return null;
    }

    // pasting updated PSD into element
    CELIO.pasteImageFile({ src : _psdFile.path, dst : { elementId : _PSDelement.id, exposure : "1"}})

    for (var i in _missingLayers){
      // find previous import Settings re: group/alignment etc
      var _layer = _missingLayers[i];
      var _layerName = _layer.layerName.split(" ").join("_");

      var _layerIndex = _layer.position;
      var _nodePosition = new this.$.oPoint(0,0,0);
      var _group = _psdNodes[0].group;
      var _alignment = _psdNodes[0].alignment_rule;
      var _scale = _psdNodes[0].scale.x;
      var _peg = _psdNodes[0].inNodes[0];
      var _comp = _psdNodes[0].outNodes[0];
      var _scale = _info.height/scene.defaultResolutionY()
      var _port;

      //TODO: set into right group according to PSD organisation
      // looking for the existing node below and get the comp port from it
      for (var j = _layerIndex-1; j>=0; j--){
        if (_positions[j] != undefined) break;
      }
      var _nodeBelow = _positions[j];

      var _compNodes = _comp.inNodes;

      for (var j=0; j<_compNodes.length; j++){
        if (_nodeBelow.path == _compNodes[j].path){
          _port = j+1;
          _nodePosition = _compNodes[j].nodePosition;
          _nodePosition.x -= 35;
          _nodePosition.y -= 25;
        }
      }

      // generate nodes and set them to show the element for each layer
      var _node = this.addDrawingNode(_layerName, _nodePosition, _PSDelement);

      _node.enabled = _layer.visible;
      _node.can_animate = false; // use general pref?
      _node.apply_matte_to_color = "Straight";
      _node.alignment_rule = _alignment;
      _node.scale.x = _scale;
      _node.scale.y = _scale;

      _node.attributes.drawing.element.setValue(_layer.layer != ""?"1:"+_layer.layer:1, 1);
      _node.attributes.drawing.element.column.extendExposures();

      // find composite/peg to connect to based on other layers

      //if (addPeg) _node.linkInNode(_peg)
      if (_port) _node.linkOutNode(_comp, 0, _port)

      _nodes.push(_node);
    }
    this.$.endUndo();
    return nodes;
  } else{
      this.$.endUndo();
      throw new Error("updating a PSD imported as a flattened layer not yet implemented");
  }
}


/**
 * Import a generic image format (PNG, JPG, TGA etc) as a read node.
 * @param   {string}       path                          The image file to import.
 * @param   {string}         [alignment="ASIS"]            Alignment type.
 * @param   {$.oPoint}       [nodePosition={0,0,0}]        The position for the node to be placed in the node view.
 *
 * @return  {$.oNode[]}    The nodes that have been updated/created
 */
$.oGroupNode.prototype.importImage = function( path, alignment, nodePosition){
  if (typeof alignment === 'undefined') var alignment = "ASIS"; // create an enum for alignments?
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);

  var _imageFile = (path instanceof this.$.oFile)?path:new this.$.oFile( path );
  var _elementName = _imageFile.name;

  var _element = this.scene.addElement(_elementName, _imageFile.extension.toUpperCase());
  var _column = this.scene.addColumn(_elementName, "DRAWING", _element);
  _element.column = _column;

  if (_imageFile.exists) {
    // scene.saveAll();
    var _drawing = _element.addDrawing(1, 1, _imageFile.path);
  }else{
    this.$.debug("Image file to import "+_imageFile.path+" could not be found.", this.$.DEBUG_LEVEL.ERROR);
  }

  var _imageNode = this.addDrawingNode(_elementName, nodePosition, _element);

  _imageNode.can_animate = false; // use general pref?
  _imageNode.apply_matte_to_color = "Straight";
  _imageNode.alignment_rule = alignment;

  var _scale = CELIO.getInformation(_imageFile.path).height/this.scene.defaultResolutionY;
  _imageNode.scale.x = _scale;
  _imageNode.scale.y = _scale;

  _imageNode.attributes.drawing.element.setValue(_drawing.name, 1);
  _imageNode.attributes.drawing.element.column.extendExposures();

  // TODO how to display only one node with the whole file

  return _imageNode;
}




/**
 * Imports a QT into the group
 * @param   {string}         path                          The palette file to import.
 * @param   {bool}           importSound                   Whether to import the sound
 * @param   {bool}           extendScene                   Whether to extend the scene to the duration of the QT.
 * @param   {string}         alignment                     Alignment type.
 * @param   {$.oPoint}       nodePosition                  The position for the node to be placed in the network.
 *
 * @return {$.oNode}        The imported Quicktime Node.
 */
$.oGroupNode.prototype.importQT = function( path, importSound, extendScene, alignment, nodePosition){
  if (typeof alignment === 'undefined') var alignment = "ASIS";
  if (typeof extendScene === 'undefined') var extendScene = true;
  if (typeof importSound === 'undefined') var importSound = true;
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
  // MessageLog.trace("importing QT file :"+filename)

  var _QTFile = (path instanceof this.$.oFile)?path:new this.$.oFile(path);
  if (!_QTFile.exists){
    this.$.debug("Error: can't import Quicktime file "+_QTFile.path+" because it doesn't exist", this.$.DEBUG_LEVEL.ERROR);
    return null;
  }

  this.$.beginUndo("oH_importQT_"+_QTFile.name);

  var _elementName = _QTFile.name;

  var _element = this.scene.addElement(_elementName, "PNG");
  var _qtNode = this.addDrawingNode(_elementName, nodePosition, _element);
  var _column = _qtNode.attributes.drawing.element.column;
  _element.column = _column;

  // setup the node
  _qtNode.can_animate = false;
  _qtNode.alignment_rule = alignment;

  var _tempFolder = scene.tempProjectPathRemapped () + "/movImport/" + _elementName;
  var _audioPath = _tempFolder + "/" + _elementName + ".wav"

  // setup import

  MovieImport.setMovieFilename(_QTFile.path);
  MovieImport.setImageFolder(_tempFolder);
  MovieImport.setImagePrefix(_elementName);
  MovieImport.setAudioFile(_audioPath);
  this.$.log("doing import");
  MovieImport.doImport();
  this.$.log("import finished");
  var QTlength = MovieImport.numberOfImages()-1;

  this.$.debug("number of images imported : "+QTlength, this.$.DEBUG_LEVEL.ERROR);

  if (extendScene) this.scene.length = QTlength;

  // create expositions on the node
  for (var i = 1; i <= QTlength; i++ ) {
    // move the frame into the drawing
    var _framePath = _tempFolder + '/'+_elementName+'-' + i + '.png';
    var _drawing = _element.addDrawing(i, i, _framePath);
  }

  // creating an audio column for the sound
  if (importSound && MovieImport.isAudioFileCreated() ){
    var _soundName = _elementName + "_sound";
    var _soundColumn = this.scene.addColumn("SOUND", _soundName);
    column.importSound( _soundColumn.name, 1, _audioPath);
  }

  this.$.endUndo();
  return _qtNode;
}

