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
//          oScene class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
/**
 * oScene Class
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
 

//TODO: Metadata, settings, aspect, camera peg, view.
/**
 * $.scene [CONSTRUCTOR]
 * @constructor
 * @param {string} dom     Access to the direct dom object.
 *
 * Summary: The constructor for the scene object, new oScene($) to create a scene with DOM access.
 */
function oScene( dom ){
    // oScene.nodes property is a class property shared by all instances, so it can be passed by reference and always contain all nodes in the scene
 
    //var _topNode = new oNode("Top");
    //this.__proto__.nodes = _topNode.subNodes(true);
  
  this.$     = dom;
  this._type = "scene";
}


//-------------------------------------------------------------------------------------
//--- oScene Objects Properties
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
/**
 * nodes
 *
 * Summary: Contains the list of nodes present in the scene.
 * @return: {[oNode]} Array oScene.nodes.
 */
Object.defineProperty(oScene.prototype, 'nodes', {
    get : function(){
        var _topNode = this.getNodeByPath( "Top", this );
        return _topNode.subNodes( true );
    }
});



/**
 * columns
 *
 * Summary: Contains the list of columns present in the scene.
 * @return: {[oColumn]} Array oScene.columns.
 */
Object.defineProperty(oScene.prototype, 'columns', {
    get : function(){
        var _columns = [];
        for (var i=0; i<columns.numberOf(); i++){
            _columns.push( new oColumn( this, column.getName(i)) );
        }
        return _columns;
    }
});
 
 
/**
 * palettes
 *
 * Summary: Contains the list of scene palettes present in the scene.
 * @return: {[oPalette]} Array oScene.palettes.
 */
Object.defineProperty(oScene.prototype, 'palettes', {
    get : function(){
        var _paletteList = PaletteObjectManager.getScenePaletteList();
        var _palettes = [];
        for (var i=0; i<_paletteList.numPalettes; i++){
            _palettes.push( new oPalette( _paletteList.getPaletteByIndex(i), this, _paletteList ) );
        }
        return _palettes;
    }
});


/**
 * length
 *
 * Summary: The length of the scene.
 * @return: {int} The length of the scene.
 */
Object.defineProperty(oScene.prototype, 'length', {
    get : function(){
        return frame.numberOf()
    },
   
    set : function (newLength){
        var _length = frame.numberOf();
        var _toAdd = newLength-_length;
        if (_toAdd>0){
            frame.insert(_length-1, _toAdd)
        }else{
            frame.remove(_length-1, _toAdd)
        }
    }
});

 
 
//-------------------------------------------------------------------------------------
//--- oScene Objects Methods
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------


/**
 * getNodeByPath
 *
 * Summary: Gets a node by the path.
 * @param   {string}   fullPath         The path of the node in question.
 *  
 * @return: {oNode}                     The node found given the query.
 */
oScene.prototype.getNodeByPath = function(fullPath){
    if (node.type(fullPath) == "") return null; // TODO: remove this if we implement a .exists property for oNode
    if (node.type(fullPath) == "READ") return new oDrawingNode( fullPath, this );
    if (node.type(fullPath) == "PEG") return new oPegNode( fullPath, this );
    if (node.type(fullPath) == "GROUP") return new oGroupNode( fullPath, this );
    return new oNode( fullPath, this );
}

/**
 * $node
 *
 * Summary: Gets a node by the path.
 * @param   {string}   fullPath         The path of the node in question.
 *  
 * @return: {oNode}                     The node found given the query.
 */
oScene.prototype.$node = function(fullPath){
    return this.getNodeByPath(fullPath);
}


/**
 * getSelectedNodes
 *
 * Summary: Gets a node by the path.
 * @param   {bool}   recurse            Whether to recurse into groups.
 *  
 * @return: {[oNode]}                   The selected nodes.
 */
oScene.prototype.getSelectedNodes = function( recurse, sort_result ){
    if (typeof recurse === 'undefined') var recurse = false;
    if (typeof sort_result    === 'undefined') var sort_result = true;     //Avoid sorting, save time, if unnecessary and used internally.
    
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
    if( sort_result ){
      var _timeline = this.getTimeline();     
      _selectedNodes = _selectedNodes.sort(function(a, b){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})
    }
    
    return _selectedNodes;
}


/**
 * nodeSearch
 *
 * Summary: Searches for a node based on the query.
 * @param   {string}   query            The query for finding the node[s].
 *  
 * @return: {[oNode]}                   The node[s] found given the query.
 */
