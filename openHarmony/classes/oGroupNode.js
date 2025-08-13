//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oGroupNode class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oNode = require("./oNode.js");

include(specialFolders.resource+"/scripts/TB_orderNetworkUp.js"  );
include(specialFolders.userScripts+"/TB_orderNetworkUp.js");       // for older versions of harmony


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
function oGroupNode (path, oSceneObject) {
    // $.oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'GROUP') throw "'path' parameter must point to a 'GROUP' type node";
    var instance = this.$.oNode.call(this, path, oSceneObject);
    if (instance) return instance;

    this._type = 'groupNode';
}
oGroupNode.prototype = Object.create(oNode.prototype);


/**
 * The multiport in node of the group. If one doesn't exist, it will be created.
 * @name $.oGroupNode#multiportIn
 * @readonly
 * @type {$.oNode}
 */
Object.defineProperty(oGroupNode.prototype, "multiportIn", {
    get : function(){
        if (this.isRoot) return null
        var _MPI = this.scene.getNodeByPath(node.getGroupInputModule(this.path, "Multiport-In", 0,-100,0),this.scene)
        return (_MPI)
    }
})


/**
 * The multiport out node of the group. If one doesn't exist, it will be created.
 * @name $.oGroupNode#multiportOut
 * @readonly
 * @type {$.oNode}
 */
