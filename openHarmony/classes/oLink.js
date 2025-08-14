
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           $.oLink class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oLink class
 * @classdesc
 * The $.oLink class models a connection between two nodes.<br>
 * A $.oLink object is always describing just one connection between two nodes in the same group. For distant nodes in separate groups, use $.oLinkPath.
 * @constructor
 * @param   {$.oNode}        outNode                         The node from which the link is coming out.
 * @param   {$.oNode}        inNode                          The node into which the link is connected.
 * @param   {oScene}         [outPortNum]                    The out-port of the outNode used by this link.
 * @param   {oScene}         [inPortNum]                     The in-port of the inNode used by this link.
 * @param   {oScene}         [outLinkNum]                    The link index coming out of the out-port.
 * @param   {bool}           [isValid=false]                 Bypass checks and assume this link is connected.
 * @example
 * // find out if two nodes are linked, and through which ports
 * var doc = $.scn;
 * var myNode = doc.root.$node("Drawing");
 * var sceneComp = doc.root.$node("Composite");
 *
 * var myLink = new $.oLink(myNode, sceneComp);
 *
 * log(myLink.linked+" "+myLink.inPort+" "+myLink.outPort+" "+myLink.outLink); // trace the details of the connection.
 *
 * // activate/deactivate connections simply:
 * myLink.connect();
 * log (myLink.linked)  // true
 *
 * myLink.disconnect();
 * log (myLink.linked)  // false
 *
 * // it is also possible to set the linked status directly on the linked property:
 * myLink.linked = true;
 *
 * // however, changing the ports of the link object don't physically change the connection
 *
 * myLink.inPort = 2    // the connection didn't change, the link object simply represents now a different connection possible.
 * log (myLink.linked)  // false
 *
 * myLink.connect()     // this will connect the nodes once more, with different ports. A new connection is created.
 */
function oLink (outNode, inNode, outPortNum, inPortNum, outLinkNum, isValid){
  this._outNode = outNode;
  this._inNode = inNode;
  this._outPort = (typeof outPortNum !== 'undefined')? outPortNum:undefined;
  this._outLink = (typeof outLinkNum !== 'undefined')? outLinkNum:undefined;
  this._inPort = (typeof inPortNum !== 'undefined')? inPortNum:undefined;
  this._linked = (typeof isValid !== 'undefined')? isValid:false;
}


/**
 * The node that the link is coming out of. Changing this value doesn't reconnect the link, just changes the connection described by the link object.
 * @name $.oLink#outNode
 * @type {$.oNode}
 */
Object.defineProperty(oLink.prototype, 'outNode', {
  get : function(){
    return this._outNode;
  },

  set : function(newOutNode){
    this._outNode = newOutNode;
    this._linked = false;
  }
});


/**
 * The node that the link is connected into. Changing this value doesn't reconnect the link, just changes the connection described by the link object.
 * @name $.oLink#inNode
 * @type {$.oNode}
 */
Object.defineProperty(oLink.prototype, 'inNode', {
  get : function(){
    return this._inNode;
  },

  set: function(newInNode){
    this._inNode = newInNode;
    this._linked = false;
  }
});


/**
 * The in-port used by the link. Changing this value doesn't reconnect the link, just changes the connection described by the link object.
 * <br>In the event this value wasn't known by the link object but the link is actually connected, the correct value will be found.
 * @name $.oLink#inPort
 * @type {int}
 */
Object.defineProperty(oLink.prototype, 'inPort', {
  get : function(){
    if (this.linked) return this._inPort;  // cached value was correct

    var _found = this.findPorts();
    if (_found) return this._inPort;

    // nodes are not connected
    return null;
  },

  set : function(newInPort){
    this._inPort = newInPort;
    this._linked = false;
  }
});


/**
 * The out-port used by the link. Changing this value doesn't reconnect the link, just changes the connection described by the link object.
 * <br>In the event this value wasn't known by the link object but the link is actually connected, the correct value will be found.
 * @name $.oLink#outPort
 * @type {int}
 */
