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
 
//In the event it doesnt exist, maybe we can create it with a .create function.
function oNode( dom, path ){
    this._type = "node";
    this.$     = dom;
    
    this.fullPath = path;
    this.attributes = [];
    // generate properties from node attributes to allow for dot notation access
 
    // TODO: attributes as getter setters and add an attribute lookup function
 
    // also generate an array to give access to a list of all attributes
 
    var _attributesList = node.getAttrList(this.fullPath, 1);
    var _attributes = [];
 
    for (var i in _attributesList){
        var _attribute = new oAttribute( this, _attributesList[i] );
        var _keyword = _attribute.keyword.toLowerCase();
 
         this[_keyword] = _attribute;
 
        // Dynamically create properties corresponding to node attributes ?
        /*Object.defineProperty(oNode.prototype, _keyword, {
            get : function(){
                var _attribute = this.$attribute(_keyword)
                return _attribute.keyword
            },
 
            set : function(value){
                var _attribute = this.$attribute(_keyword)
                _attribute[1].value =
 
            }
        })*/
 
        _attributes.push(_attribute);
 
        if (_attribute.subAttributes.length > 0){
            _attributes = _attributes.concat(_attribute.subAttributes)
        }
    }
 
    this.attributes = _attributes;
 
}

Object.defineProperty(oNode.prototype, 'type', {
    get : function( ){
      return node.type(this.fullPath);
    },
 
    set : function( bool_exist ){
    }
 
});
 
Object.defineProperty(oNode.prototype, 'exists', {
    get : function( ){
      if( node.type(this.fullPath) ){
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

// oNode Object Properties
 
// String name
 
Object.defineProperty(oNode.prototype, 'name', {
    get : function(){
         return node.getName(this.fullPath)
    },
 
    set : function(newName){
        var _parent = node.parentNode(this.fullPath)
        var _node = node.rename(this.fullPath, newName)
        this.fullPath = _parent+'/'+newName;
    }
 
})
 
 
// String path
 
Object.defineProperty(oNode.prototype, 'path', {
    get : function(){
         return node.parentNode(this.fullPath)
    },
 
    set : function(newPath){
        // TODO: make moveNode() method?
        var _name = this.name
        node.moveToGroup(this.fullPath, newPath)
        this.fullPath = newPath + '/' + _name;
    }
 
})
 
 
// bool enabled
 
Object.defineProperty(oNode.prototype, 'enabled', {
    get : function(){
         return node.getEnable(this.fullPath)
    },
 
    set : function(enabled){
         node.setEnable(this.fullPath, enabled)
    }
})
 
 
// bool locked
 
Object.defineProperty(oNode.prototype, 'locked', {
    get : function(){
         return node.getLocked(this.fullPath)
    },
 
    set : function(locked){
         node.setLocked(this.fullPath, locked)
    }
})
 
 
// point nodePosition
 
Object.defineProperty(oNode.prototype, 'nodePosition', {
    get : function(){
         return new oPoint(node.coordX(this.fullPath), node.coordY(this.fullPath), node.coordZ(this.fullPath))
    },
 
    set : function(newPosition){
        node.coordX(this.fullPath) = newPosition.x
        node.coordY(this.fullPath) = newPosition.y
        node.coordZ(this.fullPath) = newPosition.z
    }
})
 
 
// int x
 
Object.defineProperty(oNode.prototype, 'x', {
    get : function(){
         return node.coordX(this.fullPath)
    },
 
    set : function(newPosition){
        node.coordX(this.fullPath) = newPosition.x
    }
})
 
 
// int y
 
Object.defineProperty(oNode.prototype, 'y', {
    get : function(){
         return node.coordY(this.fullPath)
    },
 
    set : function(newPosition){
        node.coordY(this.fullPath) = newPosition.y
    }
})
 
 
// int z
 
Object.defineProperty(oNode.prototype, 'z', {
    get : function(){
         return node.coordZ(this.fullPath)
    },
 
    set : function(newPosition){
        node.coordZ(this.fullPath) = newPosition.z
    }
})
 
 
// int width
 
Object.defineProperty(oNode.prototype, 'width', {
    get : function(){
         return node.width(this.fullPath)
    }
})
 
 
// int height
 
Object.defineProperty(oNode.prototype, 'height', {
    get : function(){
         return node.height(this.fullPath)
    }
})
 
 
// Array inNodes
 
Object.defineProperty(oNode.prototype, 'inNodes', {
    get : function(){
        var _inNodes = [];
        for (var i = 0; i < node.numberOfInputPorts(this.fullPath); i++){
            var _node = node.flatSrcNode(this.fullPath, i)
            _inNodes.push( new oNode( this.$, _node ) );
        }
        return _inNodes;
    }
})
 
 
// Array outNodes
 
Object.defineProperty(oNode.prototype, 'outNodes', {
    get : function(){
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
})
 
 
// oNode Class methods
 
// bool linkInNode(oNode oNodeObject, int inPort, int outPort)
 
oNode.prototype.linkInNode = function(oNodeObject, inPort, outPort){
    var _node = oNodeObject.fullPath;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(_node);
 
    return node.link(_node, outPort, this.fullPath, inPort, true, true);
 
}
 
// bool linkOutNode(oNode oNodeObject, int outPort, int inPort)
 
oNode.prototype.linkOutNode = function(oNodeObject, outPort, inPort){
    var _node = oNodeObject.fullPath;
 
    // Default values for optional parameters
    if (typeof inPort === 'undefined') inPort = 0;
    if (typeof outPort === 'undefined') outPort = 0//node.numberOfOutputPorts(this.fullPath);
 
    return node.link(this.fullPath, outPort, _node, inPort, true, true);
 
}
 
 
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
}
 
 
// oBox getBounds()
// Returns an oBox object with the dimensions of the node
 
oNode.prototype.getBounds = function(){
    return new oBox(this.x, this.y, this.x+this.width, this.y+this.heigth);
}
 
 
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
}
 
 
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
 
}
 
 
// duplicate(oNodeObject(, newName(, newPosition)))
 
oNode.prototype.duplicate= function(oNodeObject, newName, newPosition){
    // TODO
}
 
 
// oAttribute $attributes(keyword){
 
oNode.prototype.$attributes = function(keyword){
    var _attributes = this.attributes;
    var _keywords = _attributes.map(function(x){return x.keyword});
 
    var _index = _keywords.indexOf(keyword);
 
    return (_index == -1)?null:_attributes[index];
}



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