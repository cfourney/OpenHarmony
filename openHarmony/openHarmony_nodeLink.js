//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, Chris Fourney...
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
 * @param   {int}                     outPort                   The outport of the outNode that is connecting the link.
 * @param   {oNode}                   inNode                    The destination oNode of the link.
 * @param   {int}                     inPort                    The inport of the inNode that is connecting the link.
 *                                                          
 * @property   {bool}                    autoDisconnect         Whether to auto-disconnect links if they already exist. 
 
 */
$.oNodeLink = function( outNode, outPort, inNode, inPort, outlink ){

    //Public properties.
    this.autoDisconnect = true;
    this.path           = false;

    //Private properties.
    this._outNode = outNode;
    this._outPort = outPort; //outPort ? outPort : 0;
    this._outLink = outlink ? outlink : 0;
    
    this._realOutNode = outNode;
    this._realOutPort = 0;
    
    this._inNode  = inNode;
    this._inPort  = inPort; //inPort ? inPort : 0;
    
    this._freeze        = false;
    this._newInNode     = null;
    this._newInPort     = null;
    this._newOutNode    = null;
    this._newOutPort    = null;
    this._exists        = false;
    this._validated     = false;
    
    //Assume validation when providing all details. This is done to speed up subsequent lookups.
    if( outNode && 
        inNode  &&
        typeof outPort === 'number' &&
        typeof inPort  === 'number' &&
        typeof outlink === 'number' 
      ){
      
      //Skip validation in the event that we've beengiven all details -- this is to just speed up list generation.
      return;
    }
    
    this.validate();
}

/**
 * Validates the a node upwards until it hits the target. Given an inport argument to scan.
 * @static
 * @private
 * @param   {int}                   inport                   The inport to scan.
 * @param   {bool}                  outportProvided          Was an outport provided.
 * @return {bool}      Whether the connection is a valid connection that exists currently in the node system.
 */
$.oNodeLink.prototype.validateUpwards = function( inport, outportProvided ) {  
  //IN THE EVENT OUTNODE WASNT PROVIDED.
  this.path = this.findInputPath( this._inNode, inport, [] );
  if( !this.path || this.path.length == 0 ){
    return false;
  }

  var valid = false;
  for( var n=0;n<this.path.length;n++ ){
    if( this.path[n].node.path == this._outNode.path ){
      if( outportProvided ){
        if( this.path[n].port == this._outPort ){
          valid = this.path[n];
          break;
        }
      }else{
        valid = this.path[n];
        break;
      }
    }
  }
  
  if( !valid ){
    return false;
  }
  
  this._exists = true;
  this._outLink = valid.link; 
  this._realOutNode = this.path[ this.path.length-1 ].node;
  this._realOutPort = this.path[ this.path.length-1 ].port;
  this._realOutLink = this.path[ this.path.length-1 ].link;
  
  return true;
}


/**
 * Validates the details of a given connection. Used internally when details change.
 * @return {bool}      Whether the connection is a valid connection that exists currently in the node system.
 */
