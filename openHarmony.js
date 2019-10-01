//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//
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
//
//   To use, add the line 'include("openHarmony.js")' at the start of your script
//   and include this file in the same folder.
//
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
 
 
/*
// Class template
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oTemplate class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oTemplate (prop1, prop2)
//
// Properties
//
// double prop1
// double prop2
//
// Methods
//
// double getSum(double num)
 
 
// oTemplate constructor
 
function oTemplate (prop1, prop2){
    this.prop1 = prop1;
    this.prop2 = prop2;
    var _privateVar = 'hello'
}
 
// oTemplate Object Properties
 
Object.defineProperty(oTemplate.prototype, 'prop3', {
    get : function(){
         return this.prop2+this.prop1
    },
 
    set : function(value){
        this.prop1 = value-this.prop2
    }
})
 
// oTemplate Class methods
 
// double getSum(double num)
 
oTemplate.prototype.getSum = function (num){
    debug.log(this.prop3)
    return this.prop3+num
}
 
*/

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oSearch class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Properties

oSearch = function(){
}

oSearch.prototype.$ = function(search){
    // This will handle the searching logic within the class. This function can be implemented for a generic class and added to any subClass as a mixin.

    // Search synthax
    // Normal string will search the names
    // Prefix # will filter by type
    // Prefix . will search properties
    // Wildcard (*) should be implemented as incomplete search
    // Prefix > To return only the first result

}

 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oScene class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Properties
//
// array nodes
// array columns
// array palettes
//
// Methods
//
// oNode getNodeByName(string fullPath)
// array getSelectedNodes(bool recurse)
// oNode addNode(string type, string name, oPoint nodePosition, string group)
// oNode addColumn(string type, string name, element)
// oNode addElement(name, imageFormat, fieldGuide, scanType)
// oNode addDrawingNode(name, group, nodePosition, element, drawingColumn)
// oNode addGroup(name, includeNodes, group, nodePosition, addComposite, addPeg)
 
 
function oScene(){
    // oScene.nodes property is a class property shared by all instances, so it can be passed by reference and always contain all nodes in the scene
 
    //var _topNode = new oNode("Top");
    //this.__proto__.nodes = _topNode.subNodes(true);
}
 
function getSceneDOM(){
    return new oScene();
}
 
 
// oScene Objects Properties

// Array oScene.nodes
// Contains the list of nodes present in the scene
 
Object.defineProperty(oScene.prototype, 'nodes', {
    get : function(){
        var _topNode = new oNode("Top");
        return _topNode.subNodes(true);
    }
})

 
// Array oScene.columns
// Contains the list of columns present in the scene
 
Object.defineProperty(oScene.prototype, 'columns', {
    get : function(){
        var _columns = [];
        for (var i=0; i<columns.numberOf(); i++){
            _columns.push(new oColumn(column.getName(i)));
        }
        return _columns;
    }
})
 
 
// Array oScene.palettes
// Contains the list of scene palettes present in the scene
 
Object.defineProperty(oScene.prototype, 'palettes', {
    get : function(){
        var _paletteList = PaletteManager.getScenePaletteList();
        var _palettes = [];
        for (var i=0; i<_paletteList.numPalettes(); i++){
            _palettes.push( new oPalette(_paletteList.getPaletteByIndex(i)));
        }
        return _palettes;
    }
})
 
 
// oScene class methods
 
// getNodeByName(string fullPath)
 
oScene.prototype.getNodeByName = function(fullPath){
    return (node.type(fullPath) != "")?new oNode(fullPath):null
}
 
 
// getSelectedNodes(bool recurse)
 
oScene.prototype.getSelectedNodes = function(recurse){
    if (typeof recurse === 'undefined') var recurse = false;
 
    var _selection = selection.selectedNodes();
    var _selectedNodes = [];
    for (var i = 0; i<selection.length; i++){
        var _oNodeObject = new oNode(selection[i])
        _selectedNodes.push(_oNodeObject)
        if (recurse && node.isGroup(selection[i])){
            _selectedNodes = _selectedNodes.concat(_oNodeObject.subNodes(recurse))
        }
    }
    return _selectedNodes;
}
 
 
// oNode addNode(string type, string name, oPoint nodePosition, string group)
 
