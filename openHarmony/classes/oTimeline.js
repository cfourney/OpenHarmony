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
 * The $.oTimeline constructor.
 * @constructor
 * @classdesc  The $.oTimeline class represents a timeline corresponding to a specific display.
 * @param   {string}      [display]  The display node's path. By default, the defaultDisplay of the scene.
 *
 * @property {string}     display    The display node's path.
 */
function oTimeline (display){
  if (typeof display === 'undefined') var display = this.$.scn.defaultDisplay;
  if (display instanceof this.$.oNode) display = display.path;

  this.display = display;
  this._layers = [];
}


/**
 * Gets the list of node layers in timeline.
 * @name $.oTimeline#layers
 * @type {$.oLayer[]}
 */
Object.defineProperty(oTimeline.prototype, 'layers', {
  get : function(){
    var nodeLayer = this.$.oNodeLayer;
    return this.allLayers.filter(function (x){return x instanceof nodeLayer})
  }
});


/**
 * Gets the list of all layers in timeline, nodes and columns. In batchmode, will only return the nodes, not the sublayers.
 * @name $.oTimeline#allLayers
 * @type {$.oLayer[]}
 */
Object.defineProperty(oTimeline.prototype, 'allLayers', {
  get : function(){
    if (!this.$.batchMode){
      // Timeline is not accurate in batch mode
      if (Timeline.numLayers != this._layers.length){
        var _layers = [];
        // rebuild layers cache
        for( var i=0; i < Timeline.numLayers; i++ ){
          if (Timeline.layerIsNode(i)){
            var _layer = new this.$.oNodeLayer(this, i);
            if (_layer.node.type == "READ") var _layer = new this.$.oDrawingLayer(this, i);
          }else if (Timeline.layerIsColumn(i)) {
            var _layer = new this.$.oColumnLayer(this, i);
          }else{
            var _layer = new this.$.oLayer(this, i);
          }

          _layers.push(_layer);
        }
        this._layers = _layers;
      }
    } else {
      // Timeline is not accurate in batch mode so we just create layers based on nodes to avoid breaking export scripts
      if (this.nodes.length != this._layers.length){
        // rebuild layers cache
        var _tl = this;
        var _layers = this.nodes.map(function(x, index){
          if (x.type == "READ") return new _tl.$.oDrawingLayer(_tl, index);
          return new _tl.$.oNodeLayer(_tl, index)
        })
      }
      this._layers = _layers;
    }

    return this._layers;
  }
});


/**
 * Gets the list of selected layers as oTimelineLayer objects.
 * @name $.oTimeline#selectedLayers
 * @type {oTimelineLayer[]}
 */
Object.defineProperty(oTimeline.prototype, 'selectedLayers', {
  get : function(){
    return this.allLayers.filter(function(x){return x.selected});
  }
});


/**
 * The node layers in the scene, based on the timeline's order given a specific display.
 * @name $.oTimeline#compositionLayers
 * @type {oNode[]}
 * @deprecated use oTimeline.nodes instead if you want the nodes
 */
Object.defineProperty(oTimeline.prototype, 'compositionLayers', {
  get : function(){
    return this.nodes;
  }
});


/**
 * The nodes present in the timeline.
 * @name $.oTimeline#nodes
 * @type {oNode[]}
 */
Object.defineProperty(oTimeline.prototype, 'nodes', {
  get : function(){
    return this.layers.map(function(x){return x.node})
  }
});


/**
 * Gets the paths of the nodes displayed in the timeline.
 * @name $.oTimeline#nodesList
 * @type {string[]}
 * @deprecated only returns node path strings, use oTimeline.layers insteads
 */
Object.defineProperty(oTimeline.prototype, 'nodesList', {
  get : function(){
    return this.compositionLayersList;
  }
});


/**
 * Gets the paths of the layers in order, given the specific display's timeline.
 * @name $.oTimeline#compositionLayersList
 * @type {string[]}
 * @deprecated only returns node path strings
 */
Object.defineProperty(oTimeline.prototype, 'compositionLayersList', {
  get : function(){
    var _composition = this.composition;
    var _timeline = _composition.map(function(x){return x.node})

    return _timeline;
  }
});


/**
 * gets the composition for this timeline (array of native toonboom api 'compositionItems' objects)
 * @deprecated exposes native harmony api objects
 */
Object.defineProperty(oTimeline.prototype, "composition", {
  get: function(){
    if (!node.type(this.display)) {
      return compositionOrder.buildDefaultCompositionOrder();
    }else{
      return compositionOrder.buildCompositionOrderForDisplay(this.display);
    }
  }
})



/**
 * Refreshes the oTimeline's cached listing- in the event it changes in the runtime of the script.
 * @deprecated oTimeline.composition is now always refreshed when accessed.
 */
oTimeline.prototype.refresh = function( ){
  if (!node.type(this.display)) {
      this._composition = compositionOrder.buildDefaultCompositionOrder();
  }else{
      this._composition = compositionOrder.buildCompositionOrderForDisplay(this.display);
  }
}


/**
 * Build column to oNode/Attribute lookup cache. Makes the layer generation faster if using oTimeline.layers, oTimeline.selectedLayers
 * @deprecated
 */
oTimeline.prototype.buildLayerCache = function( forced ){
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

exports.oTimeline = oTimeline;