$.oNodeLink.prototype.validate = function ( ) {
    //Initialize the connection and get the information.
    //First check to see if the path is valid.
    this._exists    = false;
    this._validated = true;
    
    var inportProvided  = !(!this._inPort && this._inPort!== 0);
    var outportProvided = !(!this._outPort && this._outPort!== 0);
    
    if( !inportProvided && !outportProvided ){
      //inport is the safest to determine contextually.
      //If either has 1 input.
      if( this._inNode && this._inNode.inNodes.length == 1 ){
        this._inPort = 0;
        inportProvided = true;
      }
    }
    
    if( !this._outNode && !this._inNode ){
      //Unable to comply, need at least the nodes.
      this._exists = false;
      return false;
    }else if( !this._outNode ){
      //No outnode. Just look for one above it given the inport.
      //Lets derive up the chain.
      if( inportProvided ){
        this.validateUpwards( this._inPort );
        
        if( !this.path || this.path.length==0 ){
          return false;
        }
        
        this._realOutNode = this.path[ this.path.length-1 ].node;
        this._realOutPort = this.path[ this.path.length-1 ].port;
        this._realOutLink = this.path[ this.path.length-1 ].link;
        
        this._outNode = this.path[ 0 ].node;
        this._outPort = this.path[ 0 ].port;
        this._outLink = this.path[ 0 ].link;
        
        this._exists = true;
        return true;
      }
    }else if( !this._inNode ){
      //There can be multiple links. This is very difficult and only possible if theres only a singular path, we'll have to derive them all downwards.
      //This is just hopeful thinking that there is only one valid path.
      
      var huntInNode = function( currentNode, port ){
        try{
          var on = currentNode.outNodes[port];
          
          if( on.length != 1 ){
            return false;
          }
          
          var dstNodeInfo = node.dstNodeInfo( on.path, port, 0 );
          if( on[0].type == "MULTIPORT_OUT" ){
            return huntInNode( src_node.grp, dstNodeInfo.port );
          }else if( on[0].type == "GROUP" ){
            return huntInNode( src_node.multiportIn, dstNodeInfo.port );
          }else{
            var ret = { "node": on[0], "port":dstNodeInfo.port };
            return ret;
          }
        }catch(err){
          return false;
        }
      }
      
      //Find the in node recursively.
      var res = huntInNode();
      if( !res ){
        this._exists = false;
        return false;
      }
      
      if( inportProvided ){
        if( res.port != this._inPort ){
          this._exists = false;
          return false;
        }
      }
      
      this._inNode = res.node;
      this._inPort = res.port;
      inportProvided = true;
    }
    
    if( !this._outNode || !this._inNode ){
        this._exists = false;
        return false;
    }
    
    if( !inportProvided && !outportProvided ){
      //Still no ports provided.
      //Just simply assume the 0 port on the input.
      this._inPort = 0;
      inportProvided = true;
    }
    
    if( !inportProvided ){
      //Derive upwards for each input, if its valid, keep it.
      var inNodes = this._inNode.inNodes;
      for( var n=0;n<inNodes.length;n++ ){
        if( this.validateUpwards( n, outportProvided ) ){
          return true;
        }
      }
      return false;
    }
    
    return this.validateUpwards( this._inPort, outportProvided );
}

/**
 * Whether the nodeLink exists in the provided state.
 * @name $.oNodeLink#exists
 * @type {$.oNode}
 */
Object.defineProperty($.oNodeLink.prototype, 'exists', {
    get : function(){
      if( !this._validated ){
        this.validate();
      }
      return this._exists;
    }
});

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
      this._validated = false;
      this._newOutNode = val;
      
      if( this.freeze ){
        return;
      }
      
      this.apply();
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
      this._validated = false;
      this._newInNode = val;
      
      if( this.freeze ){
        return;
      }
      
      this.apply();
      
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
      this._validated  = false;
      this._newOutPort = val;
      
      if( this.freeze ){
        return;
      }
      
      this.apply();
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
      this._validated = false;
      this._newInPort = val;
      
      if( this.freeze ){
        return;
      }
      
      this.apply();
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
        this.apply();
      }
    }
});


/**
 * Dereferences up a node's chain, in order to find the exact node its actually attached to.
 * @param   {oNode}                   onode                   The node to dereference the groups for.
 * @param   {int}                     port                    The port to dereference.
 * @param   {object[]}                path                    The array path to pass along recursively.<br>[ { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link } ]
 * @private 
 * @return {object}                   Object in form { "node":oNode, "port":int, "link": int }
 */
$.oNodeLink.prototype.findInputPath = function( onode, port, path ) {
  var srcNodeInfo = node.srcNodeInfo( onode.path, port );
  if( !srcNodeInfo ){
    return path;
  }
  
  var src_node = this.$.scene.getNodeByPath( srcNodeInfo.node );
  if( !src_node ){
    return path;
  }
  
  if( src_node.type == "MULTIPORT_IN" ){
    //Continue to dereference until we find something other than a group/multiport in.
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    path.push( ret );
    
    var src_node = src_node.group;
    
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    path.push( ret );
  }else if( src_node.type == "GROUP" ){
    //Continue to dereference until we find something other than a group/multiport out.
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    path.push( ret );
    
    var src_node =  src_node.multiportOut;
    
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    path.push( ret );
  }else{
    var ret = { "node": src_node, "port":srcNodeInfo.port, "link":srcNodeInfo.link };
    path.push( ret );
    return path;
  }
  
  return this.findInputPath( src_node, srcNodeInfo.port, path );
}


/**
 * Changes both the in-node and in-port at once.
 * @param   {oNode}                   onode                   The node to link on the input.
 * @param   {int}                     port                    The port to link on the input.
 */