oScene.prototype.addNode = function(type, name, group, nodePosition){
    // Defaults for optional parameters
    if (typeof group === 'undefined') var group = "Top"
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
 
    var _nodePath = node.add(group, name, type, nodePosition.x, nodePosition.y, nodePosition.z)
 
    var _node = new oNode(_nodePath)
 
    //this.nodes.push(_node)
 
    return _node;
}
 
 
// TODO: add column, add element
// oColumn addColumn(string type, string name, element)
 
oScene.prototype.addColumn = function(type, name, element){
    // Defaults for optional parameters
    if (typeof name === 'undefined') var name = column.generateAnonymousName();
 
    var _columnName = column.add(name, type)
 
    var _column = new oColumn(_columnName)
 
    if (type == "DRAWING" && typeof element !== 'undefined'){
        column.setElementIdOfDrawing(_column.uniqueName, element.id);
    }
 
    //this.columns.push(_column)
 
    return _column;
}
 
 
// oElement addElement(name, imageFormat, fieldGuide, scanType)
 
oScene.prototype.addElement = function(name, imageFormat, fieldGuide, scanType){
    // Defaults for optional parameters
    if (typeof scanType === 'undefined') var scanType = "COLOR";
    if (typeof fieldGuide === 'undefined') var fieldGuide = 12;
    if (typeof imageFormat === 'undefined') var imageFormat = "TVG";
 
    var _fileFormat = (imageFormat == "TVG")?"SCAN":imageFormat;
    var _vectorFormat = (imageFormat == "TVG")?imageFormat:"None";
 
    // TODO: physically copy the files to the element folder to import a bitmap
 
    var _id = element.add(name, scanType, fieldGuide, _fileFormat, _vectorFormat);
 
    var _element = new oElement(_id)
 
    //this.elements.push(_element)
 
    return _element;
}
 
 
// oNode addDrawingNode(name, group, nodePosition, element, drawingColumn)
 
oScene.prototype.addDrawingNode = function(name, group, nodePosition, element, drawingColumn){
    // Defaults for optional parameters
    if (typeof group === 'undefined') var group = "Top"
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
 
    if (typeof element === 'undefined'){
        // deal with the creation of element
        var element = this.addElement(name)
    }
 
    if (typeof drawingColumn === 'undefined'){
        // deal with the creation of element
        var drawingColumn = this.addColumn("DRAWING", name, element)
    }
 
    var _node = this.addNode("READ", name, group, nodePosition)
 
    _node.drawing.element.column = drawingColumn;
 
    //node.linkAttr(nodePath, "DRAWING.ELEMENT", drawingColumn);
 
    return _node;
}
 
 
// oNode addGroup(name, includeNodes, group, nodePosition, addComposite, addPeg)
 
oScene.prototype.addGroup = function(name, includeNodes, group, nodePosition, addComposite, addPeg){
    // Defaults for optional parameters
       // TODO
}
 
 
//oScene short notation methods
 
oScene.prototype.$node = function(fullPath){
    return this.getNodeByName(fullPath)
}
 
 
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
 