Object.defineProperty(oLink.prototype, 'outPort', {
  get : function(){
    if (this.linked) return this._outPort;  // cached value was correct

    var _found = this.findPorts();
    if (_found) return this._outPort;

    // nodes are not connected
    return null;
  },

  set : function(newOutPort){
    this._outPort = newOutPort;
    this._linked = false;
  }
});


/**
 * The index of the link comming out of the out-port.
 * <br>In the event this value wasn't known by the link object but the link is actually connected, the correct value will be found.
 * @name $.oLink#outLink
 * @readonly
 * @type {int}
 */
Object.defineProperty(oLink.prototype, 'outLink', {
  get : function(){
    if (this.linked) return this._outLink;

    var _found = this.findPorts();
    if (_found) return this._outLink;

    // nodes are not connected
    return null;
  }
});


/**
 * Get and set the linked status of a link
 * @name $.oLink#linked
 * @type {bool}
 */
Object.defineProperty(oLink.prototype, 'linked', {
  get : function(){
    if (this._linked) return this._linked;

    // first check if node object refers to two valid nodes
    if (this.outNode === undefined || this.inNode === undefined){
      this.$.debug("checking 'linked' for invalid link: "+this.outNode+">"+this.inNode, this.$.DEBUG_LEVEL.ERROR)
      return false;
    }

    // if ports/links unknown, get a valid link we can check
    if (this._outPort === undefined || this._inPort === undefined || this._outLink === undefined){
      if (!this.findPorts()){
        return false;
      }
    }

    // if ports/links are specified, we check the if the nodes connected to each port correspond with the link values
    var _linkedOutNode = this.outNode.getLinkedOutNode(this._outPort, this._outLink);
    var _linkedInNode = this.inNode.getLinkedInNode(this._inPort);

    if (_linkedOutNode == null || _linkedInNode == null) return false;

    var validOutLink = (_linkedOutNode.path == this.inNode.path);
    var validInLink = (_linkedInNode.path == this.outNode.path);

    if (validOutLink && validInLink){
      this._linked = true;
      return true;
    }
    return false;
  },

  set : function(newLinkedStatus){
    if (newLinkedStatus){
      this.connect();
    }else{
      this.disconnect();
    }
  }
});


/**
 * Compares the start and end nodes groups to see if the path traverses several groups or not.
 * @name $.oLink#isMultiLevel
 * @readonly
 * @type {bool}
 */
Object.defineProperty(oLink.prototype, 'isMultiLevel', {
  get : function(){
    //this.$.debug("isMultiLevel? "+this.outNode +" "+this.inNode, this.$.DEBUG_LEVEL.LOG);
    if (!this.outNode || !this.outNode.group || !this.inNode || !this.inNode.group) return false;
    return this.outNode.group.path != this.inNode.group.path;
  }
});


/**
 * Compares the start and end nodes groups to see if the path traverses several groups or not.
 * @name $.oLink#isMultiLevel
 * @readonly
 * @type {bool}
 */
Object.defineProperty(oLink.prototype, 'waypoints', {
  get : function(){
    if (!this.linked) return []
    var _waypoints = waypoint.getAllWaypointsAbove (this.inNode, this.inPort)
    return _waypoints;
  }
});


/**
 * Get a link that can be connected by working out ports that can be used. If a link already exists, it will be returned.
 * @return {$.oLink} A separate $.oLink object that can be connected. Null if none could be constructed.
 */
