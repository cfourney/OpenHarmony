
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oContour class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oStroke = require('./oStroke.js');


/**
 * The constructor for the $.oContour class. These types of objects are not supported for harmony versions < 16
 * @constructor
 * @classdesc  The $.oContour class models the strokes that make up the shapes visible on the Drawings.<br>
 * $.oContour is a subclass of $.oSroke and shares its properties, but represents a stroke with a fill.
 * @extends $.oStroke
 * @param {int}       index             The index of the contour in the shape.
 * @param {object}    contourObject     The stroke object descriptor that contains the info for the stroke
 * @param {oShape}    oShapeObject      The parent oShape
 *
 * @property {int}          index       the index of the stroke in the parent shape
 * @property {$.oShape}     shape       the shape that contains this stroke
 * @property {$.oArtLayer}  artLayer    the art layer that contains this stroke
 */
function oContour (index, contourObject, oShapeObject) {
  this.$.oStroke.call(this, index, contourObject, oShapeObject)
}
oContour.prototype = Object.create(oStroke.prototype)


/**
 * The information about the fill of this contour
 * @name $.oContour#fill
 * @type {$.oFillStyle}
 */
Object.defineProperty(oContour.prototype, "fill", {
  get: function () {
    var _data = this._data;
    return new this.$.oFillStyle(_data.colorId, _data.matrix);
  }
})


/**
 * The bounding box of the contour.
 * @name $.oContour#bounds
 * @type {$.oBox}
 * @readonly
 */
 Object.defineProperty(oContour.prototype, 'bounds', {
  get: function () {
    var _data = this._data;
    var _box = _data.box;
    var _bounds = new this.$.oBox(_box.x0,_box.y0, _box.x1, _box.y1);
    return _bounds;
  }
})

/**
 * @private
 */
oContour.prototype.toString = function(){
  return "<oContour path:"+this.path+", fill:"+fill+">"
}


exports = oContour;