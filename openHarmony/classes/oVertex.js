
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oVertex class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oVertex class
 * @constructor
 * @classdesc
 * The $.oVertex class represents a single control point on a stroke. This class is used to get the index of the point in the stroke path sequence, as well as its position as a float along the stroke's length.
 * The onCurve property describes wether this control point is a bezier handle or a point on the curve.
 *
 * @param {$.oStroke} stroke   the stroke that this vertex belongs to
 * @param {float}     x        the x coordinate of the vertex, in drawing space
 * @param {float}     y        the y coordinate of the vertex, in drawing space
 * @param {bool}      onCurve  whether the point is a bezier handle or situated on the curve
 * @param {int}       index    the index of the point on the stroke
 *
 * @property {$.oStroke} stroke    the stroke that this vertex belongs to
 * @property {float}     x         the x coordinate of the vertex, in drawing space
 * @property {float}     y         the y coordinate of the vertex, in drawing space
 * @property {bool}      onCurve   whether the point is a bezier handle or situated on the curve
 * @property {int}       index     the index of the point on the stroke
 */
function oVertex(stroke, x, y, onCurve, index){
  if (typeof onCurve === 'undefined') var onCurve = false;
  if (typeof index === 'undefined') var index = stroke.getPointPosition({x:x, y:y});

  this.x = x;
  this.y = y;
  this.onCurve = onCurve;
  this.stroke = stroke;
  this.index = index
}


/**
 * The position of the point on the curve, from 0 to the maximum number of points
 * @name $.oVertex#strokePosition
 * @type {float}
 * @readonly
 */
Object.defineProperty(oVertex.prototype, 'strokePosition', {
  get: function(){
    var _position = this.stroke.getPointPosition(this);
    return _position;
  }
})


/**
 * The position of the point on the drawing, as an oPoint
 * @name $.oVertex#position
 * @type {oPoint}
 * @readonly
 */
Object.defineProperty(oVertex.prototype, 'position', {
  get: function(){
    var _position = new this.$.oPoint(this.x, this.y, 0);
    return _position;
  }
})


/**
 * The angle of the curve going through this vertex, compared to the x axis, counterclockwise.
 * (In degrees, or null if the stroke is open ended on the right.)
 * @name $.oVertex#angleRight
 * @type {float}
 * @readonly
 */
Object.defineProperty(oVertex.prototype, 'angleRight', {
  get: function(){
    var _index = this.index+1;
    var _path = this.stroke.path;

    // get the next point by looping around if the stroke is closed
    if (_index >= _path.length){
      if (this.stroke.closed){
        var _nextPoint = _path[1];
      }else{
        return null;
      }
    }else{
      var _nextPoint = _path[_index];
    }

    var vector = this.$.oVector.fromPoints(this, _nextPoint);
    var angle = vector.degreesAngle;
    // if (angle < 0) angle += 360 //ensuring only positive values
    return angle
  }
})


/**
 * The angle of the line or bezier handle on the left of this vertex, compared to the x axis, counterclockwise.
 * (In degrees, or null if the stroke is open ended on the left.)
 * @name $.oVertex#angleLeft
 * @type {float}
 * @readonly
 */
Object.defineProperty(oVertex.prototype, 'angleLeft', {
  get: function(){
    var _index = this.index-1;
    var _path = this.stroke.path;

    // get the next point by looping around if the stroke is closed
    if (_index < 0){
      if (this.stroke.closed){
        var _nextPoint = _path[_path.length-2]; //first and last points are the same when the stroke is closed
      }else{
        return null;
      }
    }else{
      var _nextPoint = _path[_index];
    }

    var vector = this.$.oVector.fromPoints(_nextPoint, this);
    var angle = vector.degreesAngle;
    // if (angle < 0) angle += 360 //ensuring only positive values
    return angle
  }
})


/**
 * @private
 */
oVertex.prototype.toString = function(){
 return "oVertex : { index:"+this.index+", x: "+this.x+", y: "+this.y+", onCurve: "+this.onCurve+", strokePosition: "+this.strokePosition+" }"
}

exports.oVertex = oVertex;