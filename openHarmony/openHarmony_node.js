//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, ...
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
//   This library is made available under the MIT license.
//   https://opensource.org/licenses/mit
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
 * The base class for the node.
 * @constructor
 * @classdesc  Node Class    
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * <br> The constructor for the scene object, new this.$.oScene($) to create a scene with DOM access.
 */
$.oNode = function( path, oSceneObject ){
    this._path = path;
    this.type  = node.type(this.path);
    this.scene = oSceneObject;
    
    this._type = 'node';
    
    // generate properties from node attributes to allow for dot notation access
     var _attributes = this.attributes
     
    // for each attribute, create a getter setter as a property of the node object 
    // that handles the animated/not animated duality
    
    for (var i in _attributes){
        var _attr = _attributes[i]
        this.setAttrGetterSetter(_attr)
    }
}

/**
 * Private function to create attributes setters and getters as properties of the node
 * @private 
 * @return  {void}   Nothing returned.
 */
$.oNode.prototype.setAttrGetterSetter = function (attr, context){
    if (typeof context === 'undefined') context = this;
    // MessageLog.trace("Setting getter setters for attribute: "+attr.keyword+" of node: "+this.name)
    // System.println( "Setting getter setters for attribute: "+attr.keyword+" of node: "+this.name );
 
    var _keyword = attr.shortKeyword;
    
    if( typeof( this[_keyword] ) !== 'undefined' ){
      //Already exists in properties.
      return;
    }
    
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
            // MessageLog.trace("setting attribute "+attr.keyword+" to value: "+newValue)
            // if attribute has animation, passed value must be a frame object            
            var _subAttrs = attr.subAttributes;
            // MessageLog.trace("is animated? "+(attr.column != null)+" has subattributes? "+(_subAttrs.length != 0))
            
            if (_subAttrs.length == 0){
                if (attr.column != null) {
                    // MessageLog.trace("value is oFrame? "+(newValue instanceof oFrame))
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
    })
};

/**
 * The derived path to the node.
 * @deprecated
 * @name $.oNode#fullPath
 * @type {string}
 */
Object.defineProperty($.oNode.prototype, 'fullPath', {
    get : function( ){
      return this._path;
    },
 
    set : function( str_path ){
      //A move and rename might be in order. . .  Manage this here.
      
      this.$.debug( "ERROR - changing the path is not supported yet: " + this._path, this.$.DEBUG_LEVEL.WARNING );
      throw "ERROR - changing the path is not supported yet."
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
      
      this.$.debug( "ERROR - changing the path is not supported yet: " + this._path, this.$.DEBUG_LEVEL.WARNING );
      throw "ERROR - changing the path is not supported yet."
    }
});

/**
 * The type of the node.
 * @name $.oNode#type
 * @type {string}
 */
