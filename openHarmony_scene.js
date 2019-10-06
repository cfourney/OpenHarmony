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
 * $.scene.nodes
 *
 * Summary: Contains the list of nodes present in the scene.
 * @return: {[oNode]} Array oScene.nodes.
 */
Object.defineProperty(oScene.prototype, 'nodes', {
    get : function(){
        var _topNode = new oNode( this.$, "Top" );
        return _topNode.subNodes(true);
    }
})



/**
 * $.scene.columns
 *
 * Summary: Contains the list of columns present in the scene.
 * @return: {[oColumn]} Array oScene.columns.
 */
Object.defineProperty(oScene.prototype, 'columns', {
    get : function(){
        var _columns = [];
        for (var i=0; i<columns.numberOf(); i++){
            _columns.push(new oColumn(column.getName(i)));
        }
        return _columns;
    }
})
 
 
/**
 * $.scene.palettes
 *
 * Summary: Contains the list of scene palettes present in the scene.
 * @return: {[oPalette]} Array oScene.palettes.
 */
Object.defineProperty(oScene.prototype, 'palettes', {
    get : function(){
        var _paletteList = PaletteManager.getScenePaletteList();
        var _palettes = [];
        for (var i=0; i<_paletteList.numPalettes(); i++){
            _palettes.push( new oPalette(_paletteList.getPaletteByIndex(i)));
        }
        return _palettes;
    }
});
 
 
//-------------------------------------------------------------------------------------
//--- oScene Objects Methods
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------


/**
 * $.scene.node
 *
 * Summary: Adds a column to the scene.
 * @param   {string}   query            The query for finding the node[s].
 *  
 * @return: {[oNode]}                   The node[s] found given the query.
 */
oScene.prototype.node = function( query ){
  
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
  
    var nodes_returned = [];
    
    for( var p=0;p<selection.numberOfNodesSelected();p++ ){
      var node_ret = new oNode( this.$, selection.selectedNode(p) );
      if( node_ret && node_ret.exists ){
        nodes_returned.push( node_ret );
      }
    }
    
    return nodes_returned;
  
  //(NOT SELECTED) !SELECTED NOT SELECTED -- OVERRIDE FOR ALL SELECTED NODES
  
  }else if( query == "(NOT SELECTED)" || 
            query == "NOT SELECTED"   ||
            query == "(! SELECTED)"   || 
            query == "! SELECTED"     ||
            query == "(UNSELECTED)"   || 
            query == "UNSELECTED"
          ){
  
    var nodes_returned = [];
    
    var sel_list = [];
    for( var p=0;p<selection.numberOfNodesSelected();p++ ){
      sel_list[ selection.selectedNode(p) ] = true;
    }
           
    var all_nodes = this.nodes;
    for( var x=0;x<all_nodes.length;x++ ){
      if( !sel_list[ all_nodes[x].fullPath ] ){
        var node_ret = new oNode( this.$, all_nodes[x].fullPath );;
        if( node_ret && node_ret.exists ){
          nodes_returned.push( node_ret );
        }
      }
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
              
              var node_ret = new oNode( this.$, all_nodes[n].fullPath );
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
              
              var node_ret = new oNode( this.$, all_nodes[n].fullPath );
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
        
        var node_ret = new oNode( this.$, query_list[x] );
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
  
  return nodes_returned;
}



//DEPRECATED -- $.scene.node now.
// oScene.prototype.getNodeByName = function(fullPath){
    // return (node.type(fullPath) != "")?new oNode(fullPath):null
// }
 
 
//DEPRECATED -- $.scene.node now.
// oScene.prototype.getSelectedNodes = function(recurse){
    // if (typeof recurse === 'undefined') var recurse = false;
 
    // var _selection = selection.selectedNodes();
    // var _selectedNodes = [];
    // for (var i = 0; i<selection.length; i++){
        // var _oNodeObject = new oNode(selection[i])
        // _selectedNodes.push(_oNodeObject)
        // if (recurse && node.isGroup(selection[i])){
            // _selectedNodes = _selectedNodes.concat(_oNodeObject.subNodes(recurse))
        // }
    // }
    // return _selectedNodes;
// }
 
// oNode addNode(string type, string name, oPoint nodePosition, string group)
 

/**
 * $.scene.addNode
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
        return new oNode( this.$, group + "/" + name );
      }else{
        this.$.debug( "NODE ALREADY EXISTED: " + group + "/" + name, this.$.DEBUG_LEVEL.WARNING );
        return false;
      }
    }
 
    
    var _nodePath = node.add( group, name, type, nodePosition.x, nodePosition.y, nodePosition.z );
    var _node = new oNode( this.$, _nodePath );
 
    if( _node ){
      this.$.debug( "CREATED THE NODE: " + _node, this.$.DEBUG_LEVEL.LOG );
    }
 
    return _node;
}
 
 
/**
 * $.scene.addColumn
 *
 * Summary: Adds a column to the scene.
 * @param   {string}   type            The type of the column.
 * @param   {string}   name            The name of the column.
 * @param   {string}   element         The element to attach to the column (drawings).
 *  
 * @return: {oColumn}  The created column, or bool as false.
 */
oScene.prototype.addColumn = function( type, name, element ){
    // Defaults for optional parameters
    
    this.$.debug( "CREATING THE COLUMN: " + name, this.$.DEBUG_LEVEL.LOG );
    
    if (typeof name === 'undefined') var name = column.generateAnonymousName();
 
    var _columnName = column.add(name, type);
 
    var _column = new oColumn( this.$, _columnName);
 
    if (type == "DRAWING" && typeof element !== 'undefined'){
        column.setElementIdOfDrawing(_column.uniqueName, element.id);
    }
 
    return _column;
}
 
 
/**
 * $.scene.addElement
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
 
    // TODO: physically copy the files to the element folder to import a bitmap
 
    var _id = element.add(name, scanType, fieldGuide, _fileFormat, _vectorFormat);
 
    var _element = new oElement( this.$, _id );
 
    //this.elements.push(_element)
 
    return _element;
}
 
 
/**
 * $.scene.addDrawingNode
 *
 * Summary: Adds a drawing element to the scene.
 * @param   {string}   name            The name of the newly created node.
 * @param   {string}   group           The groupname to add the node.
 * @param   {oPoint}   nodePosition    The position for the node to be placed in the network.
 * @param   {object}   element         The element to attach to the column.
 * @param   {object}   drawingColumn   The column to attach to the drawing module.
 * @param   {object}   options         The creation options, nothing available at this point.
 
 * @return: {oNode}    The created node, or bool as false.
 */
 
oScene.prototype.addDrawingNode = function( name, group, nodePosition, element, drawingColumn, options ){
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
 
    return _node;
}

 
/**
 * $.scene.addGroup
 *
 * Summary: Add elements to a group, problemsolve for includeNodes that aren't within the same group/selection.
 * @todo: IMPLEMENT.
 *
 * @return: {oNode}    The created node, or bool as false.
 */
oScene.prototype.addGroup = function( name, includeNodes, group, nodePosition, addComposite, addPeg ){
    // Defaults for optional parameters
       // TODO
}
 