oScene.prototype.nodeSearch = function( query, sort_result ){
  if (typeof sort_result    === 'undefined') var sort_result = true;     //Avoid sorting, save time, if unnecessary and used internally.
  
  //-----------------------------------
  //Breakdown with regexp as needed, find the query details.
  //-----------------------------------
  
  // NAME, NODE, WILDCARDS, ATTRIBUTE VALUE MATCHING, SELECTION/OPTIONS, COLOURS
  
  //----------------------------------------------
  // -- PATH/WILDCARD#TYPE[ATTRIBUTE:VALUE,ATTRIBUTE:VALUE][OPTION:VALUE,OPTION:VALUE]
  // ^(.*?)(\#.*?)?(\[.*\])?(\(.*\))?$
  
  //ALLOW USAGE OF AN INPUT LIST, LIST OF NAMES, OR OBJECTS,
  
  //--------------------------------------------------
  //-- EASY RETURNS FOR FAST OVERLOADS.
  
  //* -- OVERRIDE FOR ALL NODES
  if( query == "*" ){
    return this.nodes;
    
  //(SELECTED) SELECTED -- OVERRIDE FOR ALL SELECTED NODES
  }else if( query == "(SELECTED)" || query == "SELECTED" ){
  
    return this.getSelectedNodes( true, sort_result );
  
  //(NOT SELECTED) !SELECTED NOT SELECTED -- OVERRIDE FOR ALL SELECTED NODES
  
  }else if( query == "(NOT SELECTED)" || 
            query == "NOT SELECTED"   ||
            query == "(! SELECTED)"   || 
            query == "! SELECTED"     ||
            query == "(UNSELECTED)"   || 
            query == "UNSELECTED"
          ){
  
    var nodes_returned = [];
    
    var sel_list = {};
    for( var p=0;p<selection.numberOfNodesSelected();p++ ){
      sel_list[ selection.selectedNode(p) ] = true;
    }
           
    var all_nodes = this.nodes;
    for( var x=0;x<all_nodes.length;x++ ){
      if( !sel_list[ all_nodes[x].fullPath ] ){
        var node_ret = this.getNodeByPath( all_nodes[x].fullPath );
        if( node_ret && node_ret.exists ){
          nodes_returned.push( node_ret );
        }
      }
    }

    if( sort_result ){
      var _timeline = this.getTimeline();     
      nodes_returned = nodes_returned.sort(function(a, b){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})
    }    
    return nodes_returned;
  }
  
  
  //FULL QUERIES.
  var regexp = /^(.*?)(\#.*?)?(\[.*\])?(\(.*\))?$/;
  var query_match = query.match( regexp );

  this.$.debug( "QUERYING: " + query, this.$.DEBUG_LEVEL.LOG );
  this.$.debug( "QUERYING: " + query_match.length, this.$.DEBUG_LEVEL.LOG );
  
  var nodes_returned = [];

  if( query_match && query_match.length > 1 && query_match[1] && query_match[1].length > 0 ){
    //CONSIDER A LIST, COMMA SEPARATION, AND ESCAPED COMMAS.
    var query_list = [];
    var last_str   = '';
    var split_list = query_match[1].split( "," );
    
    for( var n=0; n<split_list.length; n++ ){
      var split_val = split_list[n];
      if( split_val.slice( split_val.length-1, split_val.length ) == "\\" ){
        last_str += split_val + ",";
        
      }else{
        query_list.push( last_str + split_val );
        last_str = "";
      }
    }
    
    if( last_str.length>0 ){
      query_list.push( last_str );
    }
    
    this.$.debug( "GETTING NODE LIST FROM QUERY", this.$.DEBUG_LEVEL.LOG );
    //NOW DEAL WITH WILDCARDS
    
    var added_nodes = {}; //Add the full path to a list when adding/querying existing. Prevent duplicate attempts.
    var all_nodes = false;
    for( var x=0; x<query_list.length; x++ ){
      if( (query_list[x].indexOf("*")>=0) || (query_list[x].indexOf("?")>=0) ){
        //THERE ARE WILDCARDS.
        this.$.debug( "WILDCARD NODE QUERY: "+query_list[x], this.$.DEBUG_LEVEL.LOG );
        //Make a wildcard search for the nodes.
        
        if( all_nodes === false ){
          all_nodes = this.nodes;
        }
        
        //Run the Wildcard regexp against the available nodes.
        var regexp = query_list[x];
            regexp = regexp.split( "?" ).join( "." );
            regexp = regexp.split( "*" ).join( ".*?" );
            regexp = '^'+regexp+'$';
            
        this.$.debug( "WILDCARD QUERY REGEXP: "+regexp, this.$.DEBUG_LEVEL.LOG );
            
        var regexp_filter = RegExp( regexp, 'gi' );
        for( var n=0;n<all_nodes.length;n++ ){
          if( !added_nodes[all_nodes[n].fullPath] ){
            this.$.debug( "WILDCARD NODE TEST: "+all_nodes[n].fullPath, this.$.DEBUG_LEVEL.LOG );
            if( regexp_filter.test( all_nodes[n].fullPath ) ){
              this.$.debug( "WILDCARD NODE TESTED SUCCESS: "+all_nodes[n].fullPath, this.$.DEBUG_LEVEL.LOG );
              
              var node_ret = all_nodes[n]; //this.getNodeByPath( all_nodes[n].fullPath ); //new oNode( this.$, all_nodes[n].fullPath );
              if( node_ret && node_ret.exists ){
                this.$.debug( "WILDCARD NODE MATCH: "+all_nodes[n].fullPath+"\n", this.$.DEBUG_LEVEL.LOG );
                nodes_returned.push( node_ret );
              }
              added_nodes[ all_nodes[n].fullPath ] = true;
            }
          }
        }
  
      }else if( query_list[x].length >=3 && query_list[x]=="re:" ){
        //THERE ARE WILDCARDS.
        this.$.debug( "REGEXP NODE QUERY: "+query_list[x], this.$.DEBUG_LEVEL.LOG );
        //Make a wildcard search for the nodes.
        
        if( all_nodes === false ){
          all_nodes = this.nodes;
        }
        
        //Run the Wildcard regexp against the available nodes.
        var regexp = query_list[x];   
        this.$.debug( "REGEXP QUERY REGEXP: "+regexp, this.$.DEBUG_LEVEL.LOG );
            
        var regexp_filter = RegExp( regexp, 'gi' );
        for( var n=0;n<all_nodes.length;n++ ){
          if( !added_nodes[all_nodes[n].fullPath] ){
            this.$.debug( "REGEXP NODE TEST: "+all_nodes[n].fullPath, this.$.DEBUG_LEVEL.LOG );
            if( regexp_filter.test( all_nodes[n].fullPath ) ){
              this.$.debug( "REGEXP NODE TESTED SUCCESS: "+all_nodes[n].fullPath, this.$.DEBUG_LEVEL.LOG );
              
              var node_ret = all_nodes[n]; //new oNode( this.$, all_nodes[n].fullPath );
              if( node_ret && node_ret.exists ){
                this.$.debug( "REGEXP NODE MATCH: "+all_nodes[n].fullPath+"\n", this.$.DEBUG_LEVEL.LOG );
                nodes_returned.push( node_ret );
              }
              added_nodes[ all_nodes[n].fullPath ] = true;
            }
          }
        }
      }else{
        //ITS JUST THE EXACT NODE.
        this.$.debug( "EXACT NODE QUERY: "+query_list[x], this.$.DEBUG_LEVEL.LOG );
        
        var node_ret = this.getNodeByPath( query_list[x] ); //new oNode( this.$, query_list[x] );
        if( !added_nodes[ query_list[x] ] ){
          if( node_ret && node_ret.exists ){
            this.$.debug( "EXACT NODE MATCH: "+query_list[x]+"\n", this.$.DEBUG_LEVEL.LOG );
            nodes_returned.push( node_ret );
          }
          added_nodes[ query_list[x] ] = true;
        }
      }
    }
  }else{
    nodes_returned = this.nodes;
  }
  
  this.$.debug( "FILTER CODE", this.$.DEBUG_LEVEL.LOG );
  
  //-----------------------------------------------------
  //IT HAS SOME SORT OF FILTER ASSOCIATED WITH THE QUERY.
  if( query_match.length > 2 ){
    var filtered_nodes = nodes_returned;
    for( var n=2;n<query_match.length;n++ ){
      //RUN THE FITERS.
      
      if( !query_match[n] ){
        continue;
      }
      
      if( query_match[n].slice(0, 1) == "#" ){         //TYPE
        this.$.debug( "TYPE FILTER INIT: " + query_match[n], this.$.DEBUG_LEVEL.LOG );
        
        var res_nodes = [];
        var match_val = query_match[n].slice(1,query_match[n].length).toUpperCase();
        for( var x=0;x<filtered_nodes.length;x++ ){
          if( filtered_nodes[x].type == match_val ){
            res_nodes.push( filtered_nodes[x] );
          }
        }
        
        filtered_nodes = res_nodes;
      }else if( query_match[n].slice(0, 1) == "[" ){   //ATTRIBUTES
        var split_attrs = query_match[n].toUpperCase().slice( 1, query_match[n].length-1 ).split(",");
        for( var t=0;t<split_attrs.length;t++ ){
          var res_nodes = [];
          
          var split_attrs = split_attrs[t].split( ":" );
          if( split_attrs.length==1 ){
            //It simply just must have this attribute.
            //res_nodes.push( filtered_nodes[0] );
            
          }else{
            //You must compare values of the attribute -- currently only supports string, but should also use float/int comparisons and logic.
            
            
          }
          
          //filtered_nodes = res_nodes;
        }
      }else if( query_match[n].slice(0, 1) == "(" ){   //OPTIONS
        //SELECTED, ECT.
        
        var split_options = query_match[n].toUpperCase().slice( 1, query_match[n].length-1 ).split(",");

        for( var t=0;t<split_options.length;t++ ){
          var res_nodes = [];
          
          //THE OPTION FOR SELECTED NODES ONLY, COMPARE IT AGAINST THE LIST.
          if( split_options[t] == "SELECTED" ){
            this.$.debug( "TYPE FILTER SELECTION ONLY", this.$.DEBUG_LEVEL.LOG );
            
            //GET THE SELECTION LIST.
            var sel_list = {};
            for( var p=0;p<selection.numberOfNodesSelected();p++ ){
              sel_list[ selection.selectedNode(p) ] = true;
              this.$.debug( selection.selectedNode(p), this.$.DEBUG_LEVEL.LOG );
            }
            
            for( var x=0;x<filtered_nodes.length;x++ ){
              if( sel_list[ filtered_nodes[x].fullPath ] ){
                res_nodes.push( filtered_nodes[x] );
              }
            }
          }
          
          //--- NOTSELECTED DESELECTED !SELECTED  NOT SELECTED
          //THE OPTION FOR SELECTED NODES ONLY, COMPARE IT AGAINST THE LIST.
          else if( split_options[t] == "NOT SELECTED" || split_options[t] == "NOTSELECTED" || split_options[t] == "DESELECTED" || split_options[t] == "!SELECTED" ){
            this.$.debug( "TYPE FILTER SELECTION ONLY", this.$.DEBUG_LEVEL.LOG );
            
            //GET THE SELECTION LIST.
            var sel_list = {};
            for( var p=0;p<selection.numberOfNodesSelected();p++ ){
              sel_list[ selection.selectedNode(p) ] = true;
            }
            
            for( var x=0;x<filtered_nodes.length;x++ ){
              if( !sel_list[ filtered_nodes[x].fullPath ] ){
                res_nodes.push( filtered_nodes[x] );
              }
            }
          }
          
          filtered_nodes = res_nodes;
        }
      }
    }
    
    nodes_returned = filtered_nodes;
  }
  
  if( sort_result ){
    var _timeline = this.getTimeline();     
    nodes_returned = nodes_returned.sort(function(a, b){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})
  }   
  return nodes_returned;
}


/**
 * addNode
 *
 * Summary: Adds a node to the scene.
 * @param   {string}   type            The type-name of the node to add.
 * @param   {string}   name            The name of the newly created node.
 * @param   {string}   group           The groupname to add the node.
 * @param   {oPoint}   nodePosition    The position for the node to be placed in the network.
 * @param   {object}   options         Options -- currently only supports 'adoptExisting', which accepts the existing node in the event one already exists.
 * 
 * @return: {oNode}    The created node, or bool as false.
 */
oScene.prototype.addNode = function( type, name, group, nodePosition, options ){
    // Defaults for optional parameters
    
    if (typeof group === 'undefined') var group = "Top"
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
 
 
    this.$.debug( "CREATING THE NODE: " + group + "/" + name, this.$.DEBUG_LEVEL.LOG );
    
    //Error Handling ahead of time.
    if( node.getName( group + "/" + name ) ){
      if( options && options.adoptExisting ){
        this.$.debug( "ADOPTED THE NODE: "     + group + "/" + name, this.$.DEBUG_LEVEL.LOG );
        return this.getNodeByPath( _nodePath );
      }else{
        this.$.debug( "NODE ALREADY EXISTED: " + group + "/" + name, this.$.DEBUG_LEVEL.WARNING );
        return false;
      }
    }
 
    var _nodePath = node.add( group, name, type, nodePosition.x, nodePosition.y, nodePosition.z );
    var _node = this.getNodeByPath( _nodePath );
 
    if( _node ){
      this.$.debug( "CREATED THE NODE: " + _node, this.$.DEBUG_LEVEL.LOG );
    }
 
    return _node;
}
 

 
 
 
 
 
/**
 * addColumn
 *
 * Summary: Adds a column to the scene.
 * @param   {string}   type                           The type of the column.
 * @param   {string}   name                           The name of the column.
 * @param   {oElementObject}   oElementObject         The elementObject to link, if a drawing, and wanting to share an element
 *  
 * @return: {oColumn}  The created column, or bool as false.
 */
 
oScene.prototype.addColumn = function( type, name, oElementObject ){
    // Defaults for optional parameters 
    if (typeof name === 'undefined') var name = column.generateAnonymousName();
   
    var _increment = 1;
    var _columnName = name;
   
    // increment name if a column with that name already exists
    while (column.type(_columnName) != ""){
        _columnName = name+"_"+_increment;
        _increment++;
    }
   
    this.$.debug( "CREATING THE COLUMN: " + name, this.$.DEBUG_LEVEL.LOG );
   
    column.add(_columnName, type);
               
    var _column = new oColumn( _columnName );
 
    if (type == "DRAWING" && typeof oElementObject !== 'undefined'){
        oElementObject.column = this;// TODO: fix: this doesn't seem to actually work for some reason?
        this.$.debug( "set element "+oElementObject.id+" to column "+_column.uniqueName, this.$.DEBUG_LEVEL.LOG );
        column.setElementIdOfDrawing(_column.uniqueName, oElementObject.id);
    }
 
    column.update();
    return _column;
}
 
 
/**
 * addElement
 *
 * Summary: Adds an element to the scene.
 * @param   {string}   name            The name of the 
 * @param   {string}   imageFormat            The object to log.
 * @param   {string}   fieldGuide         The debug level.
 * @param   {string}   scanType         The debug level. 
 *  
 * @return: {oColumn}  The created column, or bool as false.
 */
oScene.prototype.addElement = function(name, imageFormat, fieldGuide, scanType){
    // Defaults for optional parameters
    if (typeof scanType === 'undefined') var scanType = "COLOR";
    if (typeof fieldGuide === 'undefined') var fieldGuide = 12;
    if (typeof imageFormat === 'undefined') var imageFormat = "TVG";
 
    var _fileFormat = (imageFormat == "TVG")?"SCAN":imageFormat;
    var _vectorFormat = (imageFormat == "TVG")?imageFormat:"None";
 
    var _id = element.add(name, scanType, fieldGuide, _fileFormat, _vectorFormat);
    var _element = new oElement( _id )
 
    return _element;
}
 
 
/**
 * addDrawingNode
 *
 * Summary: Adds a drawing element to the scene.
 * @param   {string}   name            The name of the newly created node.
 * @param   {string}   group           The group in which the node is added.
 * @param   {oPoint}   nodePosition    The position for the node to be placed in the network.
 * @param   {object}   element         The element to attach to the column.
 * @param   {object}   drawingColumn   The column to attach to the drawing module.
 * @param   {object}   options         The creation options, nothing available at this point.
 
 * @return: {oNode}    The created node, or bool as false.
 */
 
oScene.prototype.addDrawingNode = function( name, group, nodePosition, oElementObject, drawingColumn, options ){
    // add drawing column and element if not passed as parameters
    if (typeof oElementObject === 'undefined') var oElementObject = this.addElement( name );
    if (typeof drawingColumn === 'undefined') var drawingColumn = this.addColumn( "DRAWING", name, oElementObject );
       
    // Defaults for optional parameters
    if (typeof group === 'undefined') var group = "Top"
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof name === 'undefined') var name = type[0]+type.slice(1).toLowerCase();
   
    var _node = this.addNode( "READ", name, group, nodePosition );
   
    // setup the node
    // setup animate mode/separate based on preferences?  
   
    _node.attributes.drawing.element.column = drawingColumn;
   
    return _node;
}

 
/**
 * addGroup
 *
 * Summary: Adds a drawing element to the scene.
 * @param   {string}   name                   The name of the newly created group.
 * @param   {string}   includeNodes           The nodes to add to the group.
 * @param   {oPoint}   addComposite           Whether to add a composite.
 * @param   {bool}     addPeg                 Whether to add a peg.
 * @param   {string}   group                  The group in which the node is added.
 * @param   {oPoint}   nodePosition           The position for the node to be placed in the network.
 
 * @return: {oGroup}   The created node, or bool as false.
 */
