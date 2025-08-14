
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oStroke class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oStroke class. These types of objects are not supported for harmony versions < 16
 * @constructor
 * @classdesc  The $.oStroke class models the strokes that make up the shapes visible on the Drawings.
 * @param {int}       index             The index of the stroke in the shape.
 * @param {object}    strokeObject      The stroke object descriptor that contains the info for the stroke
 * @param {oShape}    oShapeObject      The parent oShape
 *
 * @property {int}          index       the index of the stroke in the parent shape
 * @property {$.oShape}     shape       the shape that contains this stroke
 * @property {$.oArtLayer}  artLayer    the art layer that contains this stroke
 */
function oStroke (index, strokeObject, oShapeObject) {
  this.index = index;
  this.shape = oShapeObject;
  this.artLayer = oShapeObject.artLayer;
  this._data = strokeObject;
}


/**
 * The $.oVertex (including bezier handles) making up the complete path of the stroke.
 * @name $.oStroke#path
 * @type {$.oVertex[]}
 * @readonly
 */
Object.defineProperty(oStroke.prototype, "path", {
  get: function () {
    // path vertices get cached
    if (!this.hasOwnProperty("_path")){
      var _stroke = this;
      var _path = this._data.path.map(function(point, index){
        return new _stroke.$.oVertex(_stroke, point.x, point.y, point.onCurve, index);
      })

      this._path = _path;
    }
    return this._path;
  }
})


/**
 * The oVertex that are on the stroke (Bezier handles exluded.)
 * The first is repeated at the last position when the stroke is closed.
 * @name $.oStroke#points
 * @type {$.oVertex[]}
 * @readonly
 */
Object.defineProperty(oStroke.prototype, "points", {
  get: function () {
    return this.path.filter(function(x){return x.onCurve});
  }
})


/**
 * The segments making up the stroke. Each segment is a slice of the path, starting and stopping with oVertex present on the curve, and includes the bezier handles oVertex.
 * @name $.oStroke#segments
 * @type {$.oVertex[][]}
 * @readonly
 */
Object.defineProperty(oStroke.prototype, "segments", {
  get: function () {
    var _points = this.points;
    var _path = this.path;
    var _segments = [];

    for (var i=0; i<_points.length-1; i++){
      var _indexStart = _points[i].index;
      var _indexStop = _points[i+1].index;
      var _segment = _path.slice(_indexStart, _indexStop+1);
      _segments.push(_segment);
    }

    return _segments;
  }
})


/**
 * The index of the stroke in the shape
 * @name $.oStroke#index
 * @type {int}
 */
Object.defineProperty(oStroke.prototype, "index", {
  get: function () {
    this.$.debug("stroke object : "+JSON.stringify(this._stroke, null, "  "), this.$.DEBUG_LEVEL.DEBUG);
    return this._data.strokeIndex;
  }
})


/**
 * The style of the stroke. null if the stroke is invisible
 * @name $.oStroke#style
 * @type {$.oLineStyle}
 */
Object.defineProperty(oStroke.prototype, "style", {
  get: function () {
    if (this._data.invisible){
      return null;
    }
    var _colorId = this._data.pencilColorId;
    var _stencil = this.shape.stencils[this._data.thickness];

    return new this.$.oLineStyle(_colorId, _stencil);
  }
})


/**
 * wether the stroke is a closed shape.
 * @name $.oStroke#closed
 * @type {bool}
 */
Object.defineProperty(oStroke.prototype, "closed", {
  get: function () {
    var _path = this.path;
    $.log(_path)
    $.log(_path[_path.length-1].strokePosition)
    return _path[_path.length-1].strokePosition == 0;
  }
})


