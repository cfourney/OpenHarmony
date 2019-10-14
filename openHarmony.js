//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//
//
//                            openHarmony Library v0.02
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
        var _topNode = this.$node("Top");
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
	if (node.type(fullPath) == "") return null
	if (node.type(fullPath) == "READ") return new oDrawingNode(fullPath, this)
    return new oNode(fullPath, this);
}
 
 
// NEW
 
// getSelectedNodes(bool recurse)
 
oScene.prototype.getSelectedNodes = function(recurse){
    if (typeof recurse === 'undefined') var recurse = false;
 
    var _selection = selection.selectedNodes();
 
    var _selectedNodes = [];
    for (var i = 0; i<_selection.length; i++){
 
        var _oNodeObject = this.$node(_selection[i])
		
        _selectedNodes.push(_oNodeObject)
        if (recurse && node.isGroup(_selection[i])){
            _selectedNodes = _selectedNodes.concat(_oNodeObject.subNodes(recurse))
        }
    }
	
	// sorting by timeline index
	var _timeline = this.getTimeline();
	
	_selectedNodes = _selectedNodes.sort(function(a, b){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})
    return _selectedNodes;
}
 
 
// oNode addNode(string type, string name, oPoint nodePosition, string group)
 
oScene.prototype.addNode = function(type, name, group, nodePosition){
    // Defaults for optional parameters
    if (typeof group === 'undefined') var group = "Top"
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
 
    var _nodePath = node.add(group, name, type, nodePosition.x, nodePosition.y, nodePosition.z)
    var _node = this.$node(_nodePath)
 
    return _node;
}
 
 
// NEW
 
// oColumn addColumn(string type, string name, element)
 
oScene.prototype.addColumn = function(type, name, element){
    // Defaults for optional parameters
    if (typeof name === 'undefined') var name = column.generateAnonymousName();
   
    column.add(name, type);
    var _columnName = column.getName(column.numberOf()-1)
 
    var _column = new oColumn(_columnName)
 
    if (type == "DRAWING" && typeof element !== 'undefined'){
        element.column = this;
        column.setElementIdOfDrawing(_column.uniqueName, element.id);
    }
 
    return _column;
}
 
// NEW
 
// oElement addElement(name, imageFormat, fieldGuide, scanType)
 
oScene.prototype.addElement = function(name, imageFormat, fieldGuide, scanType){
    // Defaults for optional parameters
    if (typeof scanType === 'undefined') var scanType = "COLOR";
    if (typeof fieldGuide === 'undefined') var fieldGuide = 12;
    if (typeof imageFormat === 'undefined') var imageFormat = "TVG";
 
    var _fileFormat = (imageFormat == "TVG")?"SCAN":imageFormat;
    var _vectorFormat = (imageFormat == "TVG")?imageFormat:"None";
 
    var _id = element.add(name, scanType, fieldGuide, _fileFormat, _vectorFormat);
    var _element = new oElement(_id)
 
    return _element;
}
 
 
// NEW
 
// oNode addDrawingNode(name, group, nodePosition, element, drawingColumn)
 
oScene.prototype.addDrawingNode = function(name, group, nodePosition, element, drawingColumn){
    // Defaults for optional parameters
    if (typeof group === 'undefined') var group = "Top"
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
   
    var _node = this.addNode("READ", name, group, nodePosition)
   
    // setup the node
    // setup animate mode/separate based on preferences?
   
   
    // add drawing column and element if not passed as parameters
   
    if (typeof element === 'undefined') var element = this.addElement(name)
    if (typeof drawingColumn === 'undefined') var drawingColumn = this.addColumn("DRAWING", name, element)
   
    _node.drawing.element.column = drawingColumn;
   
    return _node;
}
 
 
//NEW
 
// oNode addGroup(name, includeNodes, group, nodePosition, addComposite, addPeg)
 