oScene.prototype.addGroup = function( name, includeNodes, addComposite, addPeg, group, nodePosition ){
    // Defaults for optional parameters
    if (typeof addPeg === 'undefined') var addPeg = false;
    if (typeof addComposite === 'undefined') var addComposite = false;
    if (typeof group === 'undefined') var group = "Top";
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof includeNodes === 'undefined') var includeNodes = [];
   
    var _group = this.addNode( "GROUP", name, group, nodePosition );
   
    var _MPI = _group.multiportIn
    var _MPO = _group.multiportOut
 
    if (addComposite){
        var _composite = this.addNode("COMPOSITE", name+"_Composite", _group.fullPath)
        _composite.composite_mode = "Pass Through" //
        _composite.linkOutNode(_MPO);
    }
    if (addPeg){
        var _peg = this.addNode("PEG", name+"-P", _group.fullPath)
        _peg.linkInNode(_MPI)
    }
   
    if (includeNodes.length > 0){
        var _timeline = this.getTimeline()
        includeNodes.sort(function(a, b){return a.timelineIndex(_timeline)-b.timelineIndex(_timeline)})
       
        for (var i in includeNodes){
            var _node = includeNodes[i];
            var _nodeName = _node.name;
            node.moveToGroup(_node.fullPath, _group.fullPath)
           
           // updating the fullPath of the oNode objects passed by reference
            _node.fullPath = _group.fullPath+'/'+_nodeName;          
           
            if (addPeg){
                _node.unlinkInNode(_MPI)
                _node.linkInNode(_peg)
            }
        }
       
        // TODO: restore links that existed outside of the group
    }
   
    return _group;
}


