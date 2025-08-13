
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oColumnLayer class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oLayer = require('./oLayer.js')

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

exports = oColumnLayer;