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
//         $.oNodeLink class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * The base class for the oTimeline.
 * @constructor
 * @classdesc  oTimeline Base Class
 * @param   {oNode}                   outNode                   The source oNode of the link.
 * @param   {oNode}                   inNode                    The destination oNode of the link.
 * @param   {int}                     inPort                    The inport of the inNode that is connecting the link.
 *                                                          
 * @property   {bool}                    exists                 Whether the connection as-it-is exists.
 * @property   {bool}                    autoDisconnect         Whether to auto-disconnect links if they already exist. 
 
 */
$.oNodeLink = function( outNode, inNode, inPort ){

    var get_default_inport = false;
    if (typeof inPort === 'undefined'){            
      this._inPort = 0;
      
      //Depending on the node type, assume a different inport assumption.
      
    }

    //Public properties.
    this.exists   = false;
    this.autoDisconnect = true;

    //Private properties.
    this._outNode = outNode;
    this._outPort = 0;
    this._outLink = 0;
    
    this._realOutNode = outNode;
    this._realOutPort = 0;
    
    this._inNode  = inNode;
    this._inPort  = inPort;
    
    this._freeze        = false;
    this._newInNode     = false;
    this._newInPort     = false;
    this._newOutNode    = false;
    this._newOutPort    = false;
        
    this.validate();
}





/**
 * The node that is accepting this link on its outPort. It is outputting the link.
 * @name $.oNodeLink#outPort
 * @type {$.oNode}
 */
Object.defineProperty($.oNodeLink.prototype, 'outNode', {
    get : function(){
      return this._outNode;
      
    },
    set : function( val ){
      this._newOutNode = val;
      
      if( this.freeze ){
        return;
      }
      
      this.applyLinks();
    }
});


/**
 * The node that is accepting this link on its inport. It is inputting/accepting the link.
 * @name $.oNodeLink#inNode
 * @type {$.oNode}
 */
Object.defineProperty($.oNodeLink.prototype, 'inNode', {
    get : function(){
      return this._inNode;
      
    },
    set : function( val ){
      //PATH FIND UP TO THE INNODE.
      
      this._newInNode = val;
      
      if( this.freeze ){
        return;
      }
      
      this.applyLinks();
      
      // if( this._inNode ){
        // if( this._inNode.path == val ){
          // return;
        // }
        
        // this._inNode.unlinkInPort( this._inPort );
      // }
      
      // if( !val ){ return; }
      // if( !this._outNode ){ return; }
      
      
      // //Are they the same group?
      // if( val.group.path == this._outNode.group.path ){
        // //Its a direct link, we are safe to link it without any special pathfinding.
        // //Need composite handling for extending to composite.
        
        // if( this.autoDisconnect ){
          // val.unlinkInPort( this.inPort );        
        // }else{
          // if( val.inNodes[0] ){
            // throw "Unable to link "+this._outNode+" to "+val+", port "+this.inPort+" is already occupied.";
          // }
        // }
        
        // this._outNode.linkOutNode( val, this.inPort, this.outPort );
      // }else{
        // //We need pathfinding.
        // throw "Not yet implemented";
        
      // }
    }
});


/**
 * The outport of this $.oNodeLink. The port that the outNode connected to for this link.
 * @name $.oNodeLink#outPort
 * @type {int}
 */
Object.defineProperty($.oNodeLink.prototype, 'outPort', {
    get : function(){
      return this._outPort;
      
    },
    set : function( val ){
      this._newOutPort = val;
      
      if( this.freeze ){
        return;
      }
      
      this.applyLinks();
    }
});

/**
 * The outLink of this $.oNodeLink. The link index that the outNode connected to for this link.
 * @name $.oNodeLink#outLink
 * @type {int}
 */
Object.defineProperty($.oNodeLink.prototype, 'outLink', {
    get : function(){
      return this._outLink;
    }
});


/**
 * The inPort of this $.oNodeLink.
 * @name $.oNodeLink#inPort
 * @type {oNode[]}
 */
