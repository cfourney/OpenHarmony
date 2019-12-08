//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, Chris Fourney...
//
//
//   This library is an open source implementation of a Document Object Model
//   for Toonboom Harmony. It also implements patterns similar to JQuery
//   for traversing this DOM.
//
//   Its intended purpose is to simplify and streamline toonboom scripting to
//   empower users and be easy on newcomers, with default parameters values,
//   and by hiding the heavy lifting required by the official API.
//
//   This library is provided as is and is a work in progress. As such, not every
//   function has been implemented or is garanteed to work. Feel free to contribute
//   improvements to its official github. If you do make sure you follow the provided
//   template and naming conventions and document your new methods properly.
//
//   This library doesn't overwrite any of the objects and classes of the official
//   Toonboom API which must remains available.
//
//   This library is made available under the MIT license.
//   https://opensource.org/licenses/mit
//
//   The repository for this library is available at the address:
//   https://github.com/cfourney/OpenHarmony/
//
//
//   For any requests feel free to contact m.chaptel@gmail.com
//
//
//
//
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          $.oPoint class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 

/**
 * The $.oPoint helper class - representing a 3D point.
 * @constructor
 * @classdesc  $.oPoint Base Class
 * @param     {float}              x                              Horizontal coordinate
 * @param     {float}              y                              Vertical coordinate
 * @param     {float}             [z]                             Depth Coordinate
 *
 * @property     {float}           x                              Horizontal coordinate
 * @property     {float}           y                              Vertical coordinate
 * @property     {float}           z                              Depth Coordinate
 */
$.oPoint = function(x, y, z){
    if (typeof z === 'undefined') var z = 0;
    
    this._type = "point";

    this.x = x;
    this.y = y;
    this.z = z;
}
 
/**
 * Adds the input box to the bounds of the current $.oBox.
 * @param   {$.oPoint}       add_pt                The point to add to this point. 
 *
 * @return: { $.oPoint }                           Returns self (for inline addition).
 */
$.oPoint.prototype.pointAdd = function( add_pt ){
  this.x += add_pt.x;
  this.y += add_pt.y;
  this.z += add_pt.z;
    
  return this;
}

/**
 * Subtracts the input box to the bounds of the current $.oBox.
 * @param   {$.oPoint}       sub_pt                The point to subtract to this point. 
 *
 * @return: { $.oPoint }                           Returns self (for inline addition).
 */
$.oPoint.prototype.pointSubtract = function( sub_pt ){
  this.x -= sub_pt.x;
  this.y -= sub_pt.y;
  this.z -= sub_pt.z;
    
  return this;
}

/**
 * Multiply all coordinates by this value.
 * @param   {float}       float_val                Multiply all coordinates by this value. 
 *
 * @return: { $.oPoint }                           Returns self (for inline addition).
 */
$.oPoint.prototype.multiply = function( float_val ){
  this.x *= float_val;
  this.y *= float_val;
  this.z *= float_val;
    
  return this;
}

/**
 * Divides all coordinates by this value.
 * @param   {float}       float_val                Divide all coordinates by this value. 
 *
 * @return: { $.oPoint }                           Returns self (for inline addition).
 */
$.oPoint.prototype.divide = function( float_val ){
  this.x /= float_val;
  this.y /= float_val;
  this.z /= float_val;
    
  return this;
}

/**
 * Find average of provided points.
 * @param   {$.oPoint[]}       point_array         The array of points to get the average. 
 *
 * @return: { $.oPoint }                           Returns the $.oPoint average of provided points.
 */
$.oPoint.prototype.pointAverage = function( point_array ){
  var _avg = new this.$.oPoint( 0.0, 0.0, 0.0 );
  for( var x=0;x<point_array.length;x++ ){
    _avg.pointAdd( point_array[x] );
  }
  _avg.divide( point_array.length );
  
  return _avg;
}

/**
 * Uses the scene settings to convert this as a worldspace point into an OpenGL point, used in underlying transformation operations in Harmony.
 */
$.oPoint.convertToOpenGL = function(){
  
  var qpt = scene.toOGL( new QPoint( this.x, this.y, this.z ) );
  
  this.x = qpt.x;
  this.y = qpt.y;
  this.z = qpt.z;
  
}

/**
 * Uses the scene settings to convert this as an OpenGL point into a Harmony worldspace point, used in all displayed modules and Harmony coordinates.
 */