Object.defineProperty(oGroupNode.prototype, "multiportOut", {
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
Object.defineProperty(oGroupNode.prototype, "nodes", {
  get : function() {
    var _path = this.path;
    var _nodes = node.subNodes(_path);

    var self = this;
    return _nodes.map(function(x){return self.scene.getNodeByPath(x)});
  }
});


 /**
 * All the nodes contained within the group, excluding multiports.
 * @name $.oGroupNode#nodesNoMultiport
 * @readonly
 * @type {$.oNode[]}
 */
Object.defineProperty(oGroupNode.prototype, "nodesNoMultiport", {
  get : function() {
    return this.nodes.filter(function(x){return x.type != "MULTIPORT_IN" && x.type != "MULTIPORT_OUT"})
  }
});



 /**
 * All the backdrops contained within the group.
 * @name $.oGroupNode#backdrops
 * @readonly
 * @type {$.oBackdrop[]}
 */
Object.defineProperty(oGroupNode.prototype, "backdrops", {
  get : function() {
    var _path = this.path;
    var _backdropObjects = Backdrop.backdrops(this.path);
    var _backdrops = _backdropObjects.map(function(x){return new this.$.oBackdrop(_path, x)});

    return _backdrops;
  }
});


 /**
 * Returns a node from within a group based on its name.
 * @param   {string}      name           The name of the node.
 *
 * @return  {$.oNode}     The node, or null if can't be found.
 */
oGroupNode.prototype.getNodeByName = function(name){
  var _path = this.path+"/"+name;

  return this.scene.getNodeByPath(_path);
}


 /**
 * Returns all the nodes of a certain type in the group.
 * Pass a value to recurse to look into the groups as well.
 * @param   {string}        typeName      The type of the nodes.
 * @param   {bool}          recurse       Wether to look inside the groups.
 *
 * @return  {$.oNode[]}     The nodes found.
 */
oGroupNode.prototype.getNodesByType = function(typeName, recurse){
  if (typeof recurse === 'undefined') var recurse = false;
  return this.subNodes(recurse).filter(function(x){return x.type == typeName});
}


 /**
 * Returns a child node in a group based on a search.
 * @param   {string}      name           The name of the node.
 *
 * @return  {$.oNode}     The node, or null if can't be found.
 */
oGroupNode.prototype.$node = function(name){
  return this.getNodeByName(name);
}


 /**
 * Gets all the nodes contained within the group.
 * @param   {bool}    [recurse=false]             Whether to recurse the groups within the groups.
 *
 * @return  {$.oNode[]}   The nodes in the group
 */
oGroupNode.prototype.subNodes = function(recurse){
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
oGroupNode.prototype.children = function(recurse){
  return this.subNodes(recurse);
}



 /**
 * Creates an in-port on top of a group
 * @param   {int}         portNum            The port number where a port will be added
 * @type    {string}
 *
 * @return  {int}   The number of the created port in case the port specified was not correct (for example larger than the current number of ports + 1)
 */
oGroupNode.prototype.addInPort = function(portNum, type){
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
oGroupNode.prototype.addOutPort = function(portNum, type){
  var _outPorts = this.outPorts;

  if (typeof portNum === 'undefined') var portNum = _outPorts;
  if (portNum > _outPorts) portNum = _outPorts;

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
oGroupNode.prototype.children = function(recurse){
  return this.subNodes(recurse);
}



 /**
 * Sorts out the node view inside the group
 * @param   {bool}    [recurse=false]             Whether to recurse the groups within the groups.
 */
oGroupNode.prototype.orderNodeView = function(recurse){
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
oGroupNode.prototype.addNode = function( type, name, nodePosition ){
  // Defaults for optional parameters
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
  if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
  if (typeof name !== 'string') name = name+"";

  var _group = this.path;

  // get unique name if type is DISPLAY as all other types increment on their own
  if (type == "DISPLAY"){
    var num = 1;
    var displayName = name;
    while (this.$node(displayName)){
      displayName = name + "_" + num;
      num++;
    }
    name = displayName;
  }

  // create node and return result (this sanitizes/increments the name, so we only create the oNode with the returned value)
  var _path = node.add(_group, name, type, nodePosition.x, nodePosition.y, nodePosition.z);
  _node = this.scene.getNodeByPath(_path);

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

oGroupNode.prototype.addDrawingNode = function( name, nodePosition, oElementObject, drawingColumn){
  // add drawing column and element if not passed as parameters
  this.$.beginUndo("oH_addDrawingNode_"+name);

  // Defaults for optional parameters
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
  if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();

  // creating the node first to get the "safe name" returned by harmony
  var _node = this.addNode("READ", name, nodePosition);

  if (typeof oElementObject === 'undefined') var oElementObject = this.scene.addElement(_node.name);
  if (typeof drawingColumn === 'undefined'){
    // first look for a column in the element
    if (!oElementObject.column) {
      var drawingColumn = this.scene.addColumn("DRAWING", _node.name, oElementObject);
    }else{
      var drawingColumn = oElementObject.column;
    }
  }

  // setup the node
  // setup animate mode/separate based on preferences?
  _node.attributes.drawing.element.column = drawingColumn;
  var _prefs = this.$.app.preferences
  _node.can_animate = _prefs.ELEMENT_CAN_BE_ANIMATED_DEFAULT_VALUE;
  _node.offset.separate = _prefs.READ_DEFAULT_SEPARATE_POSITION;
  _node.scale.separate = _prefs.READ_DEFAULT_SEPARATE_SCALE;
  _node.use_drawing_pivot = _prefs.READ_USE_DRAWING_PIVOT?"Apply Embedded Pivot on Drawing Layer":"Don't Use Embedded Pivot";

  this.$.endUndo();

  return _node;
}


/**
 * Adds a new group to the group, and optionally move the specified nodes into it.
 * @param   {string}     name                           The name of the newly created group.
 * @param   {$.oPoint}   [addComposite=false]           Whether to add a composite.
 * @param   {bool}       [addPeg=false]                 Whether to add a peg.
 * @param   {$.oNode[]}  [includeNodes]                 The nodes to add to the group.
 * @param   {$.oPoint}   [nodePosition={0,0,0}]         The position for the node to be placed in the network.

 * @return {$.oGroupNode}   The created node, or bool as false.
 */
oGroupNode.prototype.addGroup = function( name, addComposite, addPeg, includeNodes, nodePosition ){
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
      includeNodes = includeNodes.sort(function(a, b){return a.timelineIndex()>=b.timelineIndex()?1:-1})

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
oGroupNode.prototype.importTemplate = function( tplPath, destinationNodes, extendScene, nodePosition, pasteOptions ){
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
    var oldBackdrops = this.backdrops;
    copyPaste.pasteNewNodes(_tpl, _group, pasteOptions);
    var _scene = this.scene;
    var _nodes = selection.selectedNodes().map(function(x){return _scene.$node(x)});
    for (var i in _nodes){
      // only move the root nodes
      if (_nodes[i].parent.path != this.path) continue

      _nodes[i].x += nodePosition.x;
      _nodes[i].y += nodePosition.y;
    }

    // move backdrops present in the template
    var allBackdrops = this.backdrops;
    var newBackdrops = allBackdrops.slice(0,allBackdrops.length - oldBackdrops.length);
    for (var i in newBackdrops){
      newBackdrops[i].x += nodePosition.x;
      newBackdrops[i].y += nodePosition.y;
    }

    // move waypoints in the top level of the template
    for (var i in _nodes) {
      var nodePorts = _nodes[i].outPorts;
      for (var p = 0; p < nodePorts; p++) {
        var theseWP = waypoint.childWaypoints(_nodes[i], p);
        if (theseWP.length > 0) {
          for (var w in theseWP) {
            var x = waypoint.coordX(theseWP[w]);
            var y = waypoint.coordY(theseWP[w]);
            x += nodePosition.x;
            y += nodePosition.y;
            waypoint.setCoord(theseWP[w],x,y);
          }
        }
      }
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
oGroupNode.prototype.addBackdrop = function(title, body, color, x, y, width, height ){
  if (typeof color === 'undefined') var color = new this.$.oColorValue("#323232ff");
  if (typeof body === 'undefined') var body = "";

  if (typeof x === 'undefined') var x = 0;
  if (typeof y === 'undefined') var y = 0;
  if (typeof width === 'undefined') var width = 30;
  if (typeof height === 'undefined') var height = 30;

  var position = {"x":x, "y":y, "w":width, "h":height};

  var groupPath = this.path;

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
 *  var group = nodes[0].group // get the group to add the backdrop to
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
oGroupNode.prototype.addBackdropToNodes = function( nodes, title, body, color, x, y, width, height ){
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
 * This function is not available when running as harmony in batch mode.
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
oGroupNode.prototype.importPSD = function( path, separateLayers, addPeg, addComposite, alignment, nodePosition){
  if (typeof alignment === 'undefined') var alignment = "ASIS" // create an enum for alignments?
  if (typeof addComposite === 'undefined') var addComposite = true;
  if (typeof addPeg === 'undefined') var addPeg = true;
  if (typeof separateLayers === 'undefined') var separateLayers = true;
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);

  if (this.$.batchMode){
    this.$.debug("Error: can't import PSD file "+_psdFile.path+" in batch mode.", this.$.DEBUG_LEVEL.ERROR);
    return null
  }

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

    for (var i in _layers){
      // generate nodes and set them to show the element for each layer
      var _layer = _layers[i];
      var _layerName = _layer.layerName.split(" ").join("_");
      var _nodePosition = new this.$.oPoint(_x+=_xSpacing, _y +=_ySpacing, 0);

      // get/build the group
      var _group = this;
      var _groupPathComponents = _layer.layerPathComponents;
      var _destinationPath = this.path;
      var _groupPeg = _peg;
      var _groupComp = _comp;

      // recursively creating groups if they are missing
      for (var i in _groupPathComponents){
        var _destinationPath = _destinationPath + "/" + _groupPathComponents[i];
        var _nextGroup = this.$.scene.getNodeByPath(_destinationPath);

        if (!_nextGroup){
          _nextGroup = _group.addGroup(_groupPathComponents[i], true, true, [], _nodePosition);
          if (_groupPeg) _nextGroup.linkInNode(_groupPeg);
          if (_groupComp) _nextGroup.linkOutNode(_groupComp, 0, 0);
        }
        // store the peg/comp for next iteration or layer node
        _group = _nextGroup;
        _groupPeg = _group.multiportIn.linkedOutNodes[0];
        _groupComp = _group.multiportOut.linkedInNodes[0];
      }

      var _column = this.scene.addColumn("DRAWING", _layerName, _element);
      var _node = _group.addDrawingNode(_layerName, _nodePosition, _element, _column);

      _node.enabled = _layers[i].visible;
      _node.can_animate = false; // use general pref?
      _node.apply_matte_to_color = "Straight";
      _node.alignment_rule = alignment;
      _node.scale.x = _scale;
      _node.scale.y = _scale;

      _column.setValue(_layer.layer != ""?"1:"+_layer.layer:1, 1);
      _column.extendExposures();

      if (_groupPeg) _node.linkInNode(_groupPeg);
      if (_groupComp) _node.linkOutNode(_groupComp, 0, 0);

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
oGroupNode.prototype.updatePSD = function( path, separateLayers ){
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
 * @param {string} path The image file to import.
 * @param {string} [alignment="ASIS"] Alignment type.
 * @param {$.oPoint} [nodePosition={0,0,0}] The position for the node to be placed in the node view.
 * @param {bool} [convertToTvg=false] Convert image to TVG format.
 * @param {string} [resized_axis="Y"] Resize image to fit with scene resolution in given axis.
 *
 * @return  {$.oNode}    The node for the imported image
 */
oGroupNode.prototype.importImage = function( path, alignment, nodePosition, convertToTvg, resized_axis){

  if (typeof alignment === 'undefined') var alignment = "ASIS"; // create an enum for alignments?
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
  if (typeof convertToTvg === 'undefined') var convertToTvg = false;
  if (typeof resized_axis === 'undefined') var resized_axis = "Y";

  var _imageFile = (path instanceof this.$.oFile)?path:new this.$.oFile( path );
  var _elementName = _imageFile.name;

  var _elementType = convertToTvg?"TVG":_imageFile.extension.toUpperCase();
  var _element = this.scene.addElement(_elementName, _elementType);
  var _column = this.scene.addColumn("DRAWING", _elementName, _element);
  _element.column = _column;

  if (_imageFile.exists) {
    var _drawing = _element.addDrawing(1, 1, _imageFile.path, convertToTvg);
  }else{
    this.$.debug("Image file to import "+_imageFile.path+" could not be found.", this.$.DEBUG_LEVEL.ERROR);
  }

  var _imageNode = this.addDrawingNode(_elementName, nodePosition, _element);

  _imageNode.apply_matte_to_color = "Straight";
  _imageNode.alignment_rule = alignment;

  if (convertToTvg) {
    var _scale = 1
    if (resized_axis == "Y") {
      _scale = this.scene.defaultResolutionY/CELIO.getInformation(_imageFile.path).height;
    } else if (resized_axis == "X") {
      _scale = this.scene.defaultResolutionX/CELIO.getInformation(_imageFile.path).width;
    }
    _imageNode.scale.x = _scale;
    _imageNode.scale.y = _scale;
  }

  _imageNode.attributes.drawing.element.setValue(_drawing.name, 1);
  _imageNode.attributes.drawing.element.column.extendExposures();

  // TODO how to display only one node with the whole file
  return _imageNode;
}


/**
 * imports an image as a tvg drawing.
 * @param {$.oFile} path                         the image file to import
 * @param {string} [alignment="ASIS"]            the alignment mode for the imported image
 * @param {$.oPoint} [nodePosition={0,0,0}]      the position for the created node.
 */
oGroupNode.prototype.importImageAsTVG = function(path, alignment, nodePosition){
  if (!(path instanceof this.$.oFile)) path = new this.$.oFile(path);

  var _imageNode = this.importImage(path, alignment, nodePosition, true);
  _imageNode.name = path.name;

  return _imageNode;
}


/**
 * imports an image sequence as a node into the current group.
 * @param {$.oFile[]} imagePaths           a list of paths to the images to import (can pass a list of strings or $.oFile)
 * @param {number}    [exposureLength=1]   the number of frames each drawing should be exposed at. If set to 0/false, each drawing will use the numbering suffix of the file to set its frame.
 * @param {boolean}   [convertToTvg=false] wether to convert the files to tvg during import
 * @param {string}    [alignment="ASIS"]   the alignment to apply to the node
 * @param {$.oPoint}  [nodePosition]       the position of the node in the nodeview
 * @param {string} [resized_axis="Y"] Resize image to fit with scene resolution in given axis.
 *
 * @returns {$.oDrawingNode} the created node
 */
oGroupNode.prototype.importImageSequence = function(imagePaths, exposureLength, convertToTvg, alignment, nodePosition, extendScene, resized_axis) {
  if (typeof exposureLength === 'undefined') var exposureLength = 1;
  if (typeof alignment === 'undefined') var alignment = "ASIS"; // create an enum for alignments?
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
  if (typeof extendScene === 'undefined') var extendScene = false;
  if (typeof resized_axis === 'undefined') var resized_axis = "Y";
  // match anything but capture trailing numbers and separates punctuation preceeding it
  var numberingRe = /(.*?)([\W_]+)?(\d*)$/i;

  // sanitize imagePaths
  imagePaths = imagePaths.map(function(x){
    if (x instanceof this.$.oFile){
      return x;
    } else {
      return new this.$.oFile(x);
    }
  })

  var images = [];

  if (!exposureLength) {
  // figure out scene length based on exposure and extend the scene if needed
    var sceneLength = 0;
    var image = {frame:0, path:""};

    for (var i in imagePaths){
      var imagePath = imagePaths[i];
      if (!(imagePath instanceof this.$.oFile)) imagePath = new this.$.oFile(imagePath);
      var nameGroups = imagePath.name.match(numberingRe);

      if (nameGroups[3]){
        // use trailing number as frame number
        var frameNumber = parseInt(nameGroups[3], 10);
        if (frameNumber > sceneLength) sceneLength = frameNumber;

        images.push({frame: frameNumber, path:imagePath});
      }
    }
  } else {
    // simply create a list of numbers based on exposure
    images = imagePaths.map(function(x, index){
      var frameNumber = index * exposureLength + 1;
      return ({frame:frameNumber, path:x});
    })
    var sceneLength = images[images.length-1].frame + exposureLength - 1;
  }

  if (extendScene){
    if (this.scene.length < sceneLength) this.scene.length = sceneLength;
  }

  // create a node to hold the image sequence
  var firstImage = imagePaths[0];
  var name = firstImage.name.match(numberingRe)[1]; // match anything before trailing digits
  var drawingNode = this.importImage(firstImage, alignment, nodePosition, convertToTvg, resized_axis);
  drawingNode.name = name;

  for (var i in images){
    var image = images[i];
    drawingNode.element.addDrawing(image.frame, image.frame, image.path, convertToTvg);
  }

  drawingNode.timingColumn.extendExposures();

  return drawingNode;
}

/**
 * Imports a QT into the group
 * @param   {string}         path                          The palette file to import.
 * @param   {bool}           [importSound=true]            Whether to import the sound
 * @param   {bool}           [extendScene=true]            Whether to extend the scene to the duration of the QT.
 * @param   {string}         [alignment="ASIS"]            Alignment type.
 * @param   {$.oPoint}       [nodePosition]                The position for the node to be placed in the network.
 * @param {bool}             [convertToTvg=false]          Convert movie frames to TVG format.
 *
 * @return {$.oNode}        The imported Quicktime Node.
 */
oGroupNode.prototype.importQT = function( path, importSound, extendScene, alignment, nodePosition, convertToTvg){
  if (typeof alignment === 'undefined') var alignment = "ASIS";
  if (typeof extendScene === 'undefined') var extendScene = true;
  if (typeof importSound === 'undefined') var importSound = true;
  if (typeof nodePosition === 'undefined') var nodePosition = new this.$.oPoint(0,0,0);
  if (typeof convertToTvg === 'undefined') var convertToTvg = false;

  var _QTFile = (path instanceof this.$.oFile)?path:new this.$.oFile(path);
  if (!_QTFile.exists){
    throw new Error ("Import Quicktime failed: file "+_QTFile.path+" doesn't exist");
  }

  var _movieName = _QTFile.name;
  this.$.beginUndo("oH_importQT_"+_movieName);

  var imageFormat = "PNG"
  if (convertToTvg) {
    imageFormat = "TVG"
  }
  var _element = this.scene.addElement(_movieName, imageFormat);
  var _elementName = _element.name;

  var _movieNode = this.addDrawingNode(_movieName, nodePosition, _element);
  var _column = _movieNode.attributes.drawing.element.column;
  _element.column = _column;

  // setup the node
  _movieNode.can_animate = false;
  _movieNode.alignment_rule = alignment;

  // create the temp folder
  var _tempFolder = new this.$.oFolder(this.$.scn.tempFolder.path + "/movImport/" + _element.id);
  _tempFolder.create();

  var _tempFolderPath = _tempFolder.path;
  var _audioPath = _tempFolder.path + "/" + _movieName + ".wav";

  // progressDialog will display an infinite loading bar as we don't have precise feedback
  var progressDialog = new this.$.oProgressDialog("Importing video...", 0, "Import Movie", true);

  // setup import
  MovieImport.setMovieFilename(_QTFile.path);
  MovieImport.setImageFolder(_tempFolder);
  MovieImport.setImagePrefix(_movieName);
  if (importSound) MovieImport.setAudioFile(_audioPath);
  this.$.log("converting movie file to images...");
  MovieImport.doImport();
  this.$.log("conversion finished");

  progressDialog.range = 100;
  progressDialog.value = 80;

  var _movielength = MovieImport.numberOfImages();

  if (extendScene && this.scene.length < _movielength) this.scene.length = _movielength;

  // create a drawing for each frame
  for (var i=1; i<=_movielength; i++) {
    _drawingPath = _tempFolder + "/" + _movieName + "-" + i + ".png";
    _element.addDrawing(i, i, _drawingPath, convertToTvg);
  }

  progressDialog.value = 95;

  // creating an audio column for the sound
  if (importSound && MovieImport.isAudioFileCreated() ){
    var _soundName = _elementName + "_sound";
    var _soundColumn = this.scene.addColumn("SOUND", _soundName);
    column.importSound( _soundColumn.name, 1, _audioPath);
  }

  progressDialog.value = 100;

  this.$.endUndo();
  return _movieNode;
}


exports = oGroupNode;