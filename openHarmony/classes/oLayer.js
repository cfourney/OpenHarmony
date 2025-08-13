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
 * @property {oNode}                   node                  The node associated to the layer.
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
      _node = this.timeline.nodes[this.index];
    } else {
      _node = this.$.scn.getNodeByPath(Timeline.layerToNode(this.index));
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

exports = oLayer;