/**
 * The bounding box of the stroke.
 * @name $.oStroke#bounds
 * @type {$.oBox}
 * @readonly
 */
 Object.defineProperty(oStroke.prototype, 'bounds', {
  get: function () {
    var _bounds = new this.$.oBox();
    // since Harmony doesn't allow natively to calculate the bounding box of a string,
    // we convert the bezier into a series of points and calculate the box from it
    var points = Drawing.geometry.discretize({precision: 1, path : this.path});
    for (var j in points){
      var point = points [j]
      var pointBox = new this.$.oBox(point.x, point.y, point.x, point.y);
      _bounds.include(pointBox);
    }
    return _bounds;
  }
})


/**
 * The intersections on this stroke. Each intersection is an object with stroke ($.oStroke), point($.oPoint), strokePoint(float) and ownPoint(float)
 * One of these objects describes an intersection by giving the stroke it intersects with, the coordinates of the intersection and two values which represent the place on the stroke at which the point is placed, with a value between 0 (start) and 1(end)
 * @param  {$.oStroke}   [stroke]       Specify a stroke to find intersections specific to it. If no stroke is specified,
 * @return {Object[]}
 * @example
// get the selected strokes on the active drawing
var sel = $.scn.activeDrawing.selectedStrokes;

for (var i in sel){
  // get intersections with all other elements of the drawing
	var intersections = sel[i].getIntersections();

  for (var j in intersections){
    log("intersection : " + j);
    log("point : " + intersections[j].point);                    // the point coordinates
    log("strokes index : " + intersections[j].stroke.index);     // the index of the intersecting strokes in their own shape
    log("own point : " + intersections[j].ownPoint);             // how far the intersection is on the stroke itself
    log("stroke point : " + intersections[j].strokePoint);       // how far the intersection is on the intersecting stroke
  }
}
 */
oStroke.prototype.getIntersections = function (stroke){
  if (typeof stroke !== 'undefined'){
    // get intersection with provided stroke only
    var _key = { "path0": [{ path: this.path }], "path0": [{ path: stroke.path }] };
    var intersections = Drawing.query.getIntersections(_key)[0];
  }else{
    // get all intersections on the stroke
    var _drawingKey = this.artLayer._key;
    var _key = { "drawing": _drawingKey.drawing, "art": _drawingKey.art, "paths": [{ path: this.path }] };
    var intersections = Drawing.query.getIntersections(_key)[0];
  }

  var result = [];
  for (var i in intersections) {
    var _shape = this.artLayer.getShapeByIndex(intersections[i].layer);
    var _stroke = _shape.getStrokeByIndex(intersections[i].strokeIndex);

    for (var j in intersections[i].intersections){
      var points = intersections[i].intersections[j];

      var point = new this.$.oVertex(this, points.x0, points.y0, true);
      var intersection = { stroke: _stroke, point: point, ownPoint: points.t0, strokePoint: points.t1 };

      result.push(intersection);
    }
  }

  return result;
}



/**
 * Adds points on the stroke without moving them, at the distance specified (0=start vertice, 1=end vertice)
 * @param   {float[]}       pointsToAdd     an array of float value between 0 and the number of current points on the curve
 * @returns {$.oVertex[]}   the points that were created (if points already existed, they will be returned)
 * @example
// get the selected stroke and create points where it intersects with the other two strokes
var sel = $.scn.activeDrawing.selectedStrokes[0];

var intersections = sel.getIntersections();

// get the two intersections
var intersection1 = intersections[0];
var intersection2 = intersections[1];

// add the points at the intersections on the intersecting strokes
intersection1.stroke.addPoints([intersection1.strokePoint]);
intersection2.stroke.addPoints([intersection2.strokePoint]);

// add the points on the stroke
sel.addPoints([intersection1.ownPoint, intersection2.ownPoint]);
*/
oStroke.prototype.addPoints = function (pointsToAdd) {
  // calculate the points that will be created
  var points = Drawing.geometry.insertPoints({path:this._data.path, params : pointsToAdd});

  // find the newly added points amongst the returned values
  for (var i in this.path){
    var pathPoint = this.path[i];

    // if point is found in path, it's not newly created
    for (var j = points.length-1; j >=0; j--){
      var point = points[j];
      if (point.x == pathPoint.x && point.y == pathPoint.y) {
        points.splice(j, 1);
        break
      }
    }
  }

  // actually add the points
  var config = this.artLayer._key;
  config.label = "addPoint";
  config.strokes = [{layer:this.shape.index, strokeIndex:this.index, insertPoints: pointsToAdd }];

  DrawingTools.modifyStrokes(config);
  this.updateDefinition();

  var newPoints = [];
  // find the points for the coordinates from the new path
  for (var i in points){
    var point = points[i];

    for (var j in this.path){
      var pathPoint = this.path[j];
      if (point.x == pathPoint.x && point.y == pathPoint.y) newPoints.push(pathPoint);
    }
  }

  if (newPoints.length < pointsToAdd.length) throw new Error ("some points in " + pointsToAdd + " were not created.");
  return newPoints;
}


