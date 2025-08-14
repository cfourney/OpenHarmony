//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//            $.oBox class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////



/**
 * The $.oBox helper class - representing a 2D box.
 * @constructor
 * @classdesc  $.oBox Base Class
 * @param      {float}       left                             left horizontal bound
 * @param      {float}       top                              top vertical bound
 * @param      {float}       right                            right horizontal bound
 * @param      {float}       bottom                           bottom vertical bound
 *
 * @property      {float}       left                             left horizontal bound
 * @property      {float}       top                              top vertical bound
 * @property      {float}       right                            right horizontal bound
 * @property      {float}       bottom                           bottom vertical bound
 */
function oBox ( left, top, right, bottom ){
  this._type = "box";

  if (typeof top === 'undefined') var top = Infinity
  if (typeof left === 'undefined') var left = Infinity
  if (typeof right === 'undefined') var right = -Infinity
  if (typeof bottom === 'undefined') var bottom = -Infinity

  this.top = top;
  this.left = left;
  this.right = right;
  this.bottom = bottom;
}


/**
 * Wether this box is empty or not (boxes start as empty when initialized).
 * @name $.oBox#isEmpty
 * @type {bool}
 */
Object.defineProperty(oBox.prototype, 'isEmpty', {
  get : function(){
    return this.top == Infinity && this.left == Infinity && this.right == -Infinity && this.bottom == -Infinity;
  }
})



/**
 * The width of the box.
 * @name $.oBox#width
 * @type {float}
 */
Object.defineProperty(oBox.prototype, 'width', {
  get : function(){
    return this.right - this.left + 1; //Inclusive size.
  }
})


/**
 * The height of the box.
 * @name $.oBox#height
 * @type {float}
 */
Object.defineProperty(oBox.prototype, 'height', {
  get : function(){
    return this.bottom - this.top;
  }
})


/**
 * The center of the box.
 * @name $.oBox#center
 * @type {$.oPoint}
 */
Object.defineProperty(oBox.prototype, 'center', {
  get : function(){
    return new this.$.oPoint(this.left+this.width/2, this.top+this.height/2);
  }
})


/**
 * Adds the input box to the bounds of the current $.oBox.
 * @param   {$.oBox}       box                The $.oBox to include.
 */
oBox.prototype.include = function(box){
  if (box.left < this.left) this.left = box.left;
  if (box.top < this.top) this.top = box.top;
  if (box.right > this.right) this.right = box.right;
  if (box.bottom > this.bottom) this.bottom = box.bottom;
}


/**
 * Checks wether the box contains another $.oBox.
 * @param   {$.oBox}       box                The $.oBox to check for.
 * @param   {bool}         [partial=false]    wether to accept partially contained boxes.
 */
oBox.prototype.contains = function(box, partial){
  if (typeof partial === 'undefined') var partial = false;

  var fitLeft = (box.left >= this.left);
  var fitTop = (box.top >= this.top);
  var fitRight =(box.right <= this.right);
  var fitBottom = (box.bottom <= this.bottom);

  if (partial){
    return (fitLeft || fitRight) && (fitTop || fitBottom);
  }else{
    return fitLeft && fitRight && fitTop && fitBottom;
  }

}

/**
 * Adds the bounds of the nodes to the current $.oBox.
 * @param   {oNode[]}       oNodeArray                An array of nodes to include in the box.
 */
oBox.prototype.includeNodes = function(oNodeArray){
  // convert to array if only one node is passed
  if (!Array.isArray(oNodeArray)) oNodeArray = [oNodeArray];

  for (var i in oNodeArray){
     var _node = oNodeArray[i];
     var _nodeBox = _node.bounds;
     this.include(_nodeBox);
  }
}

/**
 * @private
 */
oBox.prototype.toString = function(){
  return "{top:"+this.top+", right:"+this.right+", bottom:"+this.bottom+", left:"+this.left+"}"
}

exports.oBox = oBox;