$.oPoint.convertToWorldspace = function(){

  var qpt = scene.fromOGL( new QPoint( this.x, this.y, this.z ) );
  
  this.x = qpt.x;
  this.y = qpt.y;
  this.z = qpt.z;

}


/**
 * Linearily Interpolate between this (0.0) and the provided point (1.0)
 * @param   {$.oPoint}       point                The target point at 100%
 * @param   {double}       perc                 0-1.0 value to linearily interp
 *
 * @return: { $.oPoint }                          The interpolated value.
 */
$.oPoint.prototype.lerp = function( point, perc ){
  var delta = new this.$.oPoint( point.x, point.y, point.z );
 
  delta = delta.pointSubtract( this );
  delta.multiply( perc );
  delta.pointAdd( this );
  
  return delta;
}

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
$.oBox = function( left, top, right, bottom ){
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
 * The width of the box.
 * @name $.oBox#width
 * @type {float}
 */
Object.defineProperty($.oBox.prototype, 'width', {
  get : function(){
    return this.right - this.left + 1; //Inclusive size.
  }
})
 
 
/**
 * The height of the box.
 * @name $.oBox#height
 * @type {float}
 */
Object.defineProperty($.oBox.prototype, 'height', {
  get : function(){
    return this.bottom - this.top;
  }
})
 
 
/**
 * The center of the box.
 * @name $.oBox#center
 * @type {$.oPoint}
 */
Object.defineProperty($.oBox.prototype, 'center', {
  get : function(){
    return new this.$.oPoint(this.left+this.width/2, this.top+this.height/2);
  }
})
 
 
/**
 * Adds the input box to the bounds of the current $.oBox.
 * @param   {$.oBox}       box                The $.oBox to include.                    
 */
$.oBox.prototype.include = function(box){
  if (box.left < this.left) this.left = box.left;
  if (box.top < this.top) this.top = box.top;
  if (box.right > this.right) this.right = box.right;
  if (box.bottom > this.bottom) this.bottom = box.bottom;
}

/**
 * Adds the bounds of the nodes to the current $.oBox.
 * @param   {oNode[]}       oNodeArray                An array of nodes to include in the box.                 
 */
$.oBox.prototype.includeNodes = function(oNodeArray){
  // convert to array if only one node is passed
  if (!Array.isArray(oNodeArray)) oNodeArray = [oNodeArray];
  
  for (var i in oNodeArray){
     var _node = oNodeArray[i];
     var _nodeBox = _node.bounds;
      
     this.include(_nodeBox);
  } 
}


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           $.oTools class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * The $.oUtils helper class -- providing generic utilities.
 * @constructor
 * @classdesc  $.tools utility Class
 */
$.oUtils = function(){
    this._type = "tools";
}

/**
 * Copies the file to the folder.
 * @param   {string}   [folder]                Content to write to the file.
 * @param   {string}   [copyName]              Name of the copied file.
 * @param   {bool}     [overwrite]             Whether to overwrite the file.   
 *  
 * @return: { object }                           The result of the copy.     
 */
$.oUtils.prototype.longestCommonSubstring = function( str1, str2 ){
	if (!str1 || !str2)
		return {
			length: 0,
			sequence: "",
			offset: 0
		};
 
	var sequence = "",
		str1Length = str1.length,
		str2Length = str2.length,
		num = new Array(str1Length),
		maxlen = 0,
		lastSubsBegin = 0;
 
	for (var i = 0; i < str1Length; i++) {
		var subArray = new Array(str2Length);
		for (var j = 0; j < str2Length; j++)
			subArray[j] = 0;
		num[i] = subArray;
	}
	var subsBegin = null;
	for (var i = 0; i < str1Length; i++){
		for (var j = 0; j < str2Length; j++){
			if (str1[i] !== str2[j]){
				num[i][j] = 0;
			}else{
				if ((i === 0) || (j === 0)){
					num[i][j] = 1;
				}else{
					num[i][j] = 1 + num[i - 1][j - 1];
        }
				if (num[i][j] > maxlen){
					maxlen = num[i][j];
					subsBegin = i - num[i][j] + 1;
					if (lastSubsBegin === subsBegin){//if the current LCS is the same as the last time this block ran
						sequence += str1[i];
					}else{
            //this block resets the string builder if a different LCS is found
						lastSubsBegin = subsBegin;
						sequence= ""; //clear it
						sequence += str1.substr(lastSubsBegin, (i + 1) - lastSubsBegin);
					}
				}
			}
		}
	}
	return {
		length: maxlen,
		sequence: sequence,
		offset: subsBegin
	};
}