/**
 * getTimeline
 *
 * Summary: Adds a drawing element to the scene.
 * @param   {string}    display                The display node to build the timeline for.
 * @return: {oTimeline}    The timelne object given the display.
 */
oScene.prototype.getTimeline = function(display){
    if (typeof display === 'undefined') var display = '';
    return new oTimeline( display, this );
}


/**
 * getPaletteByName
 *
 * Summary: Provides a palette object based on name.
 * @param   {string}     name                The name of the palette to return, if available.
 * @return: {oPalette}   oPalette with provided name.
 */
oScene.prototype.getPaletteByName = function( name ){
    var _paletteList = PaletteObjectManager.getScenePaletteList();
    for (var i=0; i<_paletteList.numPalettes; i++){
        if (_paletteList.getPaletteByIndex(i).getName() == name)
        return new oPalette(_paletteList.getPaletteByIndex(i), this, _paletteList);
    }
    return null;
}
 
 
/**
 * getSelectedPalette
 *
 * Summary: Provides the selected palette.
 * @return: {oPalette}   oPalette with provided name.
 */
oScene.prototype.getSelectedPalette = function(){
    var _paletteList = PaletteManager.getScenePaletteList();
    var _id = PaletteManager.getCurrentPaletteId()
    var _palette = new oPalette(_paletteList.getPaletteById(_id), this, _paletteList);
    return _palette;
}

 
/**
 * importPalette
 *
 * Summary: Provides a palette object based on name.
 * @param   {string}       path                          The palette file to import.
 * @param   {string}       name                          The name for the palette.
 * @param   {string}       index                         Index at which to insert the palette.
 * @param   {string}       paletteStorage                Storage type: environment, job, scene, element, external.
 * @param   {oElement}     storeInElement                The name of the palette to return, if available.
 * 
 * @return: {oPalette}   oPalette with provided name.
 */