oScene.prototype.addGroup = function(name, includeNodes, addComposite, addPeg, group, nodePosition){
    // Defaults for optional parameters
   
    var _group = this.addNode("GROUP", name, group, nodePosition)
    var _MPI = this.$node(node.getGroupInputModule(_group.fullPath, "Multiport-In", 0,-100,0), this)
    var _MPO = this.$node(node.getGroupOutputModule(_group.fullPath, "Multiport-Out", 0,100,0), this)
 
    if (addComposite){
        var _composite = this.addNode("COMPOSITE", name+"_Composite", _group.fullPath)
        _composite.linkOutNode(_MPO);
    }
    if (addPeg){
        var _peg = this.addNode("PEG", name+"-P", _group.fullPath)
        _peg.linkInNode(_MPI)
    }
   
    if (includeNodes.length > 0){
        var _timeline = this.getTimeline()
        //MessageLog.trace(timeline.layers.map(function(x){return x.name}))
        includeNodes.sort(function(a, b){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})
       
        for (var i in includeNodes){
            var _node = includeNodes[i];
            var _nodeName = _node.name;
            //MessageLog.trace(_nodeName)
            node.moveToGroup(_node.fullPath, _group.fullPath)
            // updating the fullPath of the oNode objects passed by reference
            _node.fullPath = _group.fullPath+'/'+_nodeName;
           
            if (addPeg){
                _node.unlinkInNode(_MPI)
                _node.linkInNode(_peg)
            }
        }
    }
   
    return _group;
}
 
// NEW
// oTimeline getTimeline(display)
 
oScene.prototype.getTimeline = function(display){
    if (typeof display === 'undefined') var display = '';
    return new oTimeline(display)
}
 
 
// NEW
// bool importPSD()
 
oScene.prototype.importPSD = function(filename, group, nodePosition, separateLayers){
    if (typeof separateLayers === 'undefined') var separateLayers = false;
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0)
    if (typeof group === 'undefined') var group = "Top"
   
    var psdFile = new oFile(filename)
    var _elementName = psdFile.name
          
    var _layers = CELIO.getLayerInformation(filename);
  
    var _element = this.addElement(_elementName, "PSD")
    var _column = this.addColumn(_elementName, "DRAWING", _element)

    CELIO.pasteImageFile({ src : filename, dst : { elementId : _element.id, exposure : "1"}})

    if (separateLayers){
        for (var i in _layers){
            // generate nodes and set them to show the element for each layer
        }
    }
   
}
 
// NEW
// oNode mergeNodes
 
oScene.prototype.mergeNodes = function (nodes, resultName, deleteMerged){
    // TODO: is there a way to do this without Action.perform?
    // pass a oNode object as argument for destination node instead of name/group?
   
    if (typeof resultName === 'undefined') var resultName = nodes[0].name+"_merged"
    if (typeof group === 'undefined') var group = nodes[0].path;
    if (typeof deleteMerged === 'undefined') var deleteMerged = true;
   
    // only merge READ nodes so we filter out other nodes from parameters
    nodes = nodes.filter(function(x){return x.type == "READ"})
   
    var _timeline = this.getTimeline()
    nodes = nodes.sort(function(a, b){return a.timelineIndex(_timeline) - b.timelineIndex(_timeline)})
       
    // create a new destination node for the merged result
    var _mergedNode = this.addDrawingNode(resultName);
   
    // connect the node to the scene base composite, TODO: handle better placement
    // also TODO: check that the composite is connected to the display currently active
    // also TODO: disable pegs that affect the nodes but that we don't want to merge
    var _composite = this.nodes.filter(function(x){return x.type == "COMPOSITE"})[0]
   
    _mergedNode.linkOutNode(_composite);
   
    // get  the individual keys of all nodes
    var _keys = []
    for (var i in nodes){
        var _timings = nodes[i].timings;
        var _frameNumbers = _keys.map(function (x){return x.frameNumber})
        for (var j in _timings){
            if (_frameNumbers.indexOf(_timings[j]. frameNumber) == -1) _keys.push(_timings[j])
        }
    }
   
    // sort frame objects by frameNumber
    _keys = _keys.sort(function(a, b){return a.frameNumber - b.frameNumber})
   
    // create an empty drawing for each exposure of the nodes to be merged
    for (var i in _keys){
        var _frame = _keys[i].frameNumber
        _mergedNode.element.addDrawing(_frame)

        // copy paste the content of each of the nodes onto the mergedNode
        // code inspired by Bake_Parent_to_Drawings v1.2 from Yu Ueda (raindropmoment.com)
        frame.setCurrent( _frame );
 
        Action.perform("onActionChooseSelectTool()", "cameraView");
        for (var j=nodes.length-1; j>=0; j--){
            if (nodes[j].drawing.element.frames[_frame].isBlank) continue;
           
            DrawingTools.setCurrentDrawingFromNodeName( nodes[j].fullPath, _frame );
            Action.perform("selectAll()", "cameraView");
            
            // select all and check. If empty, operation ends for the current frame
            if (Action.validate("copy()", "cameraView").enabled){
                Action.perform("copy()", "cameraView");
                DrawingTools.setCurrentDrawingFromNodeName( _mergedNode.fullPath, _frame );
                Action.perform("paste()", "cameraView");
            }
        }
    }
   
    _mergedNode.drawing.element.column.extendExposures();
 
    // place merged node at the center of preexisting nodes
    var _box = new oBox();
    for (var i in nodes){
         var _node = nodes[i];
         var _nodeBox = _node.getBounds();
         _box.include(_nodeBox);
    }
   
    MessageLog.trace("center: "+_box.center.x+" "+_box.center.y)
    _mergedNode.x = _box.center.x-_mergedNode.width/2
    _mergedNode.y = _box.center.y-_mergedNode.height/2
	
    // connect to the same composite as the first node, at the same place
    // delete nodes that were merged if parameter is specified
    if (deleteMerged){
        for (var i in nodes){
            nodes[i].remove();
        }
    }
   
    return _mergedNode
   
}
 
 
//oScene short notation methods
 
