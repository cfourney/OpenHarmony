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
//           oNode class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * oNode Class
 * @class

 * @property   name           {string}                       The name of the node.
 * @property   path           {string}                       The parent path of the node, the group in which it is contained.
 * @property   fullpath       {string}                       The path of the node in the network.
 * @property   type           {string}                       The type of the node.

 * @property   enabled        {bool}                         The enabled state of the node.
 * @property   locked         {bool}                         The locked state of the node.
 * @property   exists         {bool}                         Whether the node exists.
 * @property   selected       {bool}                         Whether the node is selected. 
 * @property   isGroup        {bool}                         Whether the node is a group.
 
 * @property   children       {[oNode]}                      The children the group contains.
 * @property   parent         {oNode}                        The parent group of this node.

 * @property   inNodes        {[oNode]}                      The modules connected to the inports.
 * @property   ins            {[oNode]}                      The modules connected to the inports.
 * @property   outNodes       {[[oNode]]}                    The modules connected to the outports.
 * @property   outs           {[[oNode]]}                    The modules connected to the outports.
 
 * @property   position       {oPoint}                       The position of the node in the node view.
 * @property   x              {float}                        The horizontal position of the node in the node view.
 * @property   y              {float}                        The vertical position of the node in the node view.
 * @property   z              {float}                        The depth position of the node in the node view.
 * @property   width          {float}                        The width of the node in the node view.
 * @property   height         {float}                        The height of the node in the node view.
 * @property   bounds         {oBox}                         The bounds of the node in the node view.
 
 * @property   attributes         {{key:oAttribute, ... }}   All attributes as object
 
 * @function   {oAttribute}       attribute( {string} atribute_str )                                           Get the specific attribute
 * @function   {bool}             linkInNode( {oNode} oNodeObject, {int} inPort, {int} outPort)                Link's this node's in-port to the given module, at the inport and outport indices.
 * @function   {bool}             linkOutNode( {oNode} oNodeObject, {int} outPort, {int} inPort)               Link's this node's out-port to the given module, at the inport and outport indices.
 * @function   {[oNode]}          subNodes( {bool} recurse )                                                   Obtains the nodes contained in the group, allows recursive search.
 * @function   {oNode}            clone()                                                                      Clone the node via copy and paste. WIP, should return the new cloned node.
 * @function   {void}             centerAbove( {[oNode]} oNodeArray, {float} xOffset, {float} yOffset) )       Center this node above the nodes in the array provided.
 * @function   {void}             duplicate( string search_str )                                               WIP
*/
 
//TODO: Smart pathing, network movement, better duplication handling 
//TODO: Metadata, settings, aspect, camera peg, view.
//TODO: group's multi-in-ports, multi-out-port modules

// oNode constructor
//In the event it doesnt exist, maybe we can create it with a .create function.

/**
 * oNode [CONSTRUCTOR]
 *
 * Summary: The constructor for the oNode object, new oScene( $, node_path ) to create a oNode.
 */
function oNode( dom, path ){
  this._type = "node";
  this.$     = dom;

  this.root = path == "Top" ? true:false;
  this._fullPath = path;  //The internal naming of the full path, only to be accessed through internal functions.
  
  this._cache_attributes      = {};
  
  this.$.debug( "INSTANTIATING: " + path, this.$.DEBUG_LEVEL.LOG );
  
  try{
    var attributesList = node.getAttrList(this._fullPath, 1);
    
    for (var i in attributesList){
        var attribute = new oAttribute( this, attributesList[i] );
        var keyword = attribute.keyword.toLowerCase();
        this._cache_attributes[keyword] = attribute;
    }
  }catch( err ){
    this.$.debug( err.message + "\n" + "File: " + err.fileName + "\n" + "Line Number: " + err.lineNumber , this.$.DEBUG_LEVEL.ERROR );
  }
}


/**
 * .fullPath
 * @return: {string}   The derived path to the node.
 */
Object.defineProperty(oNode.prototype, 'fullPath', {
    get : function( ){
      return this._fullPath;
    },
 
    set : function( str_fullpath ){
      //A move and rename might be in order. . .  Manage this here.
      
      this.$.debug( "ERROR - changing the path is not supported yet: " + this._fullPath, this.$.DEBUG_LEVEL.WARNING );
      throw "ERROR - changing the path is not supported yet."
    }
});

/**
 * .type
 * @return: {string}   The type of the node.
 */
Object.defineProperty(oNode.prototype, 'type', {
    get : function( ){
      if( this.root ){
        return 'root';
      }
    
      return node.type( this.fullPath );
    },
 
    set : function( bool_exist ){
    }
});

