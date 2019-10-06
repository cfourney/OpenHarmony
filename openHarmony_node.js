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
 * @property   nodes          {[oNode]}                        All nodes in the scene.
 * @property   columns        {[oColumn]}                      All columns in the scene.
 * @property   palettes       {[oPalette]}                     All palettes in the scene.
 * @property   elements       {[oElement]}                     All elements in the scene.
 * @property   drawings       {[oDrawing]}                     All drawings in the scene.
 * @property   groups         {[oGroup]}                       All groups in the scene.
 * 
 * @function   {[oNode]}       node( string search_str )       node search
 * @function   {[oColumn]}     column( string search_str )     column search
 * @function   {[oPalette]}    palette( string search_str )    palette search 
 * @function   {[oElement]}    element( string search_str )    element search 
 * @function   {[oDrawing]}    drawing( string search_str )    drawing search 
 * @function   {[oGroup]}      group( string search_str )      group search 
 * 
 * @function   {oNode}         addNode( string type, string name, oPoint nodePosition, string group )      
 * @function   {oColumn}       addColumn( string type, string name, element )     
 * @function   {oPalette}      addPalette( string name )
 * @function   {oElement}      addElement( name, imageFormat, fieldGuide, scanType )
 * @function   {oDrawing}      addDrawingNode( name, group, nodePosition, element, drawingColumn )
 * @function   {oDrawing}      addGroup( name, includeNodes, group, nodePosition, addComposite, addPeg )
 */
 
 
 
 
 
 
// Constructor
//
// oNode(string path)
//
// Properties
//
// string fullPath
// string name
// string path
// bool enabled
// bool locked
// array attributes
// point nodePosition
// int x
// int y
// int z
// int width
// int height
// array inNodes
// array outNodes
//
// Methods
//
// void linkInNode(oNode oNodeObject, int inPort, int outPort)
// void linkOutNode(oNode oNodeObject, int outPort, int inPort)
// array subNodes(bool recurse)
// oBox getBounds()
// void centerAbove(array oNodeArray, int offset)
 
 
// oNode constructor
 
 
 
 
 
//TODO: Metadata, settings, aspect, camera peg, view.
 
 
//In the event it doesnt exist, maybe we can create it with a .create function.
function oNode( dom, path ){
  this._type = "node";
  this.$     = dom;

  this.fullPath = path;  
  this.root = path == "Top" ? true:false;
  
  // generate properties from node attributes to allow for dot notation access
  this.attributes      = {};
  
  this.$.debug( "INSTANTIATING: " + path, this.$.DEBUG_LEVEL.LOG );
  
  try{
    var _attributesList = node.getAttrList(this.fullPath, 1);
    var _attributes = [];

    for (var i in _attributesList){
        var _attribute = new oAttribute( this, _attributesList[i] );
        var _keyword = _attribute.keyword.toLowerCase();

        this.attributes[_keyword] = _attribute;

        //The sub properties should be accessed directly via dot.notation from the parent.
        //ie: position.x, ect.
        
        // _attributes.push(_attribute);
        // if (_attribute.subAttributes.length > 0){
            // _attributes = _attributes.concat(_attribute.subAttributes)
        // }
    }
  }catch( err ){
    this.$.debug( err.message + "\n" + "File: " + err.fileName + "\n" + "Line Number: " + err.lineNumber , this.$.DEBUG_LEVEL.ERROR );
  }
}

// oNode Object Properties
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
 
 
// String path

Object.defineProperty(oNode.prototype, 'path', {
    get : function(){
      if( this.root ){ return false; }
      
      return node.parentNode(this.fullPath)
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
        var _name = this.name
        node.moveToGroup(this.fullPath, newPath)
        this.fullPath = newPath + '/' + _name;
    }
 
});
 