function oNode(path){
    this.fullPath = path;
    this.type = node.type(this.fullPath)
    this.attributes = [];
    // generate properties from node attributes to allow for dot notation access
 
    // TODO: attributes as getter setters and add an attribute lookup function
 
    // also generate an array to give access to a list of all attributes
 
    var _attributesList = node.getAttrList(this.fullPath, 1);
    var _attributes = [];
 
    for (var i in _attributesList){
 
        var _attribute = new oAttribute(this, _attributesList[i]);
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
            _inNodes.push(new oNode(_node))
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
                _outLinks.push(new oNode(_node));
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
        var _oNodeObject = new oNode(_nodes[_node]);
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

 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oColumn class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oColumn(uniqueName)
//
// Properties
//
// String name
// String type
// Array frames
//
 
function oColumn(uniqueName){
    this.uniqueName = uniqueName;
}
 
 
// oColumn Object Properties
 
// String oColumn.name
 
Object.defineProperty(oColumn.prototype, 'name', {
    get : function(){
         return column.getDisplayName(this.uniqueName)
    },
 
    set : function(newName){
        var _success = column.rename(this.uniqueName, newName)
        if (_success) this.uniqueName = newName;
        return _success
    }
})
 
 
// String type
 
Object.defineProperty(oColumn.prototype, 'type', {
    get : function(){
        return column.type(this.uniqueName)
    }
})
 
 
// Array frames
 
Object.defineProperty(oColumn.prototype, 'frames', {
    get : function(){
        var _frames = new Array(frame.numberOf()+1);
        for (var i=1; i<_frames.length; i++){
            _frames[i] = new oFrame(i, this)
        }
        return _frames;
    }
})
 
 
// oColumn Class methods

oColumn.prototype.duplicate = function() {
    // TODO
}

 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oElement class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oElement (id)
//
// Properties
//
// string name
// string path
//
// Methods
//
// double getSum(double num)
 
 
// oElement constructor
 
function oElement (id){
    this.id = id;
}
 
// oElement Object Properties
 
Object.defineProperty(oElement.prototype, 'name', {
    get : function(){
         return element.getNameById(this.id)
    },
 
    set : function(newName){
         element.renameById(this.id, newName);
    }
})
 
 
Object.defineProperty(oElement.prototype, 'path', {
    get : function(){
         return fileMapper.toNativePath(element.completeFolder(this.id))
    },
 
    set : function(newPath){
        //
    }
})
 
// oElement Class methods
 
  
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        oAttribute class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor
//
// oAttribute(oNodeObject, attributeObject)
//
// Properties
//
// oNode oNodeObject
// Attribute attributeObject
// String keyword
// string type
// oColumn column
// array frames
//
// Methods
//
// oColumn getLinkedColumn()
// array getKeyFrames()
// bool set(value, double frame)
// various get(frame)
 
// oAttribute constructor
 
function oAttribute(oNodeObject, attributeObject){
    this.oNodeObject = oNodeObject;
    this.attributeObject = attributeObject;
    this.keyword = attributeObject.fullKeyword()
 
    var _subAttributes = [];
    if (attributeObject.hasSubAttributes()){
        var _subAttributesList = attributeObject.getSubAttributes();
        for (var i in _subAttributesList){
            var _keyword = _subAttributesList[i].keyword().toLowerCase();
            var _subAttribute = new oAttribute(this.oNodeObject, _subAttributesList[i])
            this[_keyword] = _subAttribute
            _subAttributes.push(_subAttribute)
        }
    }
 
    this.subAttributes = _subAttributes;
}

// oAttribute Object Properties

// string type

Object.defineProperty(oAttribute.prototype, 'type', {
    get : function(){
        return this.attributeObject.typeName();
    }
})
 

// oColumn column
 
Object.defineProperty(oAttribute.prototype, 'column', {
    get : function(){
        var _column = node.linkedColumn (this.oNodeObject.fullPath, this.keyword)
        var _subAttributesNum = this.attributeObject.getSubAttributes().length
        return new oColumn(_column, _subAttributesNum)
    },
 
    set : function(columnObject){
        // unlink if provided with null value or empty string
        if (columnObject == "" || columnObject == null){
            node.unLinkAttr(this.oNodeObject.fullPath, this.keyword)
        }else{
            node.linkAttr(this.oNodeObject.fullPath, this.keyword, columnObject.uniqueName)
        }
    }
})
 
 
// Array frames
 
Object.defineProperty(oAttribute.prototype, 'frames', {
    get : function(){
         var _column = this.column
		 if (_column != null){
			return _column.frames;
		 }else{
			return [];
		 }
    }
})
 
 
// oAttribute Class methods
 
// array getKeyFrames()
 
oAttribute.prototype.getKeyFrames = function(){
    var _frames = this.frames;
    _frames = _frames.filter(function(x){return x.isKeyFrame})
    return _frames
}


// bool set(value, double frame)

oAttribute.prototype.set = function (value, frame) {
    if (typeof frame === 'undefined') var frame = 1;

    if (frame != 1){
		// generate a new column to be able to animate
        if (this.column == null){
            var _doc = new oScene();
            var _column = _doc.addColumn()
            this.column = _column;
        }
        this.column.frames[frame].value = value;

    }else{
        // TODO deal with subattributes
        try{
		    if (this.column == null){
				this.attributeObject.setValue(value);
				return true;
			}else{
				this.column.frames[frame].value = value;
			}
        }
        catch(err){return false}
    }
}


// various get(frame)

oAttribute.prototype.get = function (frame) {
    if (typeof frame === 'undefined') var frame = 1;

    if (frame != 1 && this.column != null){
		// generate a new column to be able to animate
        return this.column.frames[frame].value;

    }else{
		var _attr = this.attributeObject;
		var _type = this.type;
		var _value;
		
		switch (_type){
			case 'bool':
				_value = _attr.boolValueAt(1)
				break;
				
			case 'int':
				_value = _attr.inValueAt(1)
				break;
				
			case 'double':
				_value = _attr.doubleValueAt(1)
				break;
				
			case 'text':
				_value = _attr.textValueAt(1)
				break;
				
			case 'color':
				_value = _attr.colorValueAt(1)
				break;

			case 'pos2d':
				_value = _attr.pos2dValueAt(1)
				break;
				
			case 'pos3d':
				_value = _attr.pos3dValueAt(1)
				break;
				
			default:
		}
		
        // TODO deal with subattributes
		return this.attributeObject.getValue();
    }
}


 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oFrame class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor
//
// oFrame(frameNumber, oColumnObject, subColumns)
//
// Properties
//
// int frameNumber
// oColumn column
// int subColumns
// various value
// bool isKeyFrame
// int duration
// int startFrame
 
// oFrame constructor
 
function oFrame(frameNumber, oColumnObject, subColumns){
    if (typeof subColumns === 'undefined') var subColumns = 0;
 
    this.frameNumber = frameNumber;
    this.column = oColumnObject;
    this.subColumns = subColumns;
}
 
 
// oFrame Object Properties
 
// various value
 
Object.defineProperty(oFrame.prototype, 'value', {
    get : function(){
        if (this.subColumns == 0){
            return column.getEntry(this.column.uniqueName, 1, this.frameNumber)
        }
        // TODO: deal with subColumns: return an object with all values from subattributes
    },
 
    set : function(newValue){
        // TODO: assign a value to a frame
 
    }
})
 
 
// bool isKeyFrame
 
Object.defineProperty(oFrame.prototype, 'isKeyFrame', {
    get : function(){
        var _column = this.column.uniqueName
        if (this.column.type == 'DRAWING' || this.column.type == 'TIMING'){
            return !column.getTimesheetEntry(_column, 1, this.frameNumber).heldFrame
        }else if (this.column.type == 'BEZIER'){
            return column.isKeyFrame(_column, 1, this.frameNumber)
        }
    },
 
    set : function(){
        // TODO: create key ?
    }
})
 
 
// int duration
 
Object.defineProperty(oFrame.prototype, 'duration', {
    get : function(){
        // TODO
    }
})
 
 
// int startFrame
 
Object.defineProperty(oFrame.prototype, 'startFrame', {
    get : function(){
        // TODO
    }
})
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oPalette class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor
//
// oPalette(paletteObject)
//
// Properties
//
// String name
// String path
//
// Methods
 
// oPalette constructor
 
function oPalette(paletteObject){
    this.paletteObject = paletteObject;
}
 
 
// oPalette Object Properties
 
// String name
 
Object.defineProperty(oPalette.prototype, 'name', {
    get : function(){
         return this.paletteObject.getName()
    },
 
    set : function(newName){
        // TODO: Rename palette file then unlink and relink the palette
 
    }
})
 
 
// String path
 
Object.defineProperty(oPalette.prototype, 'path', {
    get : function(){
         var _path = this.paletteObject.getPath()
         _path = fileMapper.toNativePath(_path)
         return _path+this.name+".plt"
    },
 
    set : function(newPath){
        // TODO: move palette file then unlink and relink the palette ? Or provide a move() method
 
    }
})
 
// oPalette Class methods
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oPoint class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// oPoint constructor
 
function oPoint (x, y, z){
    if (typeof z === 'undefined') var z = 0;
 
    this.x = x;
    this.y = y;
    this.z = z;
}
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//            oBox class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor
//
// oBox (left, top, right, bottom)
//
// Properties
//
// int top
// int left
// int right
// int bottom
// int width
// int height
// oPoint center
//
// Methods
//
// void include(oBox box)
//
 
 
// oBox constructor
 
function oBox (left, top, right, bottom){
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
}
 
 
// oBox Object Properties
 
// int width
 
Object.defineProperty(oBox.prototype, 'width', {
    get : function(){
         return this.right - this.left;
    }
})
 
 
// int height
 
Object.defineProperty(oBox.prototype, 'height', {
    get : function(){
         return this.bottom - this.top;
    }
})
 
 
// oPoint center
 
Object.defineProperty(oBox.prototype, 'center', {
    get : function(){
         return new oPoint(this.left+this.width/2, this.top+this.height/2)
    }
})
 
 
// oBox Class methods
 
// include(oBox box)
// Extend a box object to encompass another
 
oBox.prototype.include = function(box){
    if (box.left < this.left) this.left = box.left
    if (box.top < this.top) this.top = box.top
    if (box.right > this.right) this.right = box.right
    if (box.bottom > this.bottom) this.bottom = box.bottom
}


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oFolder class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor:
//
// oFolder(string path)
//
// Properties:
//
// string path
//
// Methods:
//
// array getFiles()
 
function oFolder(path){
    this.path = fileMapper.toNativePath (path)
}


Object.defineProperty(oFolder.prototype, 'name', {
	get: function(){
		var _name = this.path.slice(this.path.lastIndexOf("/")+1)
		return _name;
	}
})

 
oFolder.prototype.getFiles = function(filter){
    // returns the list of URIs in a directory that match a filter
    var dir = new QDir;
    dir.setPath(this.path);
    var nameFilters = new Array;
    nameFilters.push ( filter);
    dir.setNameFilters( nameFilters );
    dir.setFilter( QDir.Files );
 
    return files = dir.entryList().map(function(x){return new oFile(dir.path()+"/"+x)});
}

 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           oFile class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor:
//
// oFile(string path)
//
// Properties:
//
// string path
//
// Methods:
//
// string readFile()
// bool writeFile(string content(, bool append))
 
function oFile(path){
    this.path = path.split('\\').join('/')
}

// string name

Object.defineProperty(oFile.prototype, 'name', {
	get: function(){
		var _name = this.path.slice(this.path.lastIndexOf("/")+1, this.path.lastIndexOf("."))
		return _name;
	}
})

// string extension

Object.defineProperty(oFile.prototype, 'extension', {
	get: function(){
		var _extension = this.path.slice(this.path.lastIndexOf(".")+1)
		return _extension;
	}
})

 
oFile.prototype.readFile = function() {
    var file = new File(this.path);
 
    try {
        if (file.exists) {
            file.open(FileAccess.ReadOnly);
            var string = file.read();
            file.close();
            return string;
        }
    } catch (err) {
        return null
    }
}


oFile.prototype.writeFile = function(content, append){
    if (typeof append === 'undefined') var append = false
   
    var file = new File(this.path);
    try {
        if (append){
            file.open(FileAccess.Append);
        }else{
            file.open(FileAccess.WriteOnly);
        }
        file.write(content);
        file.close();
        return true
    } catch (err) {return false;}
}
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oDebug class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Properties
// string debugLevel
//
// Methods
// log(message (, debugLevel))
// logObj(object (, debugLevel))
 
 
// oDebug constructor
 
function oDebug(debugLevel) {
    this.debugLevel = debugLevel;
}
 
 
// oDebug Object Properties
 
// oDebug Class methods
 
// log(message (, debugLevel))
// outputs the given message to the MessageLog. Allows the user to specify a debug level required for output.
 
oDebug.prototype.log = function(message, debugLevel){
    if (typeof debugLevel === 'undefined') var debugLevel = 'general'
 
    if (debugLevel == this.debugLevel){
        MessageLog.trace(message)
    }
}
 
 
// logObj(object (, debugLevel))
 
oDebug.prototype.logObj = function(object, debugLevel){
    if (typeof debugLevel === 'undefined') var debugLevel = 'general'
 
    if (debugLevel == this.debugLevel){
        for (var i in object){
            try {
                this.log(i+' : '+object[i])
                if (typeof object[i] == "Object"){
                    this.log(' -> ')
                    this.logObj(object[i])
                    this.log(' ----- ')
                }
            }
            catch(error){}
        }
    }
}


