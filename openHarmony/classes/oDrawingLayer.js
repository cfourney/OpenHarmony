//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oDrawingLayer class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


var oNodeLayer = require("./oNodeLayer.js");

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


exports = oDrawingLayer;