oLink.prototype.getValidLink = function(createOutPorts, createInPorts){
  if (typeof createOutPorts === 'undefined') var createOutPorts = false;
  if (typeof createInPorts === 'undefined') var createInPorts = true;
  var start = this.outNode;
  var end = this.inNode;
  var outPort = this._outPort;
  var inPort = this._inPort;

  if (!start || !end) {
    this.$.debug("A valid link can't be found: node missing in link "+this.toString(), this.$.DEBUG_LEVEL.ERROR)
    return null;
  }

  if (this.isMultiLevel) return null;

  var _link = new this.$.oLink(start, end, outPort, inPort);
  _link.findPorts();

  // if can't be found, choose a new non existent link
  if (!_link.linked){
    if (typeof outPort === 'undefined' || outPort === undefined){
      _link._outPort = start.getFreeOutPort(createOutPorts);
      // if (_link._outPort == null) _link._outPort = 0; // just use a current port and add a link
    }

    _link._outLink = start.getOutLinksNumber(_link._outPort);

    if (typeof inPort === 'undefined' || inPort === undefined){
      _link._inPort = end.getFreeInPort(createInPorts);
      if (_link._inPort == null){
        this.$.debug("can't create link because the node "+end+" can't create a free inPort", this.$.DEBUG_LEVEL.ERROR);
        return null; // can't create a valid link.
      }

    }else{
      _link._inPort = inPort;

      if (end.getInLinksNumber(inPort)!= 0 && !end.canCreateInPorts){
        this.$.debug("can't create link because the requested port "+_link._inPort+" of node "+end+" isn't free", this.$.DEBUG_LEVEL.ERROR);
        return null;
      }
    }
  }

  return _link;
}


/**
 * Attemps to connect a link. Will guess the ports if not provided.
 * @return {bool}
 */
oLink.prototype.connect = function(){
  if (this._linked){
    return true;
  }

  // do we want to just always get a valid link here or do we want it to fail if not set properly?
  if (!this.findPorts()){
    var _validLink = this.getValidLink(this.outNode.canCreateInPorts, this.inNode.canCreateInPorts);
    if (!_validLink) return false;
    this.inPort = _validLink.inPort;
    this.outPort = _validLink.outPort;
    this.outLink = _validLink.outLink;
  };

  if (this.inNode.getInLinksNumber(this._inPort) > 0 && !this.inNode.canCreateInPorts) return false; // can't connect if the in-port is already connected

  var createOutPorts = (this.outNode.outPorts <= this._outPort && this.outNode.canCreateOutPorts);
  var createInPorts = ((this.inNode.inPorts <= this._inPort || this.inNode.getInLinksNumber(this._inPort)>0) && this.inNode.canCreateInPorts);

  if (this._outNode.type == "GROUP" && createOutPorts) this._outNode.addOutPort(this._outPort);
  if (this._inNode.type == "GROUP" && createInPorts) this._inNode.addInPort(this._inPort);

  try{
    this.$.debug("linking nodes "+this._outNode+" to "+this._inNode+" through outPort: "+this._outPort+", inPort: "+this._inPort+" and create ports: "+createOutPorts+" "+createInPorts, this.$.DEBUG_LEVEL.LOG);

    var success = node.link(this._outNode, this._outPort, this._inNode, this._inPort, createOutPorts, createInPorts);
    this._linked = success;

    if (!success) throw new Error();
    return success;

  }catch(err){
    this.$.debug("linking nodes "+this._outNode+" to "+this._inNode+" through outPort: "+this._outPort+", inPort: "+this._inPort+", create outports: "+createOutPorts+", create inports:"+createInPorts, this.$.DEBUG_LEVEL.ERROR);
    this.$.debug("Error linking nodes: " +err, this.$.DEBUG_LEVEL.ERROR);
    return false;
  }
}


/**
 * Disconnects a link.
 * @return {bool} Whether disconnecting was successful;
 */
oLink.prototype.disconnect = function(){
  if (!this._linked) return true;

  if (!this.findPorts()) return false;

  node.unlink(this._inNode, this._inPort);
  this._linked = false;
  return true;
}


/**
 * Finds ports missing or undefined ports in the link object if it is linked, and update the object accordingly. <br>
 * This will not update ports if the link isn't connected. Use getValidLink to get a connectable unconnected link.
 * @private
 * @return {bool} Whether finding ports was successful.
 */