Object.defineProperty($.oNodeLink.prototype, 'inPort', {
    get : function(){
      return this._inPort;
    },
    set : function( val ){
      this._newInPort = val;
      
      if( this.freeze ){
        return;
      }
      
      this.applyLinks();
    }
});


/**
 * Whether to freeze the link changes, and apply them when unfrozen.
 * @name $.oNodeLink#freeze
 * @type {bool}
 */
Object.defineProperty($.oNodeLink.prototype, 'freeze', {
    get : function(){
      return this._freeze;
    },
    set : function( val ){
      this._freeze = val;
      
      if( !val ){
        applyLinks();
      }
    }
});

 
// $.oNodeLink Class methods
/**
 * Dereferences up a node's chain, in order to find the exact node its actually attached to.
 * @param   {oNode}                   onode                   The node to dereference the groups for.
 * @param   {int}                     port                    The port to dereference.
 * @private 
 * @return {object}                   Object in form { "node":oNode, "port":int, "link": int }
 */
$.oNodeLink.prototype.findInputNode = function( onode, port, depth ) {
  var srcNodeInfo = node.srcNodeInfo( onode.path, port );
  
  if( !srcNodeInfo ){
    return false;
  }
  
  var src_node = $.scene.getNodeByPath( srcNodeInfo.node );
  if( !src_node ){
    return false;
  }
  
  var orig_source = src_node;
  
  if( src_node.type == "MULTIPORT_IN" ){
    //Continue to dereference until we find something other than a group/multiport in.
    var src_node = src_node.group;
  }else if( src_node.type == "GROUP" ){
    //Continue to dereference until we find something other than a group/multiport out.
    var src_node =  src_node.multiportOut
  }else{
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    if( depth == 0){
      ret["realNode"] = orig_source;
      ret["realPort"] = srcNodeInfo.port;
      ret["realLink"] = srcNodeInfo.link;
    }
    
    return ret;
  }
  
  var recurse = this.findInputNode( src_node, srcNodeInfo.port, depth+1 );
  if( !recurse ){ //If no input node is found, just return this one, its the most valid.
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    if( depth == 0){
      ret["realNode"] = orig_source;
      ret["realPort"] = srcNodeInfo.port;
      ret["realLink"] = srcNodeInfo.link;
    }
    
    return { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
  }
  
  if( depth == 0){
    recurse["realNode"] = orig_source;
    recurse["realPort"] = srcNodeInfo.port;
    recurse["realLink"] = srcNodeInfo.link;
  }
  
  //Pass what was found up the chain.
  return recurse;
}


/**
 * Validates the details of a given connection. Used internally when details change.
 * @return {bool}      Whether the connection is a valid connection that exists currently in the node system.
 */
$.oNodeLink.prototype.validate = function ( ) {
    //Initialize the connection and get the information.
    //First check to see if the inport is valid.
    
    this._outNode = false;
    this._outPort = 0;
    this._outLink = 0; 

    this._realOutNode = false;
    this._realOutPort = 0;
    this._realOutLink = 0;
        
    var res_node = this.findInputNode( this._inNode, this._inPort, 0 );
    if( !res_node ){
      return;
    }
    
    this._outNode = res_node.node;
    this._outPort = res_node.port;
    this._outLink = res_node.link; 

    this._realOutNode = res_node.realNode;
    this._realOutPort = res_node.realPort;
    this._realOutLink = res_node.realLink;
    this.exists = true;
}


/**
 * Changes both the in-node and in-port at once.
 * @param   {oNode}                   onode                   The node to link on the input.
 * @param   {int}                     port                    The port to link on the input.
 */
$.oNodeLink.prototype.linkIn = function( onode, port ) {
  
}


/**
 * Changes both the out-node and out-port at once.
 * @param   {oNode}                   onode                   The node to link on the output.
 * @param   {int}                     port                    The port to link on the output.
 */
$.oNodeLink.prototype.linkOut = function( onode, port ) {
  
}



/**
 * Apply the links as needed after unfreezing the oNodeLink
 * @private
 */
$.oNodeLink.prototype.applyLinks = function ( ) {
  this._freeze = false;
}