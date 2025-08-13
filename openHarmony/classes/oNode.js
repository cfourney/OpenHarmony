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
 * It holds the value of its position in the node view, and functions to link to other nodes, as well as set the attributes of the node.<br><br>
 * It uses a cache system, so a node for a given path will only be created once. <br>
 * If the nodes change path through other means than the openHarmony functions during the execution of the script, use oNode.invalidateCache() to create new nodes again.<br><br>
 * This constructor should not be invoqued by users, who should use $.scene.getNodeByPath() or $.scene.root.getNodeByName() instead.
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
function oNode ( path, oSceneObject ){
  var instance = this.$.getInstanceFromCache.call(this, path);
  if (instance) return instance;

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
oNode.prototype.attributesBuildCache = function (){
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
 */
oNode.prototype.setAttrGetterSetter = function (attr, context, oNodeObject){
    if (typeof context === 'undefined') context = this;
    // this.$.debug("Setting getter setters for attribute: "+attr.keyword+" of node: "+this.name, this.$.DEBUG_LEVEL.DEBUG)

    var _keyword = attr.shortKeyword;

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
                // this means every result of attr.getValue must be an object.
                // For attributes that have a string return value, attr.getValue() actually returns a fake string object
                // which is an object with a value property and a toString() method returning the value.
                var _value = (attr.column != null)?new oNodeObject.$.oList(attr.frames, 1):attr.getValue();
                //var _value = (attr.column != null)? attr.frames:attr.getValue();
                for (var i in _subAttrs){
                  oNodeObject.setAttrGetterSetter( _subAttrs[i], _value, oNodeObject);
                }
            }
            return _value;
        },

        set : function(newValue){
            // this.$.debug("setting attribute through getter setter "+attr.keyword+" to value: "+newValue, this.$.DEBUG_LEVEL.DEBUG)
            // if attribute has animation, passed value must be a frame object
            var _subAttrs = attr.subAttributes;

            // setting the attribute directly if no subattributes are present, or if value is a color (exception)
            if (_subAttrs.length == 0 || attr.type == "COLOR"){
                if (attr.column != null) {
                    if (!newValue.hasOwnProperty("frameNumber")) {
                        // fallback to set frame 1
                        newValue = {value:newValue, frameNumber:1};
                    }
                    attr.setValue(newValue.value, newValue.frameNumber)
                }else{
                    return attr.setValue(newValue)
                }
            }else{
                var _frame = undefined;
                var _value = newValue;
                // dealing with value being an object with frameNumber for animated values
                if (attr.column != null) {
                    if (!(newValue instanceof oFrame)) {
                        // fallback to set frame 1
                        newValue = {value:newValue, frameNumber:1};
                    }

                    _frame = newValue.frameNumber;
                    _value = newValue.value;
                }

                // setting non animated attribute value
                for (var i in _subAttrs){
                    // set each subAttr individually based on corresponding values in the provided object
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
 * @readonly
 * @type {string}
 */
Object.defineProperty(oNode.prototype, 'fullPath', {
    get : function( ){
      return this._path;
    }
});


/**
 * The path of the node (includes all groups from 'Top' separated by forward slashes).
 * To change the path of a node, use oNode.moveToGroup()
 * @name $.oNode#path
 * @type {string}
 * @readonly
 */
Object.defineProperty(oNode.prototype, 'path', {
    get : function( ){
      return this._path;
    }
});


/**
 * The type of the node.
 * @name $.oNode#type
 * @readonly
 * @type {string}
 */
Object.defineProperty(oNode.prototype, 'type', {
    get : function( ){
      return node.type( this.path );
    }
});


/**
 * Is the node a group?
 * @name $.oNode#isGroup
 * @readonly
 * @deprecated check if the node is an instance of oGroupNode instead
 * @type {bool}
 */
Object.defineProperty(oNode.prototype, 'isGroup', {
    get : function( ){
      if( this.root ){
        //in a sense, its a group.
        return true;
      }

      return node.isGroup( this.path );
    }
});


/**
 * The $.oNode objects contained in this group. This is deprecated and was moved to oGroupNode
 * @DEPRECATED Use oGroupNode.children instead.
 * @name $.oNode#children
 * @readonly
 * @type {$.oNode[]}
 */
Object.defineProperty(oNode.prototype, 'children', {
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
 * @readonly
 */
Object.defineProperty(oNode.prototype, 'exists', {
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
Object.defineProperty(oNode.prototype, 'selected', {
    get : function(){
      return selection.selectedNodes().indexOf(this.path) != -1;
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
Object.defineProperty(oNode.prototype, 'name', {
  get : function(){
     return node.getName(this.path);
  },

  set : function(newName){
    var _parent = node.parentNode(this.path);

    // create a node with the chosen name to get the safe name generated by Harmony
    var testName = node.add(_parent, newName, "", 0,0,0).split("/").pop()
    node.deleteNode(_parent + "/" + testName)

    // do the renaming and update the path
    node.rename(this.path, testName);
    this._path = _parent+'/'+testName;

    this.refreshAttributes();
  }
});

/**
 * The color of the node
 * @name $.oNode#nodeColor
 * @type {$.oColorValue}
 */
Object.defineProperty(oNode.prototype, 'nodeColor', {
  get : function(){
    var _color = node.getColor(this.path);
    return new this.$.oColorValue({r:_color.r, g:_color.g, b:_color.b, a:_color.a});
  },
  set : function(color){
    var _rgbacolor = new ColorRGBA(color.r, color.g, color.b, color.a);
    node.setColor(this.path, _rgbacolor);
  }
});

/**
 * The group containing the node.
 * @name $.oNode#group
 * @readonly
 * @type {oGroupNode}
 */
Object.defineProperty(oNode.prototype, 'group', {
    get : function(){
         return this.scene.getNodeByPath( node.parentNode(this.path) )
    }
});


/**
 * The $.oNode object for the parent in which this node exists.
 * @name $.oNode#parent
 * @readonly
 * @type {$.oNode}
 */
Object.defineProperty(oNode.prototype, 'parent', {
    get : function(){
      if( this.root ){ return false; }

      return this.scene.getNodeByPath( node.parentNode( this.path ) );
    }
});


/**
 * Is the node enabled?
 * @name $.oNode#enabled
 * @type {bool}
 */
Object.defineProperty(oNode.prototype, 'enabled', {
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
Object.defineProperty(oNode.prototype, 'locked', {
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
Object.defineProperty(oNode.prototype, 'isRoot', {
    get : function(){
         return this.path == "Top"
    }
});



/**
 * The list of backdrops which contain this node.
 * @name $.oNode#containingBackdrops
 * @readonly
 * @type {$.oBackdrop[]}
 */
 Object.defineProperty(oNode.prototype, 'containingBackdrops', {
  get : function(){
    var _backdrops = this.parent.backdrops;
    var _path = this.path;
    return _backdrops.filter(function(x){
      var _nodePaths = x.nodes.map(function(x){return x.path});
      return _nodePaths.indexOf(_path) != -1;
    })
  }
});


/**
 * The position of the node.
 * @name $.oNode#nodePosition
 * @type {oPoint}
 */
Object.defineProperty(oNode.prototype, 'nodePosition', {
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
Object.defineProperty(oNode.prototype, 'x', {
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
Object.defineProperty(oNode.prototype, 'y', {
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
Object.defineProperty(oNode.prototype, 'z', {
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
Object.defineProperty(oNode.prototype, 'width', {
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
Object.defineProperty(oNode.prototype, 'height', {
    get : function(){
         return node.height(this.path)
    }
});



/**
 * The list of oNodeLinks objects descibing the connections to the inport of this node, in order of inport.
 * @name $.oNode#inLinks
 * @readonly
 * @deprecated returns $.oNodeLink instances but $.oLink is preferred. Use oNode.getInLinks() instead.
 * @type {$.oNodeLink[]}
 */
Object.defineProperty(oNode.prototype, 'inLinks', {
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
 * @deprecated returns $.oNodeLink instances but $.oLink is preferred. Use oNode.linkedInNodes instead.
*/
Object.defineProperty(oNode.prototype, 'inNodes', {
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
Object.defineProperty(oNode.prototype, 'inPorts', {
  get : function(){
    return node.numberOfInputPorts(this.path);
  }
});


/**
 * The list of nodes connected to the outports of this node
 * @name $.oNode#outNodes
 * @readonly
 * @type {$.oNode[][]}
 * @deprecated  returns $.oNodeLink instances but $.oLink is preferred. Use oNode.linkedOutNodes instead.
*/
Object.defineProperty(oNode.prototype, 'outNodes', {
    get : function(){
        var _outNodes = [];
        var _outPorts = this.outPorts;

        for (var i = 0; i < _outPorts; i++){
            var _outLinks = [];
            var _outLinksNumber = this.getOutLinksNumber(i);
            for (var j = 0; j < _outLinksNumber; j++){
                var _node = this.getLinkedOutNode(i, j);

                if (_node != null) _outLinks.push(_node);
            }

            //Always return the list of links for consistency.
            _outNodes.push(_outLinks);
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
Object.defineProperty(oNode.prototype, 'outPorts', {
  get : function(){
    return node.numberOfOutputPorts(this.path);
  }
});


/**
 * The list of oNodeLinks objects descibing the connections to the outports of this node, in order of outport.
 * @name $.oNode#outLinks
 * @readonly
 * @type {$.oNodeLink[]}
 * @deprecated  returns $.oNodeLink instances but $.oLink is preferred. Use oNode.getOutLinks instead.
 */
Object.defineProperty(oNode.prototype, 'outLinks', {
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
 * The list of nodes connected to the inport of this node, as a flat list, in order of inport.
 * @name $.oNode#linkedOutNodes
 * @readonly
 * @type {$.oNode[]}
 */
Object.defineProperty(oNode.prototype, 'linkedOutNodes', {
  get: function(){
    var _outNodes = this.getOutLinks().map(function(x){return x.inNode});
    return _outNodes;
  }
})


/**
 * The list of nodes connected to the inport of this node, as a flat list, in order of inport.
 * @name $.oNode#linkedInNodes
 * @readonly
 * @type {$.oNode[]}
 */
Object.defineProperty(oNode.prototype, 'linkedInNodes', {
  get: function(){
    var _inNodes = this.getInLinks().map(function(x){return x.outNode});
    return _inNodes
  }
})


/**
 * The list of nodes connected to the inport of this node, in order of inport. Similar to oNode.inNodes
 * @name $.oNode#ins
 * @readonly
 * @type {$.oNode[]}
 * @deprecated alias for deprecated oNode.inNodes property
*/
Object.defineProperty(oNode.prototype, 'ins', {
    get : function(){
      return this.inNodes;
    }
});


/**
 * The list of nodes connected to the outport of this node, in order of outport and links. Similar to oNode.outNodes
 * @name $.oNode#outs
 * @readonly
 * @type {$.oNode[][]}
 * @deprecated alias for deprecated oNode.outNodes property
*/
Object.defineProperty(oNode.prototype, 'outs', {
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
Object.defineProperty(oNode.prototype, 'attributes', {
  get : function(){
      return this._attributes_cached;
  }
});


/**
 * The bounds of the node rectangle in the node view.
 * @name $.oNode#bounds
 * @readonly
 * @type {oBox}
*/
Object.defineProperty(oNode.prototype, 'bounds', {
  get : function(){
    return new this.$.oBox(this.x, this.y, this.x+this.width, this.y+this.height);
  }
});


/**
 * The transformation matrix of the node at the currentFrame.
 * @name $.oNode#matrix
 * @readonly
 * @type {oMatrix}
*/
Object.defineProperty(oNode.prototype, 'matrix', {
  get : function(){
    return this.getMatrixAtFrame(this.scene.currentFrame);
  }
});


/**
 * The list of all columns linked across all the attributes of this node.
 * @name $.oNode#linkedColumns
 * @readonly
 * @type {oColumn[]}
*/
Object.defineProperty(oNode.prototype, 'linkedColumns', {
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
Object.defineProperty(oNode.prototype, 'canCreateInPorts', {
  get : function(){
    return ["COMPOSITE",
            "GROUP",
            "MultiLayerWrite",
            "TransformGate",
            "TransformationSwitch",
            "DeformationCompositeModule",
            "MATTE_COMPOSITE",
            "COMPOSITE_GENERIC",
            "ParticleBkerComposite",
            "ParticleSystemComposite",
            "ParticleRegionComposite",
            "PointConstraintMulti",
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
Object.defineProperty(oNode.prototype, 'canCreateOutPorts', {
  get : function(){
    return ["GROUP",
            "MULTIPORT_IN"]
            .indexOf(this.type) != -1;
  }
})


/**
 * Returns the number of links connected to an in-port
 * @param   {int}      inPort      the number of the port to get links from.
 */
oNode.prototype.getInLinksNumber = function(inPort){
  if (this.inPorts < inPort) return null;
  return node.isLinked(this.path, inPort)?1:0;
}


/**
 * Returns the oLink object representing the connection of a specific inPort
 * @param   {int}      inPort      the number of the port to get links from.
 * @return  {$.oLink}  the oLink Object representing the link connected to the inport
 */
oNode.prototype.getInLink = function(inPort){
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
oNode.prototype.getInLinks = function(){
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
oNode.prototype.getFreeInPort = function(createNew){
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
oNode.prototype.linkInNode = function( nodeToLink, ownPort, destPort, createPorts){
  if (!(nodeToLink instanceof this.$.oNode)) throw new Error("Incorrect type for argument 'nodeToLink'. Must provide an $.oNode.")

  var _link = (new this.$.oLink(nodeToLink, this, destPort, ownPort)).getValidLink(createPorts, createPorts);
  if (_link == null) return;
  this.$.debug("linking "+_link, this.$.DEBUG_LEVEL.LOG);

  return _link.connect();
};


/**
 * Searches for and unlinks the $.oNode object from this node's inNodes.
 * @param   {$.oNode}   oNodeObject            The node to link this one's inport to.
 * @return  {bool}    The result of the unlink.
 */
oNode.prototype.unlinkInNode = function( oNodeObject ){
  var _node = oNodeObject.path;
  var _links = this.getInLinks();

  for (var i in _links){
    if (_links[i].outNode.path == _node) return _links[i].disconnect();
  }

  throw new Error (oNodeObject.name + " is not linked to node " + this.name + ", can't unlink.");
};


/**
 * Unlinks a specific port from this node's inport.
 * @param   {int}       inPort                 The inport to disconnect.
 *
 * @return  {bool}    The result of the unlink, if successful.
 */
oNode.prototype.unlinkInPort = function( inPort ){
  // Default values for optional parameters
  if (typeof inPort === 'undefined') inPort = 0;

  return node.unlink( this.path, inPort );
};


/**
 * Returns the node connected to a specific in-port
 * @param   {int}        inPort      the number of the port to get the linked Node from.
 * @return  {$.oNode}                The node connected to this in-port
 */
oNode.prototype.getLinkedInNode = function(inPort){
  if (this.inPorts < inPort) return null;
  return this.scene.getNodeByPath(node.srcNode(this.path, inPort));
}


/**
 * Returns the number of links connected to an outPort
 * @param   {int}      outPort      the number of the port to get links from.
 * @return  {int}    the number of links
 */
oNode.prototype.getOutLinksNumber = function(outPort){
  if (this.outPorts < outPort) return null;
  return node.numberOfOutputLinks(this.path, outPort);
}


/**
 * Returns the $.oLink object representing the connection of a specific outPort / link
 * @param   {int}      outPort      the number of the port to get the link from.
 * @param   {int}      [outLink]    the index of the link.
 * @return {$.oLink}   The link object describing the connection
 */
oNode.prototype.getOutLink = function(outPort, outLink){
  if (typeof outLink === 'undefined') var outLink = 0;

  if (this.outPorts < outPort) return null;
  if (this.getOutLinksNumber(outPort) < outLink) return null;

  var _info = node.dstNodeInfo(this.path, outPort, outLink);
  if (!_info) return null;

  var _outNode = this.scene.getNodeByPath(_info.node);
  var _outLink = new this.$.oLink(this, _outNode, outPort, _info.port, outLink, true);

  return _outLink;
}


/**
 * Returns all the valid oLink objects describing the links that are coming out of this node.
 * @return {$.oLink[]}  An array of $.oLink objects.
 */
oNode.prototype.getOutLinks = function(){
  var _outPorts = this.outPorts;
  var _links = [];

  for (var i = 0; i<_outPorts; i++){
    var _outLinks = this.getOutLinksNumber(i);
    for (var j = 0; j<_outLinks; j++){
      var _link = this.getOutLink(i, j);
      if (_link != null) _links.push(_link);
    }
  }

  return _links;
}


/**
 * Returns a free unconnected out-port
 * @param  {bool}  [createNew=false]  Whether to allow creation of new ports
 * @return {int} the port number that isn't connected
 */
oNode.prototype.getFreeOutPort = function(createNew){
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
 * Traverses the node hierarchy up until if finds a node matching the condition.
 * @param {function} condition a function returning true or false which can be used to find the node
 * @param {bool} lookInsideGroups wether to consider the nodes inside connected groups
 * @returns {$.oNode} the found node
 */
oNode.prototype.findFirstInNodeMatching = function(condition, lookInsideGroups){
  if (typeof lookInsideGroups === 'undefined') var lookInsideGroups = false;

  var _linkedNodes = this.linkedInNodes;
  if (!_linkedNodes.length) return null;

  for (var i in _linkedNodes){
    if (condition(_linkedNodes[i])) return _linkedNodes[i];
  }
  for (var i in _linkedNodes){
    var _node = _linkedNodes[i].findFirstInNodeMatching(condition, lookInsideGroups);
    if (_node) return _node;
  }
  return null;
}


/**
 * Traverses the node hierarchy down until if finds a node matching the condition.
 * @param {function} condition a function returning true or false which can be used to find the node
 * @param {bool} lookInsideGroups wether to consider the nodes inside connected groups
 * @returns {$.oNode} the found node
 */
oNode.prototype.findFirstOutNodeMatching = function(condition, lookInsideGroups){
  if (typeof lookInsideGroups === 'undefined') var lookInsideGroups = false;

  var _linkedNodes = this.linkedOutNodes;
  if (!_linkedNodes.length) return null;

  for (var i in _linkedNodes){
    if (condition(_linkedNodes[i])) return _linkedNodes[i];
  }
  for (var i in _linkedNodes){
    var _node = _linkedNodes[i].findFirstOutNodeMatching(condition, lookInsideGroups);
    if (_node) return _node;
  }
  return null;
}


/**
 * Traverses the node hierarchy up until if finds a node of the given type.
 * @param {string} type the type of node we are looking for
 * @param {bool} lookInsideGroups wether to consider the nodes inside connected groups
 * @returns {$.oNode} the found node
 */
oNode.prototype.findFirstInNodeOfType = function(type, lookInsideGroups){
  return this.findFirstInNodeMatching(function(x){return x.type == type});
}

/**
 * Traverses the node hierarchy down until if finds a node of the given type.
 * @param {string} type the type of node we are looking for
 * @param {bool} lookInsideGroups wether to consider the nodes inside connected groups
 * @returns {$.oNode} the found node
 */
oNode.prototype.findFirstOutNodeOfType = function(type, lookInsideGroups){
  return this.findFirstOutNodeMatching(function(x){return x.type == type});
}


/**
 * Traverses the node hierarchy up until if finds a node of the given type.
 * @param {string} type the type of node we are looking for
 * @param {bool} lookInsideGroups wether to consider the nodes inside connected groups
 * @returns {$.oNode} the found node
 */
oNode.prototype.findFirstInLinkOfType = function(type){
  var _inNode = this.findFirstInNodeMatching(function(x){return x.type == type})
  if (_inNode) return new $.oLinkPath(_inNode, this);
  return null;
}


/**
 * Traverses the node hierarchy up until if finds a node of the given type.
 * @param {string} type the type of node we are looking for
 * @param {bool} lookInsideGroups wether to consider the nodes inside connected groups
 * @returns {$.oNode} the found node
 */
oNode.prototype.findFirstOutLinkOfType = function(type){
  var _outNode = this.findFirstOutNodeMatching(function(x){return x.type == type})
  if (_outNode) return new $.oLinkPath(this, _outNode);
  return null;
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
oNode.prototype.linkOutNode = function(nodeToLink, ownPort, destPort, createPorts){
  if (!(nodeToLink instanceof this.$.oNode)) throw new Error("Incorrect type for argument 'nodeToLink'. Must provide an $.oNode.")

  var _link = (new this.$.oLink(this, nodeToLink, ownPort, destPort)).getValidLink(createPorts, createPorts)
  if (_link == null) return;
  this.$.debug("linking "+_link, this.$.DEBUG_LEVEL.LOG);

  return _link.connect();
}


/**
 * Links this node's out-port to the given module, at the inport and outport indices.
 * @param   {$.oNode}   oNodeObject            The node to unlink from this node's outports.
 *
 * @return  {bool}    The result of the link, if successful.
 */
oNode.prototype.unlinkOutNode = function( oNodeObject ){
  var _node = oNodeObject.path;

  var _links = this.getOutLinks();

  for (var i in _links){
    if (_links[i].inNode.path == _node) return _links[i].disconnect();
  }

  throw new Error (oNodeObject.name + " is not linked to node " + this.name + ", can't unlink.");
};


/**
 * Returns the node connected to a specific outPort
 * @param   {int}      outPort      the number of the port to get the node from.
 * @param   {int}      [outLink=0]  the index of the link.
 * @return  {$.oNode}   The node connected to this outPort and outLink
 */
oNode.prototype.getLinkedOutNode = function(outPort, outLink){
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
oNode.prototype.unlinkOutPort = function( outPort, outLink ){
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
oNode.prototype.insertInNode = function( inPort, oNodeObject, inPortTarget, outPortTarget ){
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
oNode.prototype.moveToGroup = function(group){
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

    this.refreshAttributes();

    this.$.endUndo();
  }
}


/**
 * Get the transformation matrix for the node at the given frame
 * @param {int} frameNumber
 * @returns {oMatrix}  the matrix object
 */
oNode.prototype.getMatrixAtFrame = function (frameNumber){
  return new this.$.oMatrix(node.getMatrix(this.path, frameNumber));
}


/**
 * Retrieves the node layer in the timeline provided.
 * @param   {oTimeline}   [timeline]     Optional: the timeline object to search the column Layer. (by default, grabs the current timeline)
 *
 * @return  {int}    The index within that timeline.
 */
 oNode.prototype.getTimelineLayer = function(timeline){
  if (typeof timeline === 'undefined') var timeline = this.$.scene.currentTimeline;

  var _nodeLayers = timeline.layers.map(function(x){return x.node.path});
  if (_nodeLayers.indexOf(this.path)<timeline.layers.length && _nodeLayers.indexOf(this.path)>0){
    return timeline.layers[_nodeLayers.indexOf(this.path)];
  }
  return null
}


/**
 * Retrieves the node index in the timeline provided.
 * @param   {oTimeline}   [timeline]     Optional: the timeline object to search the column Layer. (by default, grabs the current timeline)
 *
 * @return  {int}    The index within that timeline.
 */
oNode.prototype.timelineIndex = function(timeline){
  if (typeof timeline === 'undefined') var timeline = this.$.scene.currentTimeline;

  var _nodes = timeline.compositionLayersList;
  return _nodes.indexOf(this.path);
}


/**
 * obtains the nodes contained in the group, allows recursive search. This method is deprecated and was moved to oGroupNode
 * @DEPRECATED
 * @param   {bool}   recurse           Whether to recurse internally for nodes within children groups.
 *
 * @return  {$.oNode[]}    The subbnodes contained in the group.
 */
oNode.prototype.subNodes = function(recurse){
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
oNode.prototype.centerAbove = function( oNodeArray, xOffset, yOffset ){
  if (!oNodeArray) throw new Error ("An array of nodes to center node '"+this.name+"' above must be provided.")

  // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = -30;

    // Works with nodes and nodes array
    if (oNodeArray instanceof this.$.oNode) oNodeArray = [oNodeArray];
    if (oNodeArray.filter(function(x){return !x}).length) throw new Error ("Can't center node '"+ this.name+ "' above nodes "+ oNodeArray + ", invalid nodes found.")

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
oNode.prototype.centerBelow = function( oNodeArray, xOffset, yOffset){
    if (!oNodeArray) throw new Error ("An array of nodes to center node '"+this.name+"' below must be provided.")

    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = 30;

    // Works with nodes and nodes array
    if (oNodeArray instanceof this.$.oNode) oNodeArray = [oNodeArray];
    if (oNodeArray.filter(function(x){return !x}).length) throw new Error ("Can't center node '"+ this.name+ "' below nodes "+ oNodeArray + ", invalid nodes found.")

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
oNode.prototype.placeAtCenter = function( oNodeArray, xOffset, yOffset ){
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
 * Sorts the nodes above this node in a grid like manner, based on their links.
 * @param   {int}     [verticalSpacing=120]   optional: The spacing between two rows of nodes.
 * @param   {int}     [horizontalSpacing=40]   optional: The spacing between two nodes horizontally.
 */
oNode.prototype.orderAboveNodes = function(verticalSpacing, horizontalSpacing){
  if (typeof verticalSpacing === 'undefined') var verticalSpacing = 120;
  if (typeof horizontalSpacing === 'undefined') var horizontalSpacing = 40;

  this.$.beginUndo()

  var startNode = this;
  var nodeHeights = {}

  nodeHeights[startNode.path] = 0
  var levels = [[startNode]];
  var widestLevel = 0
  var biggestWidth = 0

  function getNodesWidth(nodes){
    var width = 0;
    for (var i in nodes){
      var spacing = horizontalSpacing;
      width += nodes[i].width + spacing;
    }
    return width;
  }

  // getting node heights in the hierarchy by counting the links from the base node
  function getHeights(startNode, nodeHeights){
    var nodeHeight = nodeHeights[startNode.path];
    var newHeight = nodeHeight + 1;
    if (!levels[newHeight]) levels[newHeight] = [];
    var level = levels[newHeight];

    for (var i in startNode.linkedInNodes){
      var linkedNode = startNode.linkedInNodes[i];
      if (!nodeHeights[linkedNode.path]) nodeHeights[linkedNode.path] = 0;
      if (nodeHeights[linkedNode.path] < newHeight) nodeHeights[linkedNode.path] = newHeight;

      var paths = level.map(function(x){return x.path}); // avoid duplicates
      if (paths.indexOf(linkedNode.path) == -1) level.push(linkedNode);

      getHeights(linkedNode, nodeHeights);
    }
  }

  getHeights(startNode, nodeHeights);

  // remove duplicate nodes present on the wrong levels
  for (var i in levels){
    var row = levels[i];
    for (var j = row.length-1; j>=0; j--){
      var levelNode = row[j];
      var nodeHeight = nodeHeights[levelNode.path];
      if (i != nodeHeight) row.splice(j, 1);
    }
  }

  // getting widest row index and geometry
  for (var i=1; i<levels.length; i++){
    var row = levels[i];
    row.reverse();

    var totalWidth = getNodesWidth(row);

    if (totalWidth > biggestWidth){
      widestLevel = i;
      biggestWidth = totalWidth;
    }
  }

  // sort out widest level first
  var row = levels[widestLevel];

  var totalWidth = getNodesWidth(row);
  var middle = startNode.bounds.center.x

  var left = middle - totalWidth/2;
  var top = startNode.bounds.top + widestLevel * (- verticalSpacing - startNode.height);

  for (var j in row){
    var aNode = row[j];
    var xOffset = 0;
    var nodes = row.slice(0, j);
    xOffset = getNodesWidth(nodes);

    aNode.x = left + xOffset;
    aNode.y = top;
  }

  // keeping track of the nodes that can't be sorted
  var failedUpSort = [];
  var failedDownSort = [];

  // sort up from widest level
  for (var i = widestLevel+1; i<levels.length; i++){
    var row = levels[i];
    for (var j in row){
      var belowNodes = row[j].linkedOutNodes.filter(function(x){return nodeHeights[x.path] >= widestLevel});
      if (!belowNodes.length){
        failedUpSort.push(row[j]);
      }else{
        row[j].centerAbove(belowNodes, 0, -verticalSpacing);
      }
    }
  }

  // sort below widest level
  for (var i = widestLevel-1; i>0; i--){
    var row = levels[i];
    for (var j in row){
      var aboveNodes = row[j].linkedInNodes.filter(function(x){return nodeHeights[x.path] <= widestLevel});
      if (!aboveNodes.length){
        failedDownSort.push(row[j]);
      }else{
        row[j].centerBelow(aboveNodes, 0, verticalSpacing);
      }
    }
  }

  // sort orphaned nodes by placing them on an inbetween level
  for (var i in failedUpSort){
    var sortNode = failedUpSort[i];s
    sortNode.centerBelow(sortNode.linkedInNodes, 0, verticalSpacing/2);
  }

  // sort orphaned nodes
  for (var i in failedDownSort){
    var sortNode = failedDownSort[i];
    sortNode.centerAbove(sortNode.linkedOutNodes, 0, -verticalSpacing/2);
  }


  $.endUndo()
}

 /**
 * Create a clone of the node.
 * @param   {string}    newName              The new name for the cloned module.
 * @param   {oPoint}    newPosition          The new position for the cloned module.
 */
oNode.prototype.clone = function( newName, newPosition ){
  // Defaults for optional parameters
  if (typeof newPosition === 'undefined') var newPosition = this.nodePosition;
  if (typeof newName === 'undefined') var newName = this.name+"_clone";

  this.$.beginUndo("oH_cloneNode_"+this.name);

  var _clonedNode = this.group.addNode(this.type, newName, newPosition);
  var _attributes = this.attributes;

  for (var i in _attributes){
    var _clonedAttribute = _clonedNode.getAttributeByName(_attributes[i].keyword);
    _clonedAttribute.setToAttributeValue(_attributes[i]);
  }

  var palettes = this.palettes
  for (var i in palettes){
    _clonedNode.linkPalette(palettes[i])
  }

  this.$.endUndo();

  return _clonedNode;
};


 /**
 * Duplicates a node by creating an independent copy.
 * @param   {string}    [newName]              The new name for the duplicated node.
 * @param   {oPoint}    [newPosition]          The new position for the duplicated node.
 */
oNode.prototype.duplicate = function(newName, newPosition){
  if (typeof newPosition === 'undefined') var newPosition = this.nodePosition;
  if (typeof newName === 'undefined') var newName = this.name+"_duplicate";

  this.$.beginUndo("oH_cloneNode_"+this.name);

  var _duplicateNode = this.group.addNode(this.type, newName, newPosition);
  var _attributes = this.attributes;

  for (var i in _attributes){
    var _duplicateAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
    _duplicateAttribute.setToAttributeValue(_attributes[i], true);
  }

  var palettes = this.palettes
  for (var i in palettes){
    _duplicateNode.linkPalette(palettes[i])
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
oNode.prototype.remove = function( deleteColumns, deleteElements ){
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
oNode.prototype.getAttributeByName = function( keyword ){
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
oNode.prototype.toString = function(){
    return this.path;
}


 /**
 * Provides a matching attribute based on the column name provided. Assumes only one match at the moment.
 * @param   {string}       columnName                    The column name to search.
 * @return  {oAttribute}   The matched attribute object, given the column name.
 */
oNode.prototype.getAttributeByColumnName = function( columnName ){
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
  // return attribs;
}


 /**
 * Provides a column->attribute lookup table for timeline building.
 * @private
 * @return  {object}   The column_name->attribute object LUT.  {colName: { "node":oNode, "column":oColumn } }
 */
oNode.prototype.getAttributesColumnCache = function( obj_lut ){
  if (typeof obj_lut === 'undefined') obj_lut = {};

  for( var n in this.attributes ){
    var t_attrib = this.attributes[n];
    if( t_attrib.subAttributes.length>0 ){
      //Also check subattributes.
      for( var t=0;t<t_attrib.subAttributes.length;t++ ){
        var t_attr = t_attrib.subAttributes[t];
        if( t_attr.column ){
          obj_lut[ t_attr.column.uniqueName ] = { "node":this, "attribute":t_attr };
        }
      }
    }

    if( t_attrib.column ){
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
oNode.prototype.addOutLink = function( nodeToLink, ownPort, destPort ){
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
oNode.prototype.createAttribute = function( attrName, type, displayName, linkable ){
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
oNode.prototype.removeAttribute = function( attrName ){
  attrName = attrName.toLowerCase();
  return node.removeDynamicAttr( this.path, attrName );
}


/**
 * Refreshes/rebuilds the attributes and getter/setters.
 * @param   {$.oNode}   oNodeObject            The node to link this one's inport to.
 * @return  {bool}    The result of the unlink.
 */
oNode.prototype.refreshAttributes = function( ){
    // generate properties from node attributes to allow for dot notation access
    this.attributesBuildCache();

    // for each attribute, create a getter setter as a property of the node object
    // that handles the animated/not animated duality
    var _attributes = this.attributes
    for (var i in _attributes){
      var _attr = _attributes[i];
      this.setAttrGetterSetter(_attr, this, this);
    }
}

exports = oNode;