oLink.prototype.findPorts = function(){
  // Unless some ports are specified, this will always find the first link and stop there. Provide more info in case of multiple links

  if (!this.outNode|| !this.inNode) {
    this.$.debug("calling 'findPorts' for invalid link: "+this.outNode+" > "+this.inNode, this.$.DEBUG_LEVEL.ERROR);
    return false;
  }

  if (this._inPort !== undefined && this._outPort!== undefined && this._outLink!== undefined) return true; // ports already are valid, even if link might not be linked

  var _inNodePath = this.inNode.path;
  var _outNodePath = this.outNode.path;

  // Try to find outPort based on inPort
  // most likely to be missing is outLink, and this is the quickest way to find it.
  if (this._inPort != undefined){
    var _nodeInfo = node.srcNodeInfo(_inNodePath, this._inPort);
    if (_nodeInfo && _nodeInfo.node == _outNodePath && (this._outPort == undefined || this._outPort == _nodeInfo.port)){
      this._outPort = _nodeInfo.port;
      this._outLink = _nodeInfo.link;
      this._linked = true;

      // this.$.log("found ports through provided inPort: "+ this._inPort)
      return true;
    }
  }

  // Try to find ports based on outLink/outPort
  if (this._outPort !== undefined && this._outLink !== undefined){
    var _nodeInfo = node.dstNodeInfo(_outNodePath, this._outPort, this._outLink);
    if (_nodeInfo && _nodeInfo.node == _inNodePath){
      this._inPort = _nodeInfo.port;
      this._linked = true;

      // this.$.log("found ports through provided outPort/outLink: "+this._outPort+" "+this._outLink)
      return true;
    }
  }

  // Find the ports if we are missing all of them, looking at in-ports to avoid messing with outLinks
  var _inPorts = this.inNode.inPorts;
  for (var i = 0; i<_inPorts; i++){
    var _nodeInfo = node.srcNodeInfo(_inNodePath, i);
    if (_nodeInfo && _nodeInfo.node == _outNodePath){
      if (this._outPort !== undefined && this._outPort !== _nodeInfo.port) continue;

      this._inPort = i;
      this._outPort = _nodeInfo.port;
      this._outLink = _nodeInfo.link;

      // this.$.log("found ports through iterations")
      this._linked = true;

      return true;
    }
  }

  // The nodes are not linked
  this._linked = false;
  return false;
}


/**
 * Connects the given node in the middle of the link. The link must be connected.
 * @param {$.oNode} oNode          The node to insert in the link
 * @param {int} [nodeInPort = 0]   The inPort to use on the inserted node
 * @param {int} [nodeOutPort = 0]  The outPort to use on the inserted node
 * @param {int} [nodeOutLink = 0]  The outLink to use on the inserted node
 * @return {$.oLink[]}   an Array of two oLink objects that describe the new connections.
 * @example
 * include("openHarmony.js")
 * doc = $.scn
 * var node1 = doc.$node("Top/Drawing")
 * var node2 = doc.$node("Top/Composite")
 * var node3 = doc.$node("Top/Transparency")
 *
 * var link = new $.oLink(node1, node2)
 * link.insertNode(node3) // insert the Transparency node between the Drawing and Composite
 */
oLink.prototype.insertNode = function(oNode, nodeInPort, nodeOutPort, nodeOutLink){
  if (!this.linked) return    // can't insert a node if the link isn't connected

  this.$.beginUndo("oh_insertNode")

  var _inNode = this.inNode
  var _outNode = this.outNode
  var _inPort = this.inPort
  var _outPort = this.outPort
  var _outLink = this.outLink

  var _topLink = new this.$.oLink(_outNode, oNode, _outPort, nodeInPort, _outLink)
  var _lowerLink = new this.$.oLink(oNode, _inNode, nodeOutPort, _inPort, nodeOutLink)

  this.linked = false;
  var success = (_topLink.connect() && _lowerLink.connect());

  this.$.endUndo()

  if (success) {
    return [_topLink, _lowerLink]
  } else{
    // we restore the links to default state and return false
    this.$.debug("failed to insert node "+oNode+" into link "+this)
    this.$.undo()
    return false
  }
}

/**
 * Converts the node link to a string.
 * @private
 */
oLink.prototype.toString = function( ) {
  return ('link: {"'+this._outNode+'" ['+this._outPort+', '+this._outLink+'] -> "'+this._inNode+'" ['+this._inPort+']} linked:'+this._linked);
  // return '{outNode:'+this.outNode+' inNode:'+this.inNode+' }';
}

exports.oLink = oLink;