oScene.prototype.importPalette = function( path, name, index, paletteStorage, storeInElement ){
    if (typeof paletteStorage === 'undefined') var destination = "scene";
    if (typeof index === 'undefined') var index = 0;
   
    var _paletteFile = new oFile(path);
    if (typeof name === 'undefined') var name = _paletteFile.name;
    if (typeof storeInElement === 'undefined'){
        if (paletteStorage == "element") throw "Element parameter cannot be omitted if palette destination is Element"
        var _element = 1;
    }
   
    var _list = PaletteObjectManager.getScenePaletteList();
    var _destination = ""
   
    switch (paletteStorage) {
        case "environnement" :
            _destination = PaletteObjectManager.Constants.Location.ENVIRONMENT;
            break;
        case "job" :
            _destination = PaletteObjectManager.Constants.Location.JOB;
            break;
        case "scene" :
            _destination = PaletteObjectManager.Constants.Location.SCENE;
            break;
        case "element" :
            _destination = PaletteObjectManager.Constants.Location.ELEMENT;
            var _element = storeInElement.id;
            break;
        case "external" :
            _destination = PaletteObjectManager.Constants.Location.EXTERNAL;
            break;
        default :
            break;
    }
    
    //CF Note: To test, does this only accept a path to a file? If so, why are we passing a name? Not clear on this function and how we can best provide a 
    //path to a file, and rename it to the desired name as a result.
    
    var _newPalette = list.insertPaletteAtLocation( _destination, _element, name, index );
    return new oPalette(_newPalette);
}