/**
 * .isGroup
 * @return: {bool}   Is the node a group?
 */
Object.defineProperty(oNode.prototype, 'isGroup', {
    get : function( ){
      if( this.root ){
        //in a sense, its a group.
        return true;
      }
    
      return node.isGroup( this.fullPath );
    },
 
    set : function( bool_exist ){
    }
});

/**
 * .children
 * @return: [{oNode}]   The oNode objects contained in this group.
 */
Object.defineProperty(oNode.prototype, 'children', {
    get : function( ){
      if( !this.isGroup ){ return []; }
      
      var _children = [];
      var _subnodes = node.subNodes( this.fullPath );
      for( var n=0; n<_subnodes.length; n++ ){
        _children.push( new oNode( this.$, _subnodes[n] ) );
      }
      
      return _children;
    },
 
    set : function( arr_children ){
      //Consider a way to have this group adopt the children, move content here?
      //this may be a bit tough to extend.
    }
});


/**
 * .exists
 * @return: {bool}   Does the node exist?
 */
Object.defineProperty(oNode.prototype, 'exists', {
    get : function( ){
      if( this.root ){
        return true;
        
      }else if( node.type(this.fullPath) ){
        return true;
        
      }else{
        return false;
        
      }
    },
 
    set : function( bool_exist ){
    }
 
});

/**
 * .selected
 * @return: {bool}   Is the node selected?
 */
Object.defineProperty(oNode.prototype, 'selected', {
    get : function( ){
      for( var n=0;n<selection.numberOfNodesSelected;n++ ){
          if( selection.selectedNode(n) == this.fullPath ){
            return true;
          }
      }
      
      return false;
    },
 
    //Add it to the selection.
    set : function( bool_exist ){
      if( bool_exist ){
        selection.addNodeToSelection( this.fullPath );
      }else{
        selection.removeNodeFromSelection( this.fullPath );
      }
    }
 
});

/**
 * .name
 * @return: {string}   The node's name.
 */
Object.defineProperty(oNode.prototype, 'name', {
    get : function(){
      if( this.root ){ return "Top"; }
    
      return node.getName(this.fullPath)
    },
 
    set : function(newName){
        //Check to see if it exists first.
        
        //Consider auto-incrementing? Maybe with options.
        if( node.getName( _parent+'/'+newName ) ){
          throw "Node already exists by that name.";
        }
        
        var _parent = node.parentNode( this.fullPath )
        var _node = node.rename(this.fullPath, newName)
        this.fullPath = _parent+'/'+newName;
    }
 
});

/**
* .path
* @return: {string}   The path to the node, the parent path specifically.
*/
Object.defineProperty(oNode.prototype, 'path', {
    get : function(){
      if( this.root ){ return false; }
      
      return node.parentNode(this.fullPath)
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
        var _name = this.name
        node.moveToGroup(this.fullPath, newPath)
        this._fullPath = newPath + '/' + _name;
    }
 
});
 
/**
* .path
* @return: {oNode}   The oNode object for the parent in which this node exists.
*/
Object.defineProperty(oNode.prototype, 'parent', {
    get : function(){
      if( this.root ){ return false; }
    
      return new oNode( this.$, node.parentNode( this.fullPath ) )
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
    }
 
});
 
 
/**
* .enabled
* @return: {bool}   Is the node enabled?
*/
Object.defineProperty(oNode.prototype, 'enabled', {
    get : function(){
      if( this.root ){ return true; }
    
      return node.getEnable(this.fullPath)
    },
 
    set : function(enabled){
         node.setEnable(this.fullPath, enabled)
    }
});
 
 
/**
* .locked
* @return: {bool}   Is the node locked?
*/
Object.defineProperty(oNode.prototype, 'locked', {
    get : function(){
      if( this.root ){ return false; }
      
      return node.getLocked(this.fullPath)
    },
 
    set : function(locked){
         node.setLocked(this.fullPath, locked)
    }
});
 