$.oNodeLink.prototype.linkIn = function( onode, port ) {
  this._validated = false;
  var freeze_val = this.freeze;
  this.freeze = true;
  
  this.inNode = onode;
  this.inPort = port;
  
  this.freeze = freeze_val;  
}


/**
 * Changes both the out-node and out-port at once.
 * @param   {oNode}                   onode                   The node to link on the output.
 * @param   {int}                     port                    The port to link on the output.
 */
$.oNodeLink.prototype.linkOut = function( onode, port ) {
  this._validated = false;
  
  var freeze_val = this.freeze;
  this.freeze = true;
  
  this.outNode = onode;
  this.outPort = port;
  
  this.freeze = freeze_val;  
}


/**
 * Insert a node in the middle of the link chain.
 * @param   {oNode}                   onode                   The node to link on the output.
 * @param   {int}                     inPort                  The port to link on the output.
 * @param   {int}                     outPort                 The port to link on the output.
 */
$.oNodeLink.prototype.insertNode = function( onode, inPort, outPort ) {
  //-----
  
}

/**
 * Apply the links as needed after unfreezing the oNodeLink
 * @param   {bool}                   force                   Forcefully reconnect/disconnect the note given the current settings of this nodelink.
 */
$.oNodeLink.prototype.apply = function( force ) {
  this._freeze = false;
  this._validated = false;
  
  var disconnect_in = false;
  var disconnect_out = false;
  var inports_removed  = {};
  var outports_removed = {};
  
  if( force || !this._exists ){    //Apply this.
    this._newInNode     = this._inNode;
    this._newInPort     = this._inPort;
    this._newOutNode    = this._outNode;
    this._newOutPort    = this._outPort;
    var force = true;
    
    disconnect_in = true;
    disconnect_out = true;
  }else{
    //Force a reconnect -- track content as needed.
    //Check and validate in ports.
    var target_port = this._inPort;
    if( this._newInPort !== null ){
      if( this._newInPort != this._inPort ){
        target_port = this._newInPort;
        disconnect_in = true;
      }
    }
    
    var old_inPortCount = false;    //Used to track if the inport count has changed upon its removal.
    if( this._newInNode !== null ){
      if( this._newInNode ){
        if( !this._inNode || ( this._inNode.path != this._newInNode.path ) ){
          disconnect_in = true;
        }
      }else if( this._inNode ){
        disconnect_in = true;
      }
    }
    
    //Check and validate out ports.
    if( this._newOutPort !== null ){
      if( ( this._newOutPort !== this._outPort ) ){
        disconnect_out = true;
      }
    }
    
    if( this._newOutNode !== null ){
      if( this._newOutNode ){
        if( !this._outNode || ( this._outNode.path != this._newOutNode.path ) ){
          disconnect_out = true;
        }
      }else if( this._outNode ){
        disconnect_out = true;
      }
    }
  }
  
  if( !disconnect_in && !disconnect_out ){
    //Nothing happened.
    System.println( "NOTHING TO DO" );
    return;
  }
  
  if( this._newInNode ){
    if( this._newInNode.inNodes.length > target_port ){
      if( this._newInNode.inNodes[ target_port ] ){
        //-- Theres already a connection here-- lets remove it.
        if( this.autoDisconnect ){
          this._newInNode.unlinkInPort( target_port ); 
          inports_removed[ this._newInNode.path ] = target_port;
        }else{
          throw "Unable to link "+this._outNode+" to "+this._newInNode+", port "+target_port+" is already occupied.";
        }
      }
    }
  }
  
  //We'll work with the new values -- pretend any new connection is a new one.
  this._newInNode  = this._newInNode ? this._newInNode : this._inNode;
  this._newOutNode = this._newOutNode ? this._newOutNode : this._outNode;
  this._newOutPort = ( this._newOutPort === null ) ? this._outPort : this._newOutPort;
  this._newInPort  = ( this._newInPort === null ) ? this._inPort : this._newInPort;
  
  if( !this._newInNode || !this._newOutNode ){
    //Nothing to attach.
    this._inNode  = this._newInNode;
    this._inPort  = this._newInPort;
    this._outNode = this._newOutNode;
    this._outPort = this._newOutPort;
    
    return;
  }
  
  if( !this._newInNode.exists || !this._newOutNode.exists ){
    this._inNode  = this._newInNode;
    this._inPort  = this._newInPort;
    this._outNode = this._newOutNode;
    this._outPort = this._newOutPort;
    
    return;
  }
  
  //Kill and rebuild the current connection - but first, calculate existing port indices so they can be reconnected contextually.
  var newInPortCount   = this._newInNode ? this._newInNode.inNodes.length : 0;
  var newOutPortCount  = this._newOutNode ? this._newOutNode.outNodes.length : 0;
  
  //Unlink it anyway! Dont worry, we'll reattach that after.
  if( this._inNode ){
    this._inNode.unlinkInPort( this._inPort );
    if( this._outNode ){
      outports_removed[ this._outNode.path ] = this._outPort;
    }
    inports_removed[ this._inNode.path ] = this._inPort;
  }
  
  //Cant connect without a valid port.
  if( ( this._newOutPort === null ) || ( this._newOutPort === false ) ){
    this._inNode  = this._newInNode;
    this._inPort  = this._newInPort;
    this._outNode = this._newOutNode;
    this._outPort = this._newOutPort;
    
    return;
  }
  if( ( this._newInPort === null ) || ( this._newInPort === false ) ){
    this._inNode  = this._newInNode;
    this._inPort  = this._newInPort;
    this._outNode = this._newOutNode;
    this._outPort = this._newOutPort;
    
    return;
  }
  
  //Check to see if any of the port values have changed.
  var newInPortCount_result   = this._newInNode ? this._newInNode.inNodes.length : 0;
  var newOutPortCount_result  = this._newOutNode ? this._newOutNode.outNodes.length : 0;
    
  if( newOutPortCount_result != newOutPortCount ){
    //Outport might have changed. React appropriately.
    if( this._newOutNode.path in outports_removed ){
      if( this._newOutPort > outports_removed[ this._newOutNode.path ] ){
        this._newOutPort-=1;
      }
    }
  }
  
  if( newInPortCount_result != newInPortCount ){
    //Outport might have changed. React appropriately.
    if( this._newInNode.path in inports_removed ){
      if( this._newInPort > inports_removed[ this._newInNode.path ] ){
        this._newInPort-=1;
      }
    }
  }
  
  System.println( newInPortCount_result + " " + newOutPortCount + " GHI " + this._newInPort );
  
  var new_inGroup  = this._newInNode.group;
  var new_outGroup = this._newOutNode.group;
  if( new_inGroup.path == new_outGroup.path ){
    //Simple direct connection within the same group.
    this._newOutNode.linkOutNode( this._newInNode, this._newInPort, this._newOutPort );
    
  }else{
    //Look for an access route.
    
    var common_path = [];
    var split_in  = new_inGroup.path.split( "/" );
    var split_out = new_outGroup.path.split( "/" );
    
    //Find the common top path.
    for( var n=0;n<Math.min(split_in.length, split_out.length);n++ ){
      if( split_in[n] == split_out[n] ){
        common_path.push( split_out[n] );
      }else{
        break;
      }
    }
    
    //The common path is the place we need to attach; find a common link.
    //Work forward from in, backwards from out.
    
    var common_path = common_path.join( "/" );
    
    //Outward Path finding.
    var find_outward = function( from_node, port, targ, path ){
      if( from_node.group.path != targ ){
        //Attach to a group one higher.
        //multiportIn
        var grp   = from_node.group;
        var mport = grp.multiportOut;
        var followPort = mport.inNodes.length;
        //Find if the outnodes of from, at the given outNode, connects to the multiPortOut already.
        try{
          var found_existing = false;
          if( from_node.outNodes.length>port ){
            for( var n=0;n<from_node.outNodes[port].length;n++ ){
              if( from_node.outNodes[port][n].path == mport.path ){
                //Dont add it as a new connection, add it as an existing one.
                var info = node.dstNodeInfo( from_node.path, port, n );
                if( info ){
                  found_existing = true;
                  followPort = info.port;
                  break;
                }
              }
            }
          }
          
          path.push( { "end" : false, "exists":found_existing, "from":from_node, "fromport":port, "to":mport, "toport":followPort  } );
          path = find_outward( grp, followPort, targ, path );
        }catch(err){
          System.println( "ERR: " + err.message + "  " + err.lineNumber + " : " + err.fileName );
        }
        
      }else{
        path.push( { "end": true, "exists":true, "from":from_node, "fromport":port, "to":false, "toport":false  } );
      }
      return path;
    }
    
    var outward_path = find_outward( this._newOutNode, this._newOutPort, common_path, [] );
    var common_from = outward_path[outward_path.length-1].from;
    var common_port = outward_path[outward_path.length-1].fromport;
    
    var targ_path       = this._newInNode.path;
        targ_path_split = targ_path.split( "/" );
    
    // Find forward from the common junction.
    var find_inward = function( from_node, from_port, targ_node, targ_port, path, createPort ){

      var length_parent = from_node.group.path.split("/").length;
      var targ_grp = targ_path_split.slice( 0, length_parent+1 ).join("/");
      
      if( targ_grp == targ_path ){
        //Should it create the port?
        
        path.push( { "end": true, "exists":false, "from":from_node, "fromport":from_port, "to":targ_node, "toport":targ_port, "createPort":createPort } );
        return path;
      }
      
      //Find a common link from this target to the next.
      var grp                = this.$.scene.getNodeByPath( targ_grp );
      var mport              = grp.multiportIn;
      var followPort         = mport.outNodes.length;
      
      //Find if the outnodes of from, at the given outNode, connects to the multiPortOut already.
      try{
        var found_existing = false;
        var createPortForward = true;
        if( from_node.outNodes.length>from_port ){
          var ops = from_node.outNodes[from_port];
          for( var n=0;n<ops.length;n++ ){
            if( ops[n].path == targ_grp ){
              //Dont add it as a new connection, add it as an existing one.
              var info = node.dstNodeInfo( from_node.path, from_port, n );
              if( info ){
                found_existing = true;
                followPort = info.port;
                createPortForward = false;
                break;
              }
            }
          }
          if(!found_existing){
            var grprIns = grp.inNodes;
            var mpOuts  = mport.outNodes;
            
            //It can either be acceptable, if the connection is not connected at grpin and not connected at mpout,
            //or if grpin is not connected, and mpout is connected where we want it to be.
            var targ_internal = targ_path_split.slice( 0, length_parent+2 ).join("/");
            for( var n=0;n<grprIns.length;n++ ){
              if( !grprIns[n] ){
                if( mpOuts[n].length == 0 ){
                  //Its not being used.
                  followPort = n;
                  createPortForward = false;
                  
                  break;
                }else if( mpOuts[n].length == 1 ){
                  //Its being used, check if its just passing through to another group.
                  if( mpOuts[n][0].path == targ_internal ){
                    followPort = n;
                    createPortForward = false;
                    break;
                  }
                }
              }
            }
          }
        }
        
        path.push( { "end" : false, "exists":found_existing, "from":from_node, "fromport":from_port, "to":grp, "toport":followPort, "createPort":createPort } );
        path = find_inward( mport, followPort, targ_node, targ_port, path, createPortForward );
      }catch(err){
        System.println( "ERR: " + err.message + "  " + err.lineNumber + " : " + err.fileName );
      }
      
      return path;
    }
    
    var inward_path = find_inward( common_from, common_port, this._newInNode, this._newInPort, [], true );
    
    var cleanPath = [];
    for( var n=0;n<outward_path.length;n++ ){
      var t_path = outward_path[n];
      if( !t_path.exists && t_path.to ){
        t_path.from.linkOutNode( t_path.to, t_path.fromport, t_path.toport, true );
        // System.println( "RESULT OUT: " + t_path.from + " : " + t_path.fromport + " -- " + t_path.to + " : " + t_path.toport );
      }
    }
    
    for( var n=inward_path.length-1;n>=0;n-- ){
      var t_path = inward_path[n];
      if( !t_path.exists ){
        t_path.from.linkOutNode( t_path.to, t_path.fromport, t_path.toport, t_path.createPort );
        // System.println( "RESULT IN: " + t_path.from + " : " + t_path.fromport + " -- " + t_path.to + " : " + t_path.toport + "  " + t_path.createPort );
      }
    }
  }
  
  this._inNode  = this._newInNode;
  this._inPort  = this._newInPort;
  this._outNode = this._newOutNode;
  this._outPort = this._newOutPort;
  
  this._newInNode     = null;
  this._newInPort     = null;
  this._newOutNode    = null;
  this._newOutPort    = null;

  if( !this.validate() ){
    throw ReferenceError( "Failed to connect the targets appropriately." );
  }
}