/**
 * importPSD
 *
 * Summary: Imports a PSD to the node view.
 * @param   {string}       path                          The palette file to import.
 * @param   {string}       group                         The group to import the PSD into.
 * @param   {oPoint}       nodePosition                  The position for the node to be placed in the network.
 * @param   {bool}         separateLayers                Separate the layers of the PSD.
 * @param   {bool}         addPeg                        Whether to add a peg.
 * @param   {bool}         addComposite                  Whether to add a composite.
 * @param   {string}       alignment                     Alignment type.
 * 
 * @return: {[oNode]}     The nodes being created as part of the PSD import.
 */
oScene.prototype.importPSD = function(path, group, nodePosition, separateLayers, addPeg, addComposite, alignment){

    // CFNOTE: We should also consider importing the TGA directly as a 'drawing' for non-Harmony bitmap types, optional.

    if (typeof alignment === 'undefined') var alignment = "ASIS" // create an enum for alignments?
    if (typeof addComposite === 'undefined') var addComposite = true;
    if (typeof addPeg === 'undefined') var addPeg = true;
    if (typeof separateLayers === 'undefined') var separateLayers = true;
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0)
    if (typeof group === 'undefined') var group = "Top"
 
    var _psdFile = new oFile(path)
    var _elementName = _psdFile.name
 
    var _xSpacing = 45
    var _ySpacing = 30  
   
    var _element = this.addElement(_elementName, "PSD")
    var _column = this.addColumn(_elementName, "DRAWING", _element)
   
    // save scene otherwise PSD is copied correctly into the element
    // but the TGA for each layer are not generated
    // TODO: how to go around this to avoid saving?
    scene.saveAll();
    var _drawing = _element.addDrawing(1);
   
    var _nodes = []
   
    if (addPeg) var _peg = this.addNode("PEG", _elementName+"-P", group, nodePosition)
    if (addComposite) var _comp = this.addNode("COMPOSITE", _elementName+"-Composite", group, nodePosition)
   
    // Import the PSD in the element
    CELIO.pasteImageFile({ src : path, dst : { elementId : _element.id, exposure : _drawing.name}})
    var _layers = CELIO.getLayerInformation(path);
   
    // create the nodes for each layer
    if (separateLayers){
       
        var _x = nodePosition.x - _layers.length/2*_xSpacing
        var _y = nodePosition.y - _layers.length/2*_ySpacing
       
        // TODO: discover and generate the groups present in the PSD
       
        for (var i in _layers){
            // generate nodes and set them to show the element for each layer
            var _layer = _layers[i].layer;
            var _layerName = _layers[i].layerName.split(" ").join("_");
            var _nodePosition = new oPoint(_x+=_xSpacing, _y +=_ySpacing, 0);
           
            //TODO: set into right group according to PSD organisation
           
            var _group = group //"Top/"+_layers[i].layerPathComponents.join("/");
 
            var _node = this.addDrawingNode(_layerName, _group, _nodePosition, _element);
 
            _node.enabled = _layers[i].visible;
            _node.can_animate = false // use general pref?
            _node.apply_matte_to_color = "Straight"
            _node.alignment_rule = alignment;
           
            _node.attributes.drawing.element.setValue(_layer != ""?"1:"+_layer:1, 1);
            _node.attributes.drawing.element.column.extendExposures();
 
            if (addPeg) _node.linkInNode(_peg);
            if (addComposite) _node.linkOutNode(_comp);
 
            _nodes.push(_node);
        }
    }
   
    if (addPeg){
        _peg.centerAbove(_nodes, 0, -_ySpacing )
        _nodes.push(_peg)
    }
     
    if (addComposite){
        _comp.centerBelow(_nodes, 0, _ySpacing )
        _nodes.push(_comp)
    }
    // TODO how to display only one node with the whole file
   
    return _nodes
}
 