/**
* .position
* @return: {oPoint}   The position of the node.
*/
Object.defineProperty(oNode.prototype, 'position', {
    get : function(){
      if( this.root ){ return new oPoint( 0.0, 0.0, 0.0 ); }
      
      return new oPoint(node.coordX(this.fullPath), node.coordY(this.fullPath), node.coordZ(this.fullPath))
    },
 
    set : function(newPosition){
        node.coordX(this.fullPath) = newPosition.x;
        node.coordY(this.fullPath) = newPosition.y;
        node.coordZ(this.fullPath) = newPosition.z;
    }
})
 
 
/**
* .x
* @return: {float}   The horizontal position of the node in the node view.
*/
Object.defineProperty(oNode.prototype, 'x', {
    get : function(){
      if( this.root ){ return 0.0; }
      
      return node.coordX(this.fullPath)
    },
 
    set : function(newPosition){
      if( this.root ){ return; }
      node.coordX(this.fullPath) = newPosition.x
    }
});
 
 
/**
* .y
* @return: {float}   The vertical position of the node in the node view.
*/
Object.defineProperty(oNode.prototype, 'y', {
    get : function(){
      if( this.root ){ return 0.0; }
      
      return node.coordY(this.fullPath)
    },
 
    set : function(newPosition){
      if( this.root ){ return; }
      node.coordY(this.fullPath) = newPosition.y
    }
});
 
 
/**
* .z
* @return: {float}   The depth position of the node in the node view.
*/
Object.defineProperty(oNode.prototype, 'z', {
    get : function(){
      if( this.root ){ return 0.0; }
      
      return node.coordZ(this.fullPath)
    },
 
    set : function(newPosition){
      if( this.root ){ return; }
      node.coordZ(this.fullPath) = newPosition.z
    }
});
 
 
/**
* .width
* @return: {float}   The width of the node in the node view.
*/ 
Object.defineProperty(oNode.prototype, 'width', {
    get : function(){
      if( this.root ){ return 0.0; }

      return node.width(this.fullPath)
    }
});
 
 
/**
* .height
* @return: {float}   The heigh of the node in the node view.
*/ 
Object.defineProperty(oNode.prototype, 'height', {
    get : function(){
      if( this.root ){ return 0.0; }

      return node.height(this.fullPath)
    }
});
 
 
/**
* .inNodes
* @return: [{oNode}]   The list of nodes connected to the inport of this node, in order of inport.
*/ 
Object.defineProperty(oNode.prototype, 'inNodes', {
    get : function(){
      if( this.root ){ return []; }

      var _inNodes = [];
      for (var i = 0; i < node.numberOfInputPorts(this.fullPath); i++){
          var _node = node.flatSrcNode(this.fullPath, i)
          _inNodes.push( new oNode( this.$, _node ) );
      }
      return _inNodes;
    }
});
 
 
/**
* .outNodes
* @return: [[{oNode}]]   The list of nodes connected to the outport of this node, in order of outport and links.
*/
Object.defineProperty(oNode.prototype, 'outNodes', {
    get : function(){
      if( this.root ){ return []; }
      
      var _outNodes = [];
      for (var i = 0; i < node.numberOfOutputPorts(this.fullPath); i++){
          var _outLinks = [];
          for (var j = 0; j < node.numberOfOutputLinks(this.fullPath, i); j++){
              // TODO: ignore/traverse groups
              var _node = node.dstNode(this.fullPath, i, j);
              _outLinks.push( new oNode( this.$, _node ) );
          }
          _outNodes.push(_outLinks);
      }
      return _outNodes;
    }
});

/**
* .ins
* @return: [{oNode}]   The list of nodes connected to the inport of this node, in order of inport.
*/ 
Object.defineProperty(oNode.prototype, 'ins', {
    get : function(){
      return this.outNodes;
    }
});

/**
* .outs
* @return: [[{oNode}]]   The list of nodes connected to the outport of this node, in order of outport and links.
*/
Object.defineProperty(oNode.prototype, 'outs', {
    get : function(){
      return this.outNodes;
    }
});


/**
* .attributes
* @return: [{oAttribute}]   The list of attributes that this node contains.
*/
Object.defineProperty(oNode.prototype, 'attributes', {
    get : function(){
      //Always keeps attributes up-to-date.
      
      var attributesList = node.getAttrList(this._fullPath, 1);
      for (var i in attributesList){
          var keyword = attributesList[i].keyword();
          
          if( !this._cache_attributes[keyword] ){
            var attribute = new oAttribute( this, attributesList[i] );
            this._cache_attributes[keyword] = attribute;
          }
          
      }
  
      return this._cache_attributes;
    }
}); 
 
/**
* .bounds
* @return: {oBox}   The bounds of the node.
*/
Object.defineProperty(oNode.prototype, 'bounds', {
    get : function(){
      return new oBox(this.x, this.y, this.x+this.width, this.y+this.heigth);
    }
}); 
 
 
/**
 * linkInNode
 *
 * Summary: Link's this node's in-port to the given module, at the inport and outport indices.
 * @param   {oNode}   oNodeObject            The node to link this one's inport to.
 * @param   {int}     inPort                 This node's inport to connect.
 * @param   {int}     outPort                The target node's outport to connect. 
 *  
 * @return: {bool}    The result of the link, if successful.
 */
