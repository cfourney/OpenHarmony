//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oMatrix class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * The $.oMatrix constructor.
 * @constructor
 * @classdesc The $.oMatrix is a subclass of the native Matrix4x4 object from Harmony. It has the same methods and properties plus the ones listed here.
 * @param {Matrix4x4} matrixObject a matrix object to initialize the instance from
 */
function oMatrix (matrixObject){
  Matrix4x4.constructor.call(this);
  if (matrixObject){
    log(matrixObject)
    this.m00 = matrixObject.m00;
    this.m01 = matrixObject.m01;
    this.m02 = matrixObject.m02;
    this.m03 = matrixObject.m03;
    this.m10 = matrixObject.m10;
    this.m11 = matrixObject.m11;
    this.m12 = matrixObject.m12;
    this.m13 = matrixObject.m13;
    this.m20 = matrixObject.m20;
    this.m21 = matrixObject.m21;
    this.m22 = matrixObject.m22;
    this.m23 = matrixObject.m23;
    this.m30 = matrixObject.m30;
    this.m31 = matrixObject.m31;
    this.m32 = matrixObject.m32;
    this.m33 = matrixObject.m33;
  }
}
oMatrix.prototype = Object.create(Matrix4x4.prototype)


/**
 * A 2D array that contains the values from the matrix, rows by rows.
 * @name $.oMatrix#values
 * @type {Array}
 */
Object.defineProperty(oMatrix.prototype, "values", {
  get:function(){
    return [
      [this.m00, this.m01, this.m02, this.m03],
      [this.m10, this.m11, this.m12, this.m13],
      [this.m20, this.m21, this.m22, this.m23],
      [this.m30, this.m31, this.m32, this.m33],
    ]
  }
})


/**
 * @private
 */
oMatrix.prototype.toString = function(){
  return "< $.oMatrix object : \n"+this.values.join("\n")+">";
}


exports.oMatrix = oMatrix;