/**
 * importQT
 *
 * Summary: Imports a QT into the node view.
 * @param   {string}       path                          The palette file to import.
 * @param   {string}       group                         The group to import the PSD into.
 * @param   {oPoint}       nodePosition                  The position for the node to be placed in the network.
 * @param   {bool}         extendScene                   Whether to add a composite.
 * @param   {string}       alignment                     Alignment type.
 * 
 * @return: {oNode}        The imported Quicktime Node.
 */
oScene.prototype.importQT = function( path, group, nodePosition, extendScene, alignment ){
    if (typeof alignment === 'undefined') var alignment = "ASIS";
    if (typeof extendScene === 'undefined') var extendScene = true;
    if (typeof nodePosition === 'undefined') var nodePosition = new oPoint(0,0,0);
    if (typeof group === 'undefined') var group = "Top";
    // MessageLog.trace("importing QT file :"+path)
 
    var _QTFile = new oFile(path);
    var _elementName = _QTFile.name;
   
    var _element = this.addElement(_elementName, "PNG");
    var _qtNode = this.addDrawingNode(_elementName, group, nodePosition, _element);
    var _column = _qtNode.attributes.drawing.element.column;
    _element.column = _column;
   
    // setup the node
    _qtNode.can_animate = false;
    _qtNode.alignment_rule = alignment;
   
    //MessageLog.trace("node: "+_qtNode.name+" element: "+_element.name+" column: "+_column.uniqueName)
   
    var _tempFolder = scene.tempProjectPathRemapped () + "/movImport/" + _elementName
    var _audioPath = _tempFolder + "/" + _elementName + ".wav"
 
    // setup import
    MovieImport.setMovieFilename(_QTFile.path);
    MovieImport.setImageFolder(_tempFolder);
    MovieImport.setImagePrefix(_elementName);
    MovieImport.setAudioFile(_audioPath);
    MovieImport.doImport();
   
    if (extendScene && this.length < MovieImport.numberOfImages()) this.length = MovieImport.numberOfImages();
   
    // create expositions on the node
    for (var i = 1; i <= MovieImport.numberOfImages(); i++ ) {
        // move the frame into the drawing
        var _framePath = _tempFolder + '/'+_elementName+'-' + i + '.png';
        var _drawing = _element.addDrawing(i, i, _framePath)
    }
   
    // creating an audio column for the sound
    if ( MovieImport.isAudioFileCreated() ){
        var _soundName = _elementName + "_sound";
        var _soundColumn = this.addColumn("SOUND", _soundName);
        column.importSound( _soundColumn.name, 1, _audioPath);
    }
 
    return _qtNode;
}
 

/**
 * mergeNodes
 *
 * Summary: Merges Drawing nodes into a single node.
 * @param   {[oNode]}      nodes                         The Drawing nodes to merge.
 * @param   {string}       resultName                    The Node name for the resulting node of the merged content.
 * @param   {bool}         deleteMerged                  Whether the original nodes be deleted.
 * 
 * @return: {oNode}        The resulting drawing node from the merge.
 */
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
            if (_frameNumbers.indexOf(_timings[j].frameNumber) == -1) _keys.push(_timings[j])
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
            //if (nodes[j].attributes.drawing.element.frames[_frame].isBlank) continue;
           
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
   
    _mergedNode.attributes.drawing.element.column.extendExposures();
    _mergedNode.placeAtCenter(nodes)
    
    // connect to the same composite as the first node, at the same place
    // delete nodes that were merged if parameter is specified
    if (deleteMerged){
        for (var i in nodes){
            nodes[i].remove();
        }

    }
    return _mergedNode
}