oNode.prototype.linkInNode = function( oNodeObject, inPort, outPort ){
    var _node = oNodeObject.fullPath;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(_node);
 
    //Forcing ( . . . true, true ) is likely not a good idea in most context, we'll need to provide solution to add links to composites purposefully.
    return node.link(_node, outPort, this.fullPath, inPort, true, true);    
};
 
 
 
/**
 * linkOutNode
 *
 * Summary: Link's this node's out-port to the given module, at the inport and outport indices.
 * @param   {oNode}   oNodeObject            The node to link this one's outport to.
 * @param   {int}     inPort                 The target node's inport to connect.
 * @param   {int}     outPort                This node's outport to connect. 
 *  
 * @return: {bool}    The result of the link, if successful.
 */
oNode.prototype.linkOutNode = function(oNodeObject, outPort, inPort){
    var _node = oNodeObject.fullPath;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(this.fullPath);
 
    //Forcing ( . . . true, true ) is likely not a good idea in most context, we'll need to provide solution to add links to composites purposefully.
    return node.link(this.fullPath, outPort, _node, inPort, true, true);
};
 

 /**
 * subNodes
 *
 * Summary: obtains the nodes contained in the group, allows recursive search.
 * @param   {bool}   recurse           Whether to recurse internally for nodes within children groups.
 *  
 * @return: [{oNode}]    The subbnodes contained in the group.
 */
oNode.prototype.subNodes = function(recurse){
    if (typeof recurse === 'undefined') recurse = false;
    var _nodes = node.subNodes(this.fullPath);
    var _subNodes = [];
    for (var _node in _nodes){
        var _oNodeObject = new oNode( this.$, _nodes[_node] );
        _subNodes.push(_oNodeObject);
        if (recurse && node.isGroup(_nodes[_node])) _subNodes = _subNodes.concat(_oNodeObject.subNodes(recurse));
    }
 
    return _subNodes;
};
 
 
 /**
 * centerAbove
 *
 * Summary: Place a node above one or more nodes with an offset.
 * @param   [{oNode}]   oNodeArray           The array of nodes to center this above.
 * @param   {float}     xOffset              The horizontal offset to apply after centering.
 * @param   {float}     yOffset              The vertical offset to apply after centering.
 *  
 * @return: {void}
 */
oNode.prototype.centerAbove = function(oNodeArray, xOffset, yOffset){
    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = 0;
 
    // Works with nodes and nodes array
    if (typeof oNodeArray === 'oNode') oNodeArray = [oNodeArray];
 
    var _box = new oBox (Infinity, Infinity, -Infinity, -Infinity);
 
    for (var i in oNodeArray){
         var _node = oNodeArray[i];
         var _nodeBox = _node.bounds;
         _box.include(_nodeBox);
    }
 
    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.top - this.height + yOffset;
};
 

 /**
 * clone
 *
 * Summary: Place a node above one or more nodes with an offset.
 * @param   {string}    newName              The new name for the cloned module.
 * @param   {oPoint}    newPosition          The new position for the cloned module.
 * @param   {string}    newGroup             The group in which to place the cloned module.
 *  
 * @return: {void}
 */
oNode.prototype.clone = function( newName, newPosition, newGroup ){
    // Defaults for optional parameters
    if (typeof newGroup === 'undefined') var newGroup = this.path

    // TODO implement cloning through column linking as opposed to copy paste logic
 
    var _node = this.fullPath;
    var _copyOptions = copyPaste.getCurrentCreateOptions();
    var _copy = copyPaste.copy([_node], 1, frame.numberOf(), _copyOptions);
    var _pasteOptions = copyPaste.getCurrentPasteOptions();
    copyPaste.pasteNewNodes(_copy, newGroup, _pasteOptions)
};
 
 
 /**
 * duplicate
 *
 * Summary: WIP.
 * @param   {string}    newName              The new name for the cloned module.
 * @param   {oPoint}    newPosition          The new position for the cloned module.
 *  
 * @return: {void}
 */
oNode.prototype.duplicate= function(oNodeObject, newName, newPosition){
    // TODO
};
 
 
// Would rather keep the object in oNodes, as just a direct object for dot lookup oNode.attributes. 
// // oAttribute $attributes(keyword){
// oNode.prototype.$attributes = function(keyword){
    // var _attributes = this.attributes;
    // var _keywords = _attributes.map(function(x){return x.keyword});
 
    // var _index = _keywords.indexOf(keyword);
 
    // return (_index == -1)?null:_attributes[index];
// };


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oPegNode class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oPegNode(path)
//
// Properties
//


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        oDrawingNode class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oDrawingNode(path)
//
// Properties
//