//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          $.oLayer class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oLayer class
 * @classdesc
 * The $.oLayer class represents a single line in the timeline.
 * @constructor
 * @param   {oTimeline}                oTimelineObject       The timeline associated to this layer.
 * @param   {int}                      layerIndex            The index of the layer on the timeline (all layers included, node and columns).
 *
 * @property {int}                     index                 The index of the layer on the timeline.
 * @property {oTimeline}               timeline              The timeline associated to this layer.
 */
function oLayer (oTimelineObject, layerIndex){
  this.timeline = oTimelineObject;
  this.index = layerIndex;
}


/**
 * The node associated to the layer.
 * @name $.oLayer#node
 * @type {$.oNode}
 */
Object.defineProperty(oLayer.prototype, "node", {
  get: function(){
    if (this.$.batchMode){
      var _node = this.timeline.nodes[this.index];
    } else {
      var _node = this.$.scn.getNodeByPath(Timeline.layerToNode(this.index));
    }
    return _node
  }
})


/**
 * the parent layer for this layer in the timeline. Returns the root group if layer is top level.
 * @name $.oLayer#parent
 * @type {$.oLayer}
 */
Object.defineProperty(oLayer.prototype, "parent", {
  get: function(){
    var _parentIndex = Timeline.parentNodeIndex(this.index);
    if (_parentIndex == -1) return this.$.scn.root;
    var _parent = this.timeline.allLayers[_parentIndex];

    return _parent;
  }
})


/**
 * wether or not the layer is selected.
 * @name $.oLayer#selected
 * @type {bool}
 * @readonly
 */
Object.defineProperty(oLayer.prototype, "selected", {
  get: function(){
    var selectionLength = Timeline.numLayerSel
    for (var i=0; i<selectionLength; i++){
      if (Timeline.selToLayer(i) == this.index) return true;
    }
    return false;
  },
  set:function(){
    throw new Error ("unnamed layers selection cannot be set.")
  }
})


/**
 * The name of this layer/node.
 * @name $.oLayer#name
 * @type {string}
 * @readonly
 */
Object.defineProperty(oLayer.prototype, "name", {
  get: function(){
    return "unnamed layer";
  }
})


/**
 * @private
 */
oLayer.prototype.toString = function(){
  return "<$.oLayer '"+this.name+"'>";
}

exports.oLayer = oLayer;



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oNodeLayer class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oNodeLayer class
 * @classdesc
 * The $.oNodeLayer class represents a timeline layer corresponding to a node from the scene.
 * @constructor
 * @extends $.oLayer
 * @param   {oTimeline}                oTimelineObject       The timeline associated to this layer.
 * @param   {int}                      layerIndex            The index of the layer on the timeline.
 *
 * @property {int}                     index                 The index of the layer on the timeline.
 * @property {oTimeline}               timeline              The timeline associated to this layer.
 * @property {oNode}                   node                  The node associated to the layer.
 */
oNodeLayer = function( oTimelineObject, layerIndex){
  this.$.oLayer.apply(this, [oTimelineObject, layerIndex]);
}
oNodeLayer.prototype = Object.create(oLayer.prototype);


/**
 * The name of this layer/node.
 * @name $.oNodeLayer#name
 * @type {string}
 */
Object.defineProperty(oNodeLayer.prototype, "name", {
  get: function(){
    return this.node.name;
  },
  set: function(newName){
    this.node.name = newName;
  }
})


/**
 * The layer index when ignoring subLayers.
 * @name $.oNodeLayer#layerIndex
 * @type {int}
*/
Object.defineProperty(oNodeLayer.prototype, "layerIndex", {
  get: function(){
    var _layers = this.timeline.layers.map(function(x){return x.node.path});
    return _layers.indexOf(this.node.path);
  }
})


/**
 * wether or not the layer is selected.
 * @name $.oNodeLayer#selected
 * @type {bool}
 */
Object.defineProperty(oNodeLayer.prototype, "selected", {
  get: function(){
    if (this.$.batchMode) return this.node.selected;

    var selectionLength = Timeline.numLayerSel
    for (var i=0; i<selectionLength; i++){
      if (Timeline.selToLayer(i) == this.index) return true;
    }
    return false;
  },
  set: function(selected){
    this.node.selected = selected;
  }
})


/**
 * The column layers associated with this node.
 * @name $.oNodeLayer#subLayers
 * @type {$.oColumnLayer[]}
*/
Object.defineProperty(oNodeLayer.prototype, "subLayers", {
  get: function(){
    var _node = this.node;
    var _nodeLayerType = this.$.oNodeLayer;
    return this.timeline.allLayers.filter(function (x){return x.node.path == _node.path && !(x instanceof _nodeLayerType)});
  }
})



/**
 * @private
 */
oNodeLayer.prototype.toString = function(){
  return "<$.oNodeLayer '"+this.name+"'>";
}


exports.oNodeLayer = oNodeLayer;


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oDrawingLayer class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oDrawingLayer class
 * @classdesc
 * The $.oDrawingLayer class represents a timeline layer corresponding to a 'READ' node (or Drawing in Toonboom UI) from the scene.
 * @constructor
 * @extends $.oNodeLayer
 * @param   {oTimeline}                oTimelineObject       The timeline associated to this layer.
 * @param   {int}                      layerIndex            The index of the layer on the timeline.
 *
 * @property {int}                     index                 The index of the layer on the timeline.
 * @property {oTimeline}               timeline              The timeline associated to this layer.
 * @property {oNode}                   node                  The node associated to the layer.
 */
oDrawingLayer = function( oTimelineObject, layerIndex){
  this.$.oNodeLayer.apply(this, [oTimelineObject, layerIndex]);
}
oDrawingLayer.prototype = Object.create(oNodeLayer.prototype);


/**
 * The oFrame objects that hold the drawings for this layer.
 * @name oDrawingLayer#drawingColumn
 * @type {oFrame[]}
 */
 Object.defineProperty(oDrawingLayer.prototype, "drawingColumn", {
  get: function(){
    return this.node.attributes.drawing.elements.column;
  }
})


/**
 * The oFrame objects that hold the drawings for this layer.
 * @name oDrawingLayer#exposures
 * @type {oFrame[]}
 */
Object.defineProperty(oDrawingLayer.prototype, "exposures", {
  get: function(){
    return this.drawingColumn.frames;
  }
})


/**
 * @private
 */
oDrawingLayer.prototype.toString = function(){
  return "<$.oDrawingLayer '"+this.name+"'>";
}


exports.oDrawingLayer = oDrawingLayer;




//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oColumnLayer class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * Constructor for $.oColumnLayer class
 * @classdesc
 * The $.oColumnLayer class represents a timeline layer corresponding to the animated values of a column linked to a node.
 * @constructor
 * @extends $.oLayer
 * @param   {oTimeline}                oTimelineObject       The timeline associated to this layer.
 * @param   {int}                      layerIndex            The index of the layer on the timeline.
 *
 * @property {int}                     index                 The index of the layer on the timeline.
 * @property {oTimeline}               timeline              The timeline associated to this layer.
 * @property {oNode}                   node                  The node associated to the layer.
 */
function oColumnLayer ( oTimelineObject, layerIndex){
  this.$.oLayer.apply(this, [oTimelineObject, layerIndex]);
}
oColumnLayer.prototype = Object.create(oLayer.prototype);


/**
 * The name of this layer.
 * (corresponding to the display name of the column, not the name displayed in timeline, not exposed by the Toonboom API).
 * @name $.oColumnLayer#name
 * @type {string}
 */
Object.defineProperty(oColumnLayer.prototype, "name", {
  get: function(){
    return this.column.name;
  }
})



/**
 * the node attribute associated with this layer. Only available if the attribute has a column.
 * @name $.oColumnLayer#attribute
 * @type {$.oColumn}
 */
Object.defineProperty(oColumnLayer.prototype, "attribute", {
  get: function(){
    if (!this._attribute){
      this._attribute = this.column.attributeObject;
    }
    return this._attribute
  }
})



/**
 * the node associated with this layer
 * @name $.oColumnLayer#column
 * @type {$.oColumn}
 */
Object.defineProperty(oColumnLayer.prototype, "column", {
  get: function(){
    if (!this._column){
      var _name = Timeline.layerToColumn(this.index);
      var _attribute = this.node.getAttributeByColumnName(_name);
      this._column = _attribute.column;
    }
    return this._column;
  }
})


/**
 * The layer representing the node to which this column is linked
 */
Object.defineProperty(oColumnLayer.prototype, "nodeLayer", {
  get: function(){
    var _node = this.node;
    var _nodeLayerType = this.$.oNodeLayer;
    this.timeline.allLayers.filter(function (x){return x.node == _node && x instanceof _nodeLayerType})[0];
  }
})



/**
 * @private
 */
oColumnLayer.prototype.toString = function(){
  return "<$.oColumnLayer '"+this.name+"'>";
}

exports.oColumnLayer = oColumnLayer;