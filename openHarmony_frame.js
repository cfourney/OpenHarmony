//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, ...
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
//          oFrame class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
/**
 * oFrame Class
 * @class

 * @property   value           {...}                       The value of the attribute at the given frame.
 * @property   isKeyFrame      {bool}                      Bool specifying if the frame is a keyframe.
 * @property   duration        {int}                       The duration of the keyframe exposure of the frame.
 * @property   isBlank         {bool}                      Identifies if the frame is blank/empty.
 * @property   startFrame      {int}                       Identifies the starting frame of the exposed drawing.
 * @property   marker          {string}                    Returns the drawing types used in the drawing column. K = key drawings, I = inbetween, B = breakdown
 
 *
 * @function   {void}         extend( duration, replace )        Extends the frames value to the specified duration, replaces in the event that replace is specified.
*/
function oFrame( dom, frameNumber, oColumnObject, subColumns ){
  this._type = "frame";
  this.$     = dom;
  
  if (typeof subColumns === 'undefined') var subColumns = 0;

  this.frameNumber = frameNumber;
  this.column = oColumnObject;
  this.attributeObject = this.column.attributeObject;
  this.subColumns = subColumns;
}
 
 
// oFrame Object Properties
/**
 * .value
 * @return: { ... }   The value of the frame.
 */
Object.defineProperty(oFrame.prototype, 'value', {
    get : function(){
        return this.attributeObject.getValue( this.frameNumber );
    },
 
    set : function(newValue){
        this.attributeObject.setValue( newValue, this.frameNumber );   
    }
});
 

/**
 * .isKeyFrame
 * @return: {bool}   Bool specifying if the frame is a keyframe.
 */
Object.defineProperty(oFrame.prototype, 'isKeyFrame', {
    get : function(){
        var _column = this.column.uniqueName
        if (this.column.type == 'DRAWING' || this.column.type == 'TIMING'){
            return !column.getTimesheetEntry(_column, 1, this.frameNumber).heldFrame
        }else if (['BEZIER', '3DPATH', 'EASE', 'QUATERNION'].indexOf(this.column.type) != -1){
            return column.isKeyFrame(_column, 1, this.frameNumber)
        }
        return false
    },
 
    set : function(keyFrame){
        var _column = this.column.uniqueName
        if (keyFrame){
            column.setKeyFrame(_column, this.frameNumber)
        }else{
            column.clearKeyFrame(_column, this.frameNumber)
        }
    }
});
 
 
/**
 * .duration
 * @return: {int}   The duration of the keyframe exposure of the frame.
 */
Object.defineProperty(oFrame.prototype, 'duration', {
    get : function(){
        var _startFrame = this.startFrame;
        var _sceneLength = frame.numberOf()
       
        // walk up the frames of the scene to the next keyFrame to determin duration
        var _frames = this.column.frames
        for (var i=this.frameNumber+1; i<_sceneLength; i++){
            if (_frames[i].isKeyFrame) return _frames[i].frameNumber - _startFrame;
        }
        return _sceneLength - _startFrame;
    },
    
    set : function( val ){
      throw "Not implemented.";
    }
})
 
 
/**
 * .isBlank
 * @return: {bool}   Identifies if the frame is blank/empty.
 */
Object.defineProperty(oFrame.prototype, 'isBlank', {
    get : function(){
        return column.getTimesheetEntry(this.column.uniqueName, 1, this.frameNumber).emptyCell;
    },
    
    set : function( val ){
      throw "Not implemented.";
    }
})
 
/**
 * .startFrame
 * @return: {int}   Identifies the starting frame of the exposed drawing.
 */
Object.defineProperty(oFrame.prototype, 'startFrame', {
    get : function(){
        if (this.isKeyFrame) return this.frameNumber
        if (this.isBlank) return -1;
       
        var _frames = this.column.frames
        for (var i=this.frameNumber-1; i>=1; i--){
            if (_frames[i].isKeyFrame) return _frames[i].frameNumber;
        }
        return -1;
    },
    
    set : function( val ){
      throw "Not implemented.";
    }
})
 
 
/**
 * .marker
 * @return: {string}   Returns the drawing types used in the drawing column. K = key drawings, I = inbetween, B = breakdown
 */
Object.defineProperty(oFrame.prototype, 'marker', {
    get : function(){
        var _column = this.column;
        if (_column.type != "DRAWING") return "";
        return column.getDrawingType(_column.uniqueName, this.frameNumber);
    },
   
    set: function( marker ){
        var _column = this.column;
        if (_column.type != "DRAWING") throw "can't set 'marker' property on columns that are not 'DRAWING' type"
        column.setDrawingType( _column.uniqueName, this.frameNumber, marker );
    }
})
 
 
/**
 * extend
 *
 * Summary: Extends the frames value to the specified duration, replaces in the event that replace is specified.
 * @param   {int}        duration              The duration to extend it to; if no duration specified, extends to the next available keyframe.
 * @param   {bool}       replace               Setting this to false will insert frames as opposed to overwrite existing ones.
 *  
 * @return: { void } No return
 */
oFrame.prototype.extend = function( duration, replace ){
    if (typeof replace === 'undefined') var replace = true;
    // setting this to false will insert frames as opposed to overwrite existing ones
 
    var _frames = this.column.frames;
 
    if (typeof duration === 'undefined'){
        // extend to next non blank keyframe if not set
        var duration = 0;
        var curFrameEnd = this.startFrame + this.duration;
        var sceneLength = frame.numberOf();
       
        // find next non blank keyframe
        while (_frames[ curFrameEnd + duration].isBlank && (curFrameEnd + duration) < sceneLength){
            duration += _frames[curFrameEnd+duration].duration;
        }
       
        // set to sceneEnd if sceneEnd is reached
        if (curFrameEnd+duration >= sceneLength) duration = sceneLength-curFrameEnd+1;
    }
 
    var _value = this.value;
    var startExtending = this.startFrame+this.duration;
   
    for (var i = 0; i<duration; i++){
        if (!replace){
            // TODO : push all other frames back
        }
        _frames[startExtending+i].value = _value;
    }  
}