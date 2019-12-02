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
//      $.oTimelineLayer class      //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
/**
 * The base class for the $.oTimelineLayer.
 * @constructor
 * @classdesc  $.oTimelineLayer Base Class
 * @param   {int}                      index                 The index of the layer on the timeline.
 * @param   {oTimeline}                oTimelineObject       The timeline associated to this layer.
 *
 * @property {int}                     index                 The index of the layer on the timeline.
 * @property {oTimeline}               timeline              The timeline associated to this layer.
 * @property {string}                  layerType             The type of layer, either node or column.
 * @property {oNode}                   node                  The node associated to the layer.
 * @property {oAttribute}              attribute             The associated attributes to the layer.
 * @property {oColumn}                 column                The column associated to the layer.
 */
$.oTimelineLayer = function( index, oTimelineObject ){
    this.index    = index;
    this.timeline = oTimelineObject;
    
    this._type = "timelineLayer";
    
    this.node       = false;
    this.column     = false;
    this.attribute  = false;

    if( Timeline.layerIsColumn( index ) ){
      this.layerType     = 'column';
      var col            = Timeline.layerToColumn( index ); 
      
      if( this.$.cache_columnToNodeAttribute && this.$.cache_columnToNodeAttribute[col] ){
        this.attribute = this.$.cache_columnToNodeAttribute[col].attribute;
        this.node      = this.$.cache_columnToNodeAttribute[col].node;
        this.column    = this.$.cache_columnToNodeAttribute[col].attribute.column;
      }else{
          var pnode_idx      = Timeline.parentNodeIndex( index );
          if( pnode_idx >= 0 ){
            var pnode_name     = Timeline.layerToNode( pnode_idx );
            this.node          = this.$.scene.$node( pnode_name );
            this.attribute     = this.node.getAttributeByColumnName( col );

            if( !this.attribute ){
              //Might be drawing -- not provided by this type.
            }
          }else{
            //Find a drawing module if its that type.
            
          }
      }
    }else if( Timeline.layerIsNode( index ) ){
      this.layerType     = 'node';
      var node_name      = Timeline.layerToNode( index );
      this.node          = this.$.scene.$node( node_name );
    }
}


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oTimeline class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * The base class for the $.oTimeline.
 * @constructor
 * @classdesc  $.oTimeline Base Class
 * @param   {string}                   display               The display node's path.
 * @param   {oScene}                   oSceneObject          The scene object of the DOM.
 *
 * @property {int}                     display               The display node's path.
 * @property {string[]}                composition           The composition order of the scene.
 * @property {oScene}                  scene                 The scene object of the DOM.
 */
$.oTimeline = function( display, oSceneObject ){
    this.display = display
    this.composition = ''
    this.scene = oSceneObject;
   
    //Build the initial composition.
    this.refresh();
    // this.buildLayerCache();
}
 
// Properties
/**
 * The node layers in the scene, based on the timeline's order given a specific display.
 * @name $.oTimeline#compositionLayers
 * @type {oNode[]}
 */
Object.defineProperty($.oTimeline.prototype, 'compositionLayers', {
    get : function(){
        var _timeline = this.compositionLayersList;
        var _scene    = this.scene;
       
        _timeline = _timeline.map( function(x){return _scene.getNodeByPath(x)} );
        
        return _timeline;
    }
});
 
/**
 * Gets the paths of the layers in order, given the specific display's timeline.
 * @name $.oTimeline#compositionLayersList
 * @type {string[]}
 */
Object.defineProperty($.oTimeline.prototype, 'compositionLayersList', {
    get : function(){
        var _composition = this.composition;
        var _timeline = [];
       
        for (var i in _composition){
            _timeline.push( _composition[i].node )
        }
       
        return _timeline;
    }
});


/**
 * Gets the list of layers as oTimelineLayer objects.
 * @name $.oTimeline#layers
 * @type {string[]}
 */
Object.defineProperty($.oTimeline.prototype, 'layers', {
    get : function(){
        var olayers = [];
        for( var n=0; n<Timeline.numLayers; n++ ){
          olayers.push( new this.$.oTimelineLayer( n, this ) );
        }
       
        return olayers;
    }
});

/**
 * Gets the list of selected layers as oTimelineLayer objects.
 * @name $.oTimeline#selectedLayers
 * @type {string[]}
 */
Object.defineProperty($.oTimeline.prototype, 'selectedLayers', {
    get : function(){
        var olayers = [];
        System.println( "!!GETTING LAYERS" );
        for( var n=0; n<Timeline.numLayerSel; n++ ){
          olayers.push( new this.$.oTimelineLayer( Timeline.selToLayer( n ), this ) );
        }
        System.println( "!!GOT LAYERS" );
        
        return olayers;
    }
});


/**
 * Refreshes the oTimeline's cached listing- in the event it changes in the runtime of the script.
 */
$.oTimeline.prototype.refresh = function( ){
    if (node.type(this.display) == '') {
        this.composition = compositionOrder.buildDefaultCompositionOrder();
    }else{
        this.composition = compositionOrder.buildCompositionOrderForDisplay(display);
    }
    
}


/**
 * Build column to oNode/Attribute lookup cache. Makes the layer generation faster if using oTimeline.layers, oTimeline.selectedLayers
 */
$.oTimeline.prototype.buildLayerCache = function( forced ){
  if (typeof forced === 'undefined') forced = false;
  
  var cdate   = (new Date).getTime();
  var rebuild = forced;
  if( !this.$.cache_columnToNodeAttribute_date ){
    rebuild = true;
  }else if( !rebuild ){
    if( ( cdate - this.$.cache_columnToNodeAttribute_date ) > 1000*10 ){
      rebuild = true;
    }
  }
  
  if(rebuild){
    var nodeLayers = this.compositionLayers;
    
    if( this.$.cache_nodeAttribute ){
      this.$.cache_columnToNodeAttribute = {};
    }
    
    for( var n=0;n<nodeLayers.length;n++ ){
      this.$.cache_columnToNodeAttribute    = nodeLayers[n].getAttributesColumnCache( this.$.cache_columnToNodeAttribute );
    }
    this.$.cache_columnToNodeAttribute_date = cdate;
  }
}