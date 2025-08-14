
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oLinkPath class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oLinkPath class
 * @classdesc
 * The $.oLinkPath class allows to figure out paths as a series of links between distant nodes.<br>
 * It can either look for existing paths and check that two distant nodes are connected or create new ones that can then be connected.
 * @constructor
 * @param   {$.oNode}        startNode                       The first node from which the link is coming out.
 * @param   {$.oNode}        endNode                         The last node into which the link is connected.
 * @param   {oScene}         [outPortNum]                    The out-port of the startNode.
 * @param   {oScene}         [inPortNum]                     The in-port of the endNode.
 * @param   {oScene}         [outLinkNum]                    The link index coming out of the out-port of the startNode.
 * @see NodeType
 */
function oLinkPath ( startNode, endNode, outPort, inPort, outLink){
  this.startNode = startNode;
  this.endNode = endNode;
  this.outPort = (typeof outPort !== 'undefined')? outPort:undefined;
  this.inPort = (typeof inPort !== 'undefined')? inPort:undefined;
  this.outLink = (typeof outLink !== 'undefined')? outLink:undefined;
}


/**
 * Compares the start and end nodes groups to see if the path traverses several groups or not.
 * @name $.oLinkPath#isMultiLevel
 * @readonly
 * @type {bool}
 */
Object.defineProperty(oLinkPath.prototype, 'isMultiLevel', {
  get : function(){
    //this.$.log(this.startNode+" "+this.endNode)
    return this.startNode.group.path != this.endNode.group.path;
  }
});


/**
 * Identifies the group in which the two nodes will connect if they are at different levels of depth.
 * @name $.oLinkPath#lowestCommonGroup
 * @readonly
 * @type {$.oGroupNode}
 */
Object.defineProperty(oLinkPath.prototype, 'lowestCommonGroup', {
  get : function(){
    var startPath = this.startNode.group.path.split("/");
    var endPath = this.endNode.group.path.split("/");

    var commonPath = [];
    for (var i=0; i<startPath.length; i++){
      if (startPath[i] != endPath[i]) break;
      commonPath.push(startPath[i]);
    }

    return this.$.scene.getNodeByPath(commonPath.join("/"));
  }
});


/**
 * Finds an existing path if one exists between two distant nodes.
 *
 * @return {$.oLink[]} The list of successive $.oLink objects describing the path. Returns null if no such path could be found.
 */
oLinkPath.prototype.findExistingPath = function(){
  // looking for the startNode from the endNode going up since the hierarchy is usually simpler this direction
  // if inPort is provided, we assume it's correct or a search filter, otherwise look up all inLinks
  var _searchPorts = (this.inPort !== undefined)?[this.inPort]:Array.apply(null, new Array(this.endNode.inPorts)).map(function (x, i) {return i;});

  for (var i = 0; i<_searchPorts.length; i++){
    var _inLink = this.endNode.getInLink(_searchPorts[i]);
    if (_inLink == null) continue; // if no node is connected, this branch is a dead end;

    var _connectedInNode = _inLink.outNode;

    // start looking again from the corresponding node
    if(_connectedInNode.path == this.startNode.path){
      // check that we have the valid outPort/outLink if provided as search filter
      if (this.outPort !== undefined && _inLink.outPort != this.outPort) return null;
      if (this.outLink !== undefined && _inLink.outLink != this.outLink) return null;

      return [_inLink]; // we found the node
    }else if (_connectedInNode.type == "MULTIPORT_IN"){
      _connectedInNode = _connectedInNode.group;
    }else if (_connectedInNode.type == "GROUP"){
      _connectedInNode = _connectedInNode.multiportOut;
    }else{
      // stop looking? any other nodes we want to traverse? Composites?
      continue;
    }

    var _searchLink = new this.$.oLinkPath(this.startNode, _connectedInNode, this.outPort, _inLink.outPort, this.outLink);
    var _path = _searchLink.findExistingPath();

    if (_path == null) return null; // this branch is a dead end

    _path.push(_inLink);
    return _path;
  }

  // we couldn't find a path
  return null
}


/**
 * Gets a link object from two nodes that can be succesfully connected. Provide port numbers if there are specific requirements to match. If a link already exists, it will be returned.
 * @param  {$.oNode}         start          The node from which the link originates.
 * @param  {$.oNode}         end            The node at which the link ends.
 * @param  {int}             [outPort]      A prefered out-port for the link to use.
 * @param  {int}             [inPort]       A prefered in-port for the link to use.
 *
 * @return {$.oLink} the valid $.oLink object.  Returns null if no such link could be created (for example if the node's in-port is already linked)
 */
oLinkPath.prototype.getValidLink = function(start, end, outPort, inPort){
  var _link = new this.$.oLink(start, end, outPort, inPort)
  return _link.getValidLink();
}


/**
 * Finds a valid path between two distant nodes, even if one doesn't currently exist.
 *
 * @return {$.oLink[]}     The list of links needed for the path. Some can already be connected.
 */
oLinkPath.prototype.findNewPath = function(){
  // look for the lowest common group we will have to reach first
  subLinks = [];
  var commonGroup = this.lowestCommonGroup;

  //get links out of the start group until the common group
  var _startPath = [];
  var _node = this.startNode;
  var _preferedOutPort = this.outPort;

  while (_node.group.path != commonGroup.path){
    var _linkOutNode = _node;
    var _linkInNode = _node.group.multiportOut;

    // look for an existing link to reuse
    var _link = this.getValidLink(_linkOutNode, _linkInNode, _preferedOutPort);
    _startPath.push(_link);

    // prepare for next step
    _node = _node.group
    _preferedOutPort = _link.inPort;
  }
  var startGroup = _node;


  // get links out of the end group until the common group
  var _endPath = []
  _node = this.endNode;
  var _preferedInPort = this.inPort;

  while (_node.group.path != commonGroup.path){
    var _linkOutNode = _node.group.multiportIn;
    var _linkInNode = _node;

    // look for an existing link to reuse
    var _link = this.getValidLink(_linkOutNode, _linkInNode, undefined, _preferedInPort);
    _endPath.unshift(_link);

    // prepare for next step
    _node = _node.group;
    _preferedInPort = _link.OutPort;
  }

  var endGroup = _node;

  var _link = this.getValidLink(startGroup, endGroup, _preferedOutPort, _preferedInPort);
  _startPath.push(_link)

  var _path = _startPath.concat(_endPath)
  this.$.log(_path.join("\n"))

  return _path
}


/**
 * Connects all the unconnected links between two distant nodes
 * @return {$.oLink[]} return the list of links present in the created path
 */

oLinkPath.prototype.connectPath = function(){
  var newPath = this.findNewPath();

  for (var i in newPath){
    newPath[i].connect();
  }

  return newPath;
}


exports.oLinkPath = oLinkPath;