oScene.prototype.$node = function(fullPath){
    return this.getNodeByName(fullPath)
}
 
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         oTimeline class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oTimeline(string display)
//
// Properties
//
// array layers
//
// Methods
//
 
// oTimeline constructor
 
function oTimeline(display, oSceneObject){
    this.display = display
    this.composition = ''
	this.scene = oSceneObject;
   
    if (node.type(this.display) == '') {
        this.composition = compositionOrder.buildDefaultCompositionOrder()
    }else{
        this.composition = compositionOrder.buildCompositionOrderForDisplay(display)
    }
   
}
 
// Properties
 
 
// array layers
 
Object.defineProperty(oTimeline.prototype, 'layers', {
    get : function(){
        var _timeline = this.layers;
       
        _timeline = _timeline.map(function(x){return this.scene.$node(x)})
       
        return _timeline;
    }
})
 
//NEW
 
// array layers
 
Object.defineProperty(oTimeline.prototype, 'layersList', {
    get : function(){
        var _composition = this.composition
        var _timeline = [];
       
        for (var i in _composition){
            _timeline.push(_composition[i].node)
        }
       
        return _timeline;
    }
})
 
 
 
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
 
// NEW
// oNode constructor
 
function oNode(path, oSceneObject){
    this.fullPath = path;
    this.type = node.type(this.fullPath)
    this.attributes = [];
	this.scene = oSceneObject;
    // generate properties from node attributes to allow for dot notation access
 
    // TODO: attributes as getter setters and add an attribute lookup function
 
    // also generate an array to give access to a list of all attributes
 
    var _attributesList = node.getAttrList(this.fullPath, 1);
    var _attributes = [];
 
    for (var i in _attributesList){
 
        var _attribute = new oAttribute(this, _attributesList[i]);
        var _keyword = _attribute.keyword.toLowerCase();
 
         this[_keyword] = _attribute;
 
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
 
 
// NEW
// point nodePosition
 
Object.defineProperty(oNode.prototype, 'nodePosition', {
    get : function(){
         return new oPoint(node.coordX(this.fullPath), node.coordY(this.fullPath), node.coordZ(this.fullPath))
    },
 
    set : function(newPosition){
        node.coordX(this.fullPath, newPosition.x, newPosition.y, newPosition.y)
    }
})
 
 
// NEW
// int x
 
Object.defineProperty(oNode.prototype, 'x', {
    get : function(){
         return node.coordX(this.fullPath)
    },
 
    set : function(x){
        var _pos = this.nodePosition;
        node.setCoord(this.fullPath, x, _pos.y, _pos.z)
    }
})
 
 
// NEW
// int y
 
Object.defineProperty(oNode.prototype, 'y', {
    get : function(){
         return node.coordY(this.fullPath)
    },
 
    set : function(y){
        var _pos = this.nodePosition;
        node.setCoord(this.fullPath, _pos.x, y, _pos.z)
    }
})
 
// NEW
// int z
 
Object.defineProperty(oNode.prototype, 'z', {
    get : function(){
         return node.coordZ(this.fullPath, z)
    },
 
    set : function(z){
        var _pos = this.nodePosition;
        node.setCoord(this.fullPath, _pos.x, _pos.y, z)
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
        // TODO: ignore/traverse groups
        for (var i = 0; i < node.numberOfInputPorts(this.fullPath); i++){
            var _node = node.srcNode(this.fullPath, i)
            _inNodes.push(this.scene.$node(_node))
        }
        return _inNodes;
    }
})
 
 
// Array outNodes
 
Object.defineProperty(oNode.prototype, 'outNodes', {
    get : function(){
        var _outNodes = [];
		MessageLog.trace("finding outnodes of node "+this.scene)
        for (var i = 0; i < node.numberOfOutputPorts(this.fullPath); i++){
            var _outLinks = [];
            for (var j = 0; j < node.numberOfOutputLinks(this.fullPath, i); j++){
                // TODO: ignore/traverse groups
                var _node = node.dstNode(this.fullPath, i, j);
				_outLinks.push(this.scene.getNodeByName(_node));
            }
			if (_outLinks.length > 1){
				_outNodes.push(_outLinks);
			}else{
				_outNodes = _outNodes.concat(_outLinks);
			}
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
    if (typeof outPort === 'undefined') outPort = 0;
    //node.numberOfOutputPorts(_node);
 
    return node.link(_node, outPort, this.fullPath, inPort, true, true);
 
}
 
 
//NEW
 
// bool unlinkInNode(oNode oNodeObject)
 
oNode.prototype.unlinkInNode = function(oNodeObject){
    var _node = oNodeObject.fullPath;
   
    var _inNodes = this.inNodes;
   
    for (var i in _inNodes){
       
        MessageLog.trace(_inNodes[i].fullPath+" "+_node)
       
        if (_inNodes[i].fullPath == _node){
            return node.unlink(this.fullPath, i)
        }
    }
    return false;
}
 
 
//NEW
 
// bool unlinkOutNode(oNode oNodeObject)
 
oNode.prototype.unlinkOutNode = function(oNodeObject){
    var _node = oNodeObject.fullPath;
   
    var _inNodes = oNodeObject.inNodes;
   
    for (var i in _inNodes){
        if (_inNodes[i].fullPath == this.fullPath){
            return node.unlink(_node, i)
        }
    }
    return false;
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
        var _oNodeObject = this.scene.$node(_nodes[_node]);
        _subNodes.push(_oNodeObject);
        if (recurse && node.isGroup(_nodes[_node])) _subNodes = _subNodes.concat(_oNodeObject.subNodes(recurse));
    }
 
    return _subNodes;
}
 
// NEW
// int timelineIndex
 
oNode.prototype.timelineIndex = function(timeline){
    var _timeline = timeline.layersList;
    return _timeline.indexOf(this.fullPath)
}
 
 
// oBox getBounds()
// Returns an oBox object with the dimensions of the node
 
oNode.prototype.getBounds = function(){
    return new oBox(this.x, this.y, this.x+this.width, this.y+this.height);
}
 
 
// void centerAbove(array oNodeArray, int offset)
// Place a node above one or more nodes with an offset
 
oNode.prototype.centerAbove = function(oNodeArray, xOffset, yOffset){
    // Defaults for optional parameters
    if (typeof xOffset === 'undefined') var xOffset = 0;
    if (typeof yOffset === 'undefined') var yOffset = 0;
 
    // Works with nodes and nodes array
    if (typeof oNodeArray === 'oNode') oNodeArray = [oNodeArray];
 
    var _box = new oBox();
 
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
 
oNode.prototype.duplicate = function(oNodeObject, newName, newPosition){
    // TODO
} 
 
 
// NEW
 
// remove()
 
oNode.prototype.remove = function(deleteColumns, deleteElements){
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
   
    node.deleteNode(this.fullPath, deleteColumns, deleteElements)
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
// oElement element
// [frames] timings


// NEW 
// Inherits from oNode class

function oDrawingNode(path, oSceneObject) {
    // oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'READ') throw "'path' parameter must point to a 'READ' type node";
    oNode.call(this, path, oSceneObject); 
}

// extends oNode and can use its methods
oDrawingNode.prototype = Object.create(oNode.prototype);


// NEW
// oElement element    allows to get and define the element used by a drawing node
 
Object.defineProperty(oDrawingNode.prototype, "element", {
    get : function(){
        var _column = this.drawing.element.column;
        return (new oElement(node.getElementId(this.fullPath), _column))
    },
   
    set : function( oElementObject ){
        var _column = this.drawing.element.column;
        column.setElementIdOfDrawing(_column.uniquename, oElementObject.id)
    }
})


// NEW
// {[frames]} timings      returns the drawing.element keyframes

Object.defineProperty(oDrawingNode.prototype, "timings", {
    get : function(){
        return this.drawing.element.getKeyFrames()
   }
})
 



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
 
// NEW
function oColumn(uniqueName, oAttributeObject){
    this.uniqueName = uniqueName;
    this.attributeObject = oAttributeObject
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
 
 
// NEW
// Array subColumns
 
Object.defineProperty(oColumn.prototype, 'subColumns', {
    get : function(){
        // TODO
    }
})
 
 
// oColumn Class methods
 
//NEW
// extendExposures( {[oFrame]} exposures)
   
oColumn.prototype.extendExposures = function( exposures, amount, replace){
    if (this.type != "DRAWING") return false;
    // if amount is undefined, extend function below will automatically fill empty frames
   
    if (typeof exposures === 'undefined') var exposures = this.attributeObject.getKeyFrames();
 
    for (var i in exposures) {
        if (!exposures[i].isBlank) exposures[i].extend(amount, replace);
    }
 
}
 
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
// string id
// string name
// string path
// oColumn column
//
// Methods
//
 
 
// NEW
// oElement constructor
 
function oElement (id, oColumnObject){
    this.id = id;
    this.column = oColumnObject;
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
 
 
// NEW
// oElement Class methods
 
oElement.prototype.addDrawing = function(atFrame, name, filename){
    if (typeof filename === 'undefined') var filename = false;
    if (typeof name === 'undefined') var name = atFrame+''
   
    var fileExists = filename?true:false;
    // TODO deal with fileExists and storeInProjectFolder
    Drawing.create (this.id, name, fileExists, true);
   
    // place drawing on the column at the provided frame
    column.setEntry(this.column.uniqueName, 1, atFrame, name)
   
    return name;
}
 
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
 
 
// NEW
// oColumn column
 
Object.defineProperty(oAttribute.prototype, 'column', {
    get : function(){
        var _column = node.linkedColumn (this.oNodeObject.fullPath, this.keyword)
        return new oColumn(_column, this)
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
    MessageLog.trace('setting frame :'+frame+' to value: '+value+' of attribute: '+this.keyword)
 
    if (frame != 1){
        // generate a new column to be able to animate
        if (this.column == null){
            var _doc = new oScene();
            var _column = _doc.addColumn()
            this.column = _column;
        }
        this.column.frames[frame].value = value
 
    }else{
        // TODO deal with subattributes
        try{
            if (this.column == null){
                this.attributeObject.setValue(value);
                return true;
            }else{
                this.column.frames[frame].value = value
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
    this.attributeObject = this.column.attributeObject;
    this.subColumns = subColumns;
}
 
 
// oFrame Object Properties
 
// NEW
// various value
 
Object.defineProperty(oFrame.prototype, 'value', {
    get : function(){
        if (this.subColumns == 0){
            return column.getEntry(this.column.uniqueName, 1, this.frameNumber)
        }
        // TODO: deal with subColumns: return an object with all values from subattributes
    },
 
    set : function(newValue){
        // TODO: deal with subcolumn
        column.setEntry (this.column.uniqueName, 1, this.frameNumber, newValue)
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
 
 
// NEW
// int duration
 
Object.defineProperty(oFrame.prototype, 'duration', {
    get : function(){
        var _startFrame = this.startFrame;
        var _sceneLength = frame.numberOf()
       
        // walk up the frames of the scene to the next keyFrame to determin duration
        var _frames = this.column.frames
        for (var i=this.frameNumber+1; i<_sceneLength; i++){
            if (_frames[i].isKeyFrame) return _frames[i].frameNumber - _startFrame;
        }
        return _sceneLength - _startFrame;
    }
})
 
 
// NEW
// bool isBlank
 
Object.defineProperty(oFrame.prototype, 'isBlank', {
    get : function(){
        return this.value == ""
    }
})
 
// NEW
// int startFrame
 
Object.defineProperty(oFrame.prototype, 'startFrame', {
    get : function(){
        if (this.isKeyFrame) return this.frameNumber
        if (this.isBlank) return -1;
       
        var _frames = this.column.frames
        for (var i=this.frameNumber-1; i>=1; i--){
            if (_frames[i].isKeyFrame) return _frames[i].frameNumber;
        }
        return -1;
    }
})
 
 
// NEW
// string marker
 
Object.defineProperty(oFrame.prototype, 'marker', {
    get : function(){
        var _column = this.column;
        if (_column.type != "DRAWING") return "";
        return column.getDrawingType(_column.uniqueName, this.frameNumber);
    },
   
    set: function(marker){
        var _column = this.column;
        if (_column.type != "DRAWING") return; // should throw error
        column.setDrawingType(_column.uniqueName, this.frameNumber, marker);
    }
})
 
 
// NEW
// bool extend
 
oFrame.prototype.extend = function( duration, replace){
    if (typeof replace === 'undefined') var replace = true;
    // setting this to false will insert frames as opposed to overwrite existing ones
 
    var _frames = this.column.frames;
 
    if (typeof duration === 'undefined'){
        // extend to next non blank keyframe if not set
        var duration = 0;
        var curFrameEnd = this.startFrame + this.duration;
        var sceneLength = frame.numberOf();
       
        // find next non blank keyframe
        while (_frames[ curFrameEnd + duration].isBlank && (curFrameEnd + duration) < sceneLength){
            duration += _frames[curFrameEnd+duration].duration;
        }
       
        // set to sceneEnd if sceneEnd is reached
        if (curFrameEnd+duration >= sceneLength) duration = sceneLength-curFrameEnd+1;
    }
 
    var _value = this.value;
    var startExtending = this.startFrame+this.duration;
   
    for (var i = 0; i<duration; i++){
        if (!replace){
            // TODO : push all other frames back
        }
        _frames[startExtending+i].value = _value;
    }  
}
 
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
         return this.paletteObject.getName();
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
 
 
// NEW
function oBox (left, top, right, bottom){
    // default box is one of -Infinity surface to easily call .include
    if (typeof top === 'undefined') var top = Infinity
    if (typeof left === 'undefined') var left = Infinity
    if (typeof right === 'undefined') var right = -Infinity
    if (typeof bottom === 'undefined') var bottom = -Infinity
   
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
    this.path = fileMapper.toNativePath(path).split("\\").join("/")
}
 
 
Object.defineProperty(oFolder.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1)
        return _name;
    }
})
 
//NEW
 
oFolder.prototype.getFiles = function(filter){
       
    if (typeof filter === 'undefined') var filter = "*"
    // returns the list of oFile in a directory that match a filter
    var _files = this.listFiles(filter).map(function(x){return new oFile(_dir.path()+"/"+x)});
   
    return _files;
}
 
//NEW
 
oFolder.prototype.listFiles = function(filter){
   
    if (typeof filter === 'undefined') var filter = "*"
   
    var _dir = new QDir;
    _dir.setPath(this.path);
    _dir.setNameFilters([filter]);
    _dir.setFilter( QDir.Files);
    var _files = _dir.entryList()
   
    return _files;
}
 
//NEW
 
oFolder.prototype.getFolders = function(filter){
   
    if (typeof filter === 'undefined') var filter = "*"
    // returns the list of oFolder objects in a directory that match a filter
    var _folders = this.listFolders(filter).map(function(x){return new oFolder(this.path()+"/"+x)});
 
    return _folders;
}
 
//NEW
 
oFolder.prototype.listFolders = function(filter){
   
    if (typeof filter === 'undefined') var filter = "*"
   
    var _dir = new QDir;
    _dir.setPath(this.path);
    _dir.setNameFilters([filter]);
    _dir.setFilter( QDir.Dirs); //QDir.NoDotAndDotDot not supported?
    var _folders = _dir.entryList()
   
    for (var i = _folders.length-1; i>=0; i--){
        if (_folders[i] == "." || _folders[i] == "..") _folders.splice(i,1);
    }
   
    return _folders
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