Object.defineProperty( $.oNode.prototype, 'type', {
    get : function( ){
      return node.type( this.path );
    },
 
    set : function( bool_exist ){
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
 * The $.oNode objects contained in this group.
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
    get : function( ){
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
    get : function( ){
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
         return node.getName(this.path)
    },
 
    set : function(newName){
        var _parent = node.parentNode(this.path)
        var _node = node.rename(this.path, newName)
        this.path = _parent+'/'+newName;
    }
 
});


/**
 * The group containing the node, the parent path, not including this node specifically.
 * @name $.oNode#group
 * @type {string}
 */
Object.defineProperty($.oNode.prototype, 'group', {
    get : function(){
         return node.parentNode(this.path)
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
        var _name = this.name
        node.moveToGroup(this.path, newPath)
        this.path = newPath + '/' + _name;
    }
 
});
 

/**
 * The $.oNode object for the parent in which this node exists.
 * @name $.oNode#parent
 * @type {$.oNode}
 */
Object.defineProperty( $.oNode.prototype, 'parent', {
    get : function(){
      if( this.root ){ return false; }
    
      return this.scene.getNodeByPath( node.parentNode( this.path ) ); 
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
    }
 
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
      try{ _z = node.coordZ(this.path); } catch( err ){} //coordZ not implemented in earlier Harmony versions. 
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
        node.setCoord(this.path, x, _pos.y, _pos.z)
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
        node.setCoord(this.path, _pos.x, y, _pos.z)
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
        try{ _z = node.coordZ(this.path); } catch( err ){} //coordZ not implemented in earlier Harmony versions. 
    
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
 * @type {float}
 */  
Object.defineProperty($.oNode.prototype, 'height', {
    get : function(){
         return node.height(this.path)
    }
});
 

/**
 * The list of nodes connected to the inport of this node, in order of inport.
 * @name $.oNode#inNodes
 * @type {$.oNode[]}
*/
Object.defineProperty($.oNode.prototype, 'inNodes', {
    get : function(){
        var _inNodes = [];
        // TODO: ignore/traverse groups
        for (var i = 0; i < node.numberOfInputPorts(this.path); i++){
            var _node = node.srcNode(this.path, i)
            _inNodes.push(this.scene.getNodeByPath(_node))
        }
        return _inNodes;
    }
});
 

/**
 * The list of nodes connected to the outport of this node, in order of outport and links.
 * @name $.oNode#outNodes
 * @type {$.oNode[][]}
*/
Object.defineProperty($.oNode.prototype, 'outNodes', {
    get : function(){
        var _outNodes = [];
        for (var i = 0; i < node.numberOfOutputPorts(this.path); i++){
            var _outLinks = [];
            for (var j = 0; j < node.numberOfOutputLinks(this.path, i); j++){
                // TODO: ignore/traverse groups
                var _node = node.dstNode(this.path, i, j);
                _outLinks.push(this.scene.getNodeByPath(_node));
            }
            if (_outLinks.length > 1){
                _outNodes.push(_outLinks);
            }else{
                _outNodes = _outNodes.concat(_outLinks);
            }
        }
        return _outNodes;
    }
});

/**
 * The list of nodes connected to the inport of this node, in order of inport.
 * @name $.oNode#ins
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
 * @type {$.oNode[][]}
*/
Object.defineProperty($.oNode.prototype, 'outs', {
    get : function(){
      return this.outNodes;
    }
});


/**
 * The list of attributes that this node contains.
 * @name $.oNode#attributes
 * @type {oAttribute}
*/
Object.defineProperty($.oNode.prototype, 'attributes', {
    get : function(){
        var _attributesList = node.getAttrList(this.path, 1);
        var _attributes = {};
     
        for (var i in _attributesList){
     
            var _attribute = new this.$.oAttribute(this, _attributesList[i]);
            var _keyword = _attribute.keyword;
     
            _attributes[_keyword] = _attribute;
        }
     
        return _attributes;
    }
}); 


/**
 * The bounds of the node.
 * @name $.oNode#bounds
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
 * @type {oColumn[]}
*/
Object.defineProperty($.oNode.prototype, 'linkedColumns', {
    get : function(){
        var _attributes = this.attributes
        var _columns = [];
        
        for (var i in _attributes){
            var _column = _attributes[i].column;
            if (_column != null) _columns.push(_column)
            
            // look also at subAttributes
            var _subAttributes = _attributes[i].subAttributes
            if (_subAttributes.length > 0) {
                for (var j in _subAttributes){
                    _column = _subAttributes[j].column;
                    if (_column != null) _columns.push(_column)
                }
            }   
        }
        return _columns;
    }
})

/**
 * Retrieves the nodes index in the timeline provided.
 * @param   {oTimeline}   timeline            The timeline object to search the nodes index.
 *  
 * @return  {int}    The index within that timeline.
 */
 $.oNode.prototype.timelineIndex = function(timeline){
    var _timeline = timeline.layersList;
    return _timeline.indexOf(this.path);
}
 
/**
 * Link's this node's in-port to the given module, at the inport and outport indices.
 * @param   {$.oNode}   oNodeObject            The node to link this one's inport to.
 * @param   {int}       inPort                 This node's inport to connect.
 * @param   {int}       outPort                The target node's outport to connect. 
 *  
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.linkInNode = function( oNodeObject, inPort, outPort ){
    var _node = oNodeObject.path;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(_node);
 
    return node.link(_node, outPort, this.path, inPort, true, true);
 
};


/**
 * Searches for and unlinks the $.oNodeObject from this node's inNodes.
 * @param   {$.oNode}   oNodeObject            The node to link this one's inport to.
 * @return  {bool}    The result of the unlink.
 */
$.oNode.prototype.unlinkInNode = function( oNodeObject ){
    //CF Note: Should be able to define the port.
  
    var _node = oNodeObject.path;
   
    // MessageLog.trace("unlinking "+this.name+" from "+$.oNodeObject.name)
    var _inNodes = this.inNodes;
    // MessageLog.trace(_inNodes.length)
   
    for (var i in _inNodes){
       
        // MessageLog.trace(_inNodes[i].path+" "+_node)
       
        if (_inNodes[i].path == _node){
            return node.unlink(this.path, i)
        }
    }
    return false;
};


/**
 * Link's this node's out-port to the given module, at the inport and outport indices.
 * @param   {$.oNode} oNodeObject            The node to link this one's outport to.
 * @param   {int}     inPort                 The target node's inport to connect.
 * @param   {int}     outPort                This node's outport to connect. 
 *  
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.linkOutNode = function( oNodeObject, outPort, inPort ){
    var _node = oNodeObject.path;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = node.numberOfInputPorts(_node);;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(this.path);
 
    //CF Note: Forcing ( . . . true, true ) is likely not a good idea in most context, we'll need to provide solution to add links to composites purposefully.
    return node.link(this.path, outPort, _node, inPort, true, true); 
};

/**
 * Link's this node's out-port to the given module, at the inport and outport indices.
 * @param   {$.oNode}   $.oNodeObject            The node to unlink from this node's outports.
 *  
 * @return  {bool}    The result of the link, if successful.
 */
$.oNode.prototype.unlinkOutNode = function( oNodeObject ){
    //CF Note: Should be able to define the port.
  
    var _node = oNodeObject.path;
   
    var _inNodes = oNodeObject.inNodes;
   
    for (var i in _inNodes){
        if (_inNodes[i].path == this.path){
            return node.unlink(_node, i)
        }
    }
    return false;
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
 * obtains the nodes contained in the group, allows recursive search.
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
    if (typeof yOffset === 'undefined') var yOffset = 0;
 
    // Works with nodes and nodes array
    if (typeof oNodeArray === '$.oNode') oNodeArray = [ oNodeArray ];
 
    var _box = new this.$.oBox();
    _box.includeNodes( oNodeArray )
    
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
    if (typeof yOffset === 'undefined') var yOffset = 0;
 
    // Works with nodes and nodes array
    if (typeof oNodeArray === '$.oNode') oNodeArray = [oNodeArray];
    
    var _box = new this.$.oBox();
    _box.includeNodes(oNodeArray)
 
    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.bottom - this.height + yOffset;
   
    return new this.$.oPoint(this.x, this.y, this.z)
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
    if (typeof oNodeArray === '$.oNode') oNodeArray = [oNodeArray];
 
    var _box = new this.$.oBox();
    _box.includeNodes(oNodeArray)
 
    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.center.y - this.height/2 + yOffset;
   
    return new this.$.oPoint(this.x, this.y, this.z)
}
 
 

 /**
 * Place a node above one or more nodes with an offset.
 * @param   {string}    newName              The new name for the cloned module.
 * @param   {oPoint}    newPosition          The new position for the cloned module.
 * @param   {string}    [newGroup]           The group in which to place the cloned module.
 */
$.oNode.prototype.clone = function( newName, newPosition, newGroup ){
    // Defaults for optional parameters
    if (typeof newGroup === 'undefined') var newGroup = this.group;

    // TODO implement cloning through column linking as opposed to copy paste logic
 
    var _node = this.path;
    var _copyOptions = copyPaste.getCurrentCreateOptions();
    var _copy = copyPaste.copy([_node], 1, frame.numberOf(), _copyOptions);
    var _pasteOptions = copyPaste.getCurrentPasteOptions();
    copyPaste.pasteNewNodes(_copy, newGroup, _pasteOptions);
};
 
 
 /**
 * WIP.
 * @param   {string}    newName              The new name for the cloned module.
 * @param   {oPoint}    newPosition          The new position for the cloned module.
 */
$.oNode.prototype.duplicate= function( oNodeObject, newName, newPosition ){
    // TODO
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
   
    // restore links for special types
    if (this.type == "PEG"){
        var inNodes = this.inNodes; //Pegs can only have one inNode but we'll implement the general case for other types
        var outNodes = this.outNodes;
        for (var i in inNodes){
            for (var j in outNodes){
                inNodes[i].linkOutNode(outNodes[j])
            }
        }
    }
   
    node.deleteNode(this.path, deleteColumns, deleteElements)
}

 /**
 * Provides a matching attribute based on provided keyword name.
 * @param   {string}    keyword                    The attribute keyword to search.
 * @return  {oAttribute}   The matched attribute object, given the keyword.
 */
$.oNode.prototype.getAttributeByName = function( keyword ){
    if (keyword.indexOf(".")){
        keyword = keyword.toLowerCase();
        keyword = keyword.split(".");
        var _attribute = keyword[0];
        var _subAttribute = keyword[1];
        
        if (_subAttribute == "3dpath") _subAttribute = "path3d";
        
        if (!this.attributes.hasOwnProperty(_attribute)) return null;
        if (!this.attributes[_attribute].hasOwnProperty(_subAttribute)) return this.attributes[_attribute];
        
        return this.attributes[_attribute][_subAttribute];
    }else{
        if (!this.hasOwnProperty(keyword)) return null;
        return this.attributes[keyword];
    }
}

 /**
 * Used in converting the node to a string value, provides the string-path.
 * @return  {string}   The node path's as a string.
 */
$.oNode.prototype.toString = function(){
    return this.path;
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
    $.oNode.call( this, path, oSceneObject );
    
    this._type = 'pegNode';
}
 
// extends $.oNode and can use its methods
$.oPegNode.prototype = Object.create( $.oNode.prototype );
 
//CF NOTE: Use Separate is ambiguous, as scale, and position can be separate too. Perhaps useSeparate is distinct for position, and rotationUseSeparate otherwise?
 /**
 * Whether the position is separate.
 * @name $.oPegNode#useSeparate
 * @type {bool}
 */
Object.defineProperty($.oPegNode.prototype, "useSeparate", {
    get : function(){
       
    },
   
    set : function( _value ){
        // TODO: when swapping from one to the other, copy key values and link new columns if missing
    }
})




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
 * The drawing module base class for the node.
 * @constructor
 * @augments   $.oNode
 * @classdesc  Drawing Moudle Class    
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * <br> The constructor for the scene object, new this.$.oScene($) to create a scene with DOM access.
 */
$.oDrawingNode = function(path, oSceneObject) {
    // $.oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'READ') throw "'path' parameter must point to a 'READ' type node";
    $.oNode.call(this, path, oSceneObject);
    
    this._type = 'drawingNode';
}
 
$.oDrawingNode.prototype = Object.create($.oNode.prototype);
 
/**
 * The oElement class of the drawing.
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
})


/**
 * The drawing.element keyframes.
 * @name $.oDrawingNode#timings
 * @type {oFrames[]}
 */
Object.defineProperty($.oDrawingNode.prototype, "timings", {
    get : function(){
        return this.attributes.drawing.element.getKeyFrames()
   }
})

// Class Methods

 /**
 * Extracts the position information on a drawing node, and applies it to a new peg instead.
 * @return  {$.oPegNode}   The created peg.
 */
$.oDrawingNode.prototype.extractPeg = function(){
    var _drawingNode = this;
    var _peg = this.scene.addNode("PEG", this.name+"-P");
    var _columns = _drawingNode.linkedColumns;
    
    _peg.position.separate = _drawingNode.offset.separate;
    _peg.scale.separate = _drawingNode.scale.separate;
    
    // link each column that can be to the peg instead and reset the drawing node
    for (var i in _columns){
        var _attribute = _columns[i].attributeObject;
        var _keyword = _attribute.keyword;

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
    var _curves = res.results.map( function (x){ return [ 
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
 * The group module base class for the node.
 * @constructor
 * @augments   $.oNode
 * @classdesc  $.oGroupNode Class    
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * <br> The constructor for the scene object, new this.$.oScene($) to create a scene with DOM access.
 */
$.oGroupNode = function(path, oSceneObject) {
    // $.oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'GROUP') throw "'path' parameter must point to a 'GROUP' type node";
    $.oNode.call(this, path, oSceneObject);
    
    this._type = 'groupNode';
}
$.oGroupNode.prototype = Object.create($.oNode.prototype);


/**
 * The multiport in node of the group.
 * @name $.oGroupNode#multiportIn
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
 * Gets all subnodes withing the group.
 * @param   {bool}    [recurse]                    Whether to recurse the groups within the groups.
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
        if (recurse && node.isGroup(_nodes[i])) _subNodes = _subNodes.concat(_$.oNodeObject.subNodes(recurse));
    }
 
    return _subNodes;
}



 /**
 * Sorts out the node view inside the group
 * @param   {bool}   [recurse]                    Whether to recurse the groups within the groups.
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


