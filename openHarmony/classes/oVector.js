
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oVector class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $.oVector constructor.
 * @constructor
 * @classdesc The $.oVector is a replacement for the Vector3d objects of Harmony.
 * @param {float} x a x coordinate for this vector.
 * @param {float} y a y coordinate for this vector.
 * @param {float} [z=0] a z coordinate for this vector. If ommited, will be set to 0 and vector will be 2D.
 */
function oVector (x, y, z){
  if (typeof z === "undefined" || isNaN(z)) var z = 0;

  // since Vector3d doesn't have a prototype, we need to cheat to subclass it.
  this._vector = new Vector3d(x, y, z);
}


/**
 * The X Coordinate of the vector.
 * @name $.oVector#x
 * @type {float}
 */
Object.defineProperty(oVector.prototype, "x", {
  get: function(){
    return this._vector.x;
  },
  set: function(newX){
    this._vector.x = newX;
  }
})


/**
 * The Y Coordinate of the vector.
 * @name $.oVector#y
 * @type {float}
 */
Object.defineProperty(oVector.prototype, "y", {
  get: function(){
    return this._vector.y;
  },
  set: function(newY){
    this._vector.y = newY;
  }
})


/**
 * The Z Coordinate of the vector.
 * @name $.oVector#z
 * @type {float}
 */
Object.defineProperty(oVector.prototype, "z", {
  get: function(){
    return this._vector.z;
  },
  set: function(newX){
    this._vector.z = newX;
  }
})


/**
 * The length of the vector.
 * @name $.oVector#length
 * @type {float}
 * @readonly
 */
Object.defineProperty(oVector.prototype, "length", {
  get: function(){
    return this._vector.length();
  }
})


/**
 * The angle of this vector in radians.
 * @name $.oVector#angle
 * @type {float}
 * @readonly
 */
Object.defineProperty(oVector.prototype, "angle", {
  get: function(){
    return Math.atan2(this.y, this.x);
  }
})


/**
 * The angle of this vector in degrees.
 * @name $.oVector#degreesAngle
 * @type {float}
 * @readonly
 */
Object.defineProperty(oVector.prototype, "degreesAngle", {
  get: function(){
    return this.angle * (180 / Math.PI);
  }
})


/**
 * @static
 * A function of the oVector class (not oVector objects) that gives a vector from two points.
 */
oVector.fromPoints = function(pointA, pointB){
  return new this.$.oVector(pointB.x-pointA.x, pointB.y-pointA.y, pointB.z-pointA.z);
}


/**
 * Adds another vector to this one.
 * @param {$.oVector} vector2
 * @returns {$.oVector} returns itself.
 */
oVector.prototype.add = function (vector2){
  this.x += vector2.x;
  this.y += vector2.y;
  this.z += vector2.z;

  return this;
}


/**
 * Multiply this vector coordinates by a number (scalar multiplication)
 * @param {float} num
 * @returns {$.oVector} returns itself
 */
oVector.prototype.multiply = function(num){
  this.x = num*this.x;
  this.y = num*this.y;
  this.z = num*this.z;

  return this;
}


/**
 * The dot product of the two vectors
 * @param {$.oVector} vector2 a vector object.
 * @returns {float} the resultant vector from the dot product of the two vectors.
 */
oVector.prototype.dot = function(vector2){
  var _dot = this._vector.dot(new Vector3d(vector2.x, vector2.y, vector2.z));
  return _dot;
}


/**
 * The cross product of the two vectors
 * @param {$.oVector} vector2 a vector object.
 * @returns {$.oVector} the resultant vector from the dot product of the two vectors.
 */
oVector.prototype.cross = function(vector2){
  var _cross = this._vector.cross(new Vector3d(vector2.x, vector2.y, vector2.z));
  return new this.$.oVector(_cross.x, _cross.y, _cross.z);
}


/**
 * The projected vectors resulting from the operation
 * @param {$.oVector} vector2 a vector object.
 * @returns {$.oVector} the resultant vector from the projection of the current vector.
 */
oVector.prototype.project = function(vector2){
  var _projection = this._vector.project(new Vector3d(vector2.x, vector2.y, vector2.z));
  return new this.$.oVector(_projection.x, _projection.y, _projection.z);
}


/**
 * Normalize the vector.
 * @returns {$.oVector} returns itself after normalization.
 */
oVector.prototype.normalize = function(){
  this._vector.normalize();
  return this;
}


/**
 * @private
 */
oVector.prototype.toString = function(){
  return "<$.oVector ["+this.x+", "+this.y+", "+this.z+"]>";
}


exports.oVector = oVector;