Object.defineProperty(oNode.prototype, 'parent', {
    get : function(){
      if( this.root ){ return false; }
    
      return new oNode( this.$, node.parentNode( this.fullPath ) )
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
    }
 
});
 
 
// bool enabled
Object.defineProperty(oNode.prototype, 'enabled', {
    get : function(){
      if( this.root ){ return true; }
    
      return node.getEnable(this.fullPath)
    },
 
    set : function(enabled){
         node.setEnable(this.fullPath, enabled)
    }
});
 
 
// bool locked
 
Object.defineProperty(oNode.prototype, 'locked', {
    get : function(){
      if( this.root ){ return false; }
      
      return node.getLocked(this.fullPath)
    },
 
    set : function(locked){
         node.setLocked(this.fullPath, locked)
    }
});
 

// point nodePosition
Object.defineProperty(oNode.prototype, 'nodePosition', {
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
 
 
// int x
 
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
 
 
// int y
 
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
 
 
// int z
 
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
 
 
// int width
 
Object.defineProperty(oNode.prototype, 'width', {
    get : function(){
      if( this.root ){ return 0.0; }

      return node.width(this.fullPath)
    }
});
 
 
// int height
 
Object.defineProperty(oNode.prototype, 'height', {
    get : function(){
      if( this.root ){ return 0.0; }

      return node.height(this.fullPath)
    }
});
 
 
// Array inNodes
 
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
 
 
// Array outNodes
 
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


Object.defineProperty(oNode.prototype, 'ins', {
    get : function(){
      return this.outNodes;
    }
});

 
Object.defineProperty(oNode.prototype, 'outs', {
    get : function(){
      return this.outNodes;
    }
});


 
// oNode Class methods
// bool linkInNode(oNode oNodeObject, int inPort, int outPort)
 
oNode.prototype.linkInNode = function(oNodeObject, inPort, outPort){
    var _node = oNodeObject.fullPath;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(_node);
 
    return node.link(_node, outPort, this.fullPath, inPort, true, true);
 
};
 
 
 
// bool linkOutNode(oNode oNodeObject, int outPort, int inPort)
 
oNode.prototype.linkOutNode = function(oNodeObject, outPort, inPort){
    var _node = oNodeObject.fullPath;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(this.fullPath);
 
    return node.link(this.fullPath, outPort, _node, inPort, true, true);
 
};
 
 
// Array subNodes(boolean recurse)
// obtains the nodes contained in the group, allows recursive search
 
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
 
 
// oBox getBounds()
// Returns an oBox object with the dimensions of the node
 
oNode.prototype.getBounds = function(){
    return new oBox(this.x, this.y, this.x+this.width, this.y+this.heigth);
};
 
 
// void centerAbove(array oNodeArray, int offset)
// Place a node above one or more nodes with an offset
 
oNode.prototype.centerAbove = function(oNodeArray, xOffset, yOffset){
    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = 0;
 
    // Works with nodes and nodes array
    if (typeof oNodeArray === 'oNode') oNodeArray = [oNodeArray];
 
    var _box = new oBox (Infinity, Infinity, -Infinity, -Infinity);
 
    for (var i in oNodeArray){
         var _node = oNodeArray[i];
         var _nodeBox = _node.getBounds();
         _box.include(_nodeBox);
    }
 
    this.x = _box.center.x - this.width/2 + xOffset;
    this.y = _box.top - this.height + yOffset;
};
 
 
// clone(oNodeObject(, newName(, newPosition, newGroup))){
 
oNode.prototype.clone = function(oNodeObject, newName, newPosition, newGroup){
    // Defaults for optional parameters
    if (typeof newGroup === 'undefined') var newGroup = oNodeObject.path


    // TODO implement cloning through column linking as opposed to copy paste logic
 
    var _node = oNodeObject.fullPath;
    var _copyOptions = copyPaste.getCurrentCreateOptions();
    var _copy = copyPaste.copy([_node], 1, frame.numberOf(), _copyOptions);
    var _pasteOptions = copyPaste.getCurrentPasteOptions();
    copyPaste.pasteNewNodes(_copy, newGroup, _pasteOptions)
 
};
 
 
// duplicate(oNodeObject(, newName(, newPosition)))
 
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