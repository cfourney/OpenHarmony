
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oNodeLayer class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oLayer = require("./oLayer.js");

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


exports = oNodeLayer;