/**
 * fetch the stroke information again to update it after modifications.
 * @returns {object} the data definition of the stroke, for internal use.
 */
oStroke.prototype.updateDefinition = function(){
  var _key = this.artLayer._key;
  var strokes = Drawing.query.getStrokes(_key);
  this._data = strokes.layers[this.shape.index].strokes[this.index];

  // remove cache for path
  delete this._path;

  return this._data;
}


/**
 * Gets the closest position of the point on the stroke (float value) from a point with x and y coordinates.
 * @param {oPoint}  point
 * @return {float}  the strokePosition of the point on the stroke (@see $.oVertex#strokePosition)
 */
oStroke.prototype.getPointPosition = function(point){
  var arg = {
    path : this.path,
    points: [{x:point.x, y:point.y}]
  }
  var strokePoint = Drawing.geometry.getClosestPoint(arg)[0].closestPoint;
  if (!strokePoint) return 0; // the only time this fails is when the point is the origin of the stroke

  return strokePoint.t;
}


/**
 * Get the coordinates of the point on the stroke from its strokePosition (@see $.oVertex#strokePosition).
 * Only works until a distance of 600 drawing vector units.
 * @param {float}  position
 * @return {$.oPoint} an oPoint object containing the coordinates.
 */
oStroke.prototype.getPointCoordinates = function(position){
  var arg = {
    path : this.path,
    params : [ position ]
  };
  var point = Drawing.geometry.evaluate(arg)[0];

  return new this.$.oPoint(point.x, point.y);
}


/**
 * projects a point onto a stroke and returns the closest point belonging to the stroke.
 * Only works until a distance of 600 drawing vector units.
 * @param {$.oPoint} point
 * @returns {$.oPoint}
 */
oStroke.prototype.getClosestPoint = function (point){
  var arg = {
    path : this.path,
    points: [{x:point.x, y:point.y}]
  };

  // returns an array of length 1 with an object containing
  // the original query and a "closestPoint" key that contains the information.
  var _result = Drawing.geometry.getClosestPoint(arg)[0];

  return new this.$.oPoint(_result.closestPoint.x, _result.closestPoint.y);
}


/**
 * projects a point onto a stroke and returns the distance between the point and the stroke.
 * Only works until a distance of 600 drawing vector units.
 * @param {$.oPoint} point
 * @returns {float}
 */
oStroke.prototype.getPointDistance = function (point){
  var arg = {
    path : this.path,
    points: [{x:point.x, y:point.y}]
  };

  // returns an array of length 1 with an object containing
  // the original query and a "closestPoint" key that contains the information.
  var _result = Drawing.geometry.getClosestPoint(arg)[0].closestPoint;

  return _result.distance;
}


/**
 * @private
 */
oStroke.prototype.toString = function(){
  return "<oStroke: path:"+this.path+">"
}

exports.oStroke = oStroke;



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oContour class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


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


exports.oContour = oContour;