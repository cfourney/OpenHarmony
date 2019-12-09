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
//          $.oFrame class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
/**
 * The base class for the $.oFrame.
 * @constructor
 * @classdesc  $.oFrame Base Class
 * @param   {int}                    frameNumber             The frame to which this references.
 * @param   {oColumn}                oColumnObject           The column to which this frame references.
 * @param   {int}                    subColumns              The subcolumn index.
 *
 * @property {int}                     frameNumber           The frame to which this references.
 * @property {oColumn}                 column                The oColumnObject to which this frame references.
 * @property {oAttribute}              attributeObject       The oAttributeObject to which this frame references.
 * @property {int}                     subColumns            The subcolumn index.
 */
$.oFrame = function( frameNumber, oColumnObject, subColumns ){
  this._type = "frame";
  
  if (typeof subColumns === 'undefined') var subColumns = 0;

  this.frameNumber = frameNumber;
  
  if( oColumnObject._type == "attribute" ){  //Direct access to an attribute, when not keyable. We still provide a frame access for consistency.
    this.column = false;
    this.attributeObject = oColumnObject;
  }else{
    this.column = oColumnObject;
    this.attributeObject = this.column.attributeObject;
  }
  
  this.subColumns = subColumns;
}
 
 
// $.oFrame Object Properties
/**
 * The value of the frame. Contextual to the attribute type.
 * @name $.oFrame#value
 * @type {object}
 */
Object.defineProperty($.oFrame.prototype, 'value', {
    get : function(){
        // this.$.log("Getting value of frame "+this.frameNumber+" of column "+this.column.name) 
      return this.attributeObject.getValue( this.frameNumber );
    },
 
    set : function(newValue){
        // this.$.log("Setting frame "+this.frameNumber+" of column "+this.column.name+" to value: "+newValue)
        this.attributeObject.setValue( newValue, this.frameNumber );   
    }
});
 

/**
 * Set or identify whether the frame is a keyframe.
 * @return: {bool}   
 */
 
/**
 * Whether the frame is a keyframe.
 * @name $.oFrame#isKeyFrame
 * @type {bool}
 */
Object.defineProperty($.oFrame.prototype, 'isKeyFrame', {
    get : function(){
      if( !this.column ) return true;
    
      var _column = this.column.uniqueName
      if (this.column.type == 'DRAWING' || this.column.type == 'TIMING'){
        if( column.getTimesheetEntry){
          return !column.getTimesheetEntry(_column, 1, this.frameNumber).heldFrame;
        }else{
          return false;   //No valid way to check for keys on a drawing without getTimesheetEntry
        }
      }else if (['BEZIER', '3DPATH', 'EASE', 'QUATERNION'].indexOf(this.column.type) != -1){
          return column.isKeyFrame(_column, 1, this.frameNumber);
      }
      return false
    },
 
    set : function(keyFrame){
      var col = this.column;
      if( !col ) return;
      
      var _column = col.uniqueName;
      
      if( col.type == "DRAWING" ){
        if (keyFrame){
          column.addKeyDrawingExposureAt( _column, this.frameNumber );
        }else{
          column.removeKeyDrawingExposureAt( _column, this.frameNumber );
        }
      }else{
        if (keyFrame){
            //Sanity check, in certain situations, the setKeyframe resets to 0 (specifically if there is no pre-existing key elsewhere.)
            //This will check the value prior to the key, set the key, and enforce the value after.
            
            var val = 0.0;
            // try{
              var val = this.value;
            // }catch(err){}
          
            column.setKeyFrame( _column, this.frameNumber );
            
            // try{
              var post_val = this.value;
              if( val != post_val ){
                this.value = val
              }
            // }catch(err){}         
        }else{
            column.clearKeyFrame( _column, this.frameNumber );
        }
      }
    }
});
 

/**
 * Whether the frame is a keyframe.
 * @name $.oFrame#isKey
 * @type {bool}
 */
Object.defineProperty($.oFrame.prototype, 'isKey', {
    get : function(){
      return this.isKeyFrame;
    },
 
    set : function(keyFrame){
      this.isKeyFrame = keyFrame;
    }
});
 
 
/**
 * The duration of the keyframe exposure of the frame.
 * @name $.oFrame#duration
 * @type {int}
 */
Object.defineProperty($.oFrame.prototype, 'duration', {
    get : function(){
        var _startFrame = this.startFrame;
        var _sceneLength = frame.numberOf()
        
        if( !this.column ){
          return _sceneLength;
        }

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
});
 
 
/**
 * Identifies if the frame is blank/empty.
 * @name $.oFrame#isBlank
 * @type {int}
 */
Object.defineProperty($.oFrame.prototype, 'isBlank', {
    get : function(){
      var col = this.column;
      if( !col ){
        return false;
      }
      
      if ( col.type != "DRAWING") return false;
      
      if( !column.getTimesheetEntry ){
        return (this.value == "");
      }
      
      return column.getTimesheetEntry( col.uniqueName, 1, this.frameNumber ).emptyCell;
    },
    
    set : function( val ){
      throw "Not implemented.";
    }
});
 

/**
 * Identifies the starting frame of the exposed drawing.
 * @name $.oFrame#startFrame
 * @type {int}
 */
Object.defineProperty($.oFrame.prototype, 'startFrame', {
    get : function(){
      if( !this.column ){
        return 1;
      }
    
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
});
 
 
/**
 * Returns the drawing types used in the drawing column. K = key drawings, I = inbetween, B = breakdown
 * @name $.oFrame#marker
 * @type {string}
 */
Object.defineProperty($.oFrame.prototype, 'marker', {
    get : function(){
        if( !this.column ){
          return "";
        }
      
        var _column = this.column;
        if (_column.type != "DRAWING") return "";
        return column.getDrawingType(_column.uniqueName, this.frameNumber);
    },
   
    set: function( marker ){
        if( !this.column ){
          return;
        }
        
        var _column = this.column;
        if (_column.type != "DRAWING") throw "can't set 'marker' property on columns that are not 'DRAWING' type"
        column.setDrawingType( _column.uniqueName, this.frameNumber, marker );
    }
});
 
 
/**
 * Find the index of this frame in the corresponding columns keyframes. -1 if unavailable.
 * @name $.oFrame#keyframeIndex
 * @type {int}
 */
Object.defineProperty($.oFrame.prototype, 'keyframeIndex', {
    get : function(){
        var _kf = this.column.getKeyFrames().map(function(x){return x.frameNumber});
        var _kfIndex = _kf.indexOf(this.frameNumber);
        return _kfIndex;
    }
});
 
 
/**
 * Find the the nearest keyframe to this, on the left. Returns itself if it is a key.
 * @name $.oFrame#keyframeLeft
 * @type {oFrame}
 */
Object.defineProperty($.oFrame.prototype, 'keyframeLeft', {
    get : function(){
        var kfs = this.column.getKeyFrames();
        var lkf = false;
        
        for( var n=0;n<kfs.length;n++ ){
          if( kfs[n].frameNumber <= this.frameNumber ){
            lkf = kfs[n];
          }else{
            return lkf;
          }
        }
        return lkf;
    }
});
 
 
/**
 * Find the the nearest keyframe to this, on the right.
 * @name $.oFrame#keyframeRight
 * @type {oFrame}
 */
Object.defineProperty($.oFrame.prototype, 'keyframeRight', {
    get : function(){
        var kfs = this.column.getKeyFrames();       
        for( var n=0;n<kfs.length;n++ ){
          if( kfs[n].frameNumber > this.frameNumber ){
            return kfs[n];
          }
        }
        return false;
    }
});
 
 
/**
 * Whether the frame is tweened or constant. Uses nearest keyframe if this frame isnt.
 * @name $.oFrame#constant
 * @type {string}
 */
Object.defineProperty($.oFrame.prototype, 'constant', {
    get : function(){
      if(!this.column){
        return false;
      }
      
      var _column = this.column.uniqueName;
      var idx_pt  = 0;
      
      for( var np=0; np<func.numberOfPoints(_column);np++ ){
        if( func.pointX( _column, np ) <= this.frameNumber ){
          idx_pt = np;
        }else{
          break;
        }
      }
      
      return func.pointConstSeg( _column, idx_pt );
    }, 
    set : function( new_constant ){
      if( this.column ){
        var _column = this.column.uniqueName;
        
        var frame = this.keyframeLeft;    //Works on the left keyframe, in the event that this is not a keyframe itself.
        if( !frame ){ return; }
        
        if( frame.column.easeType == "BEZIER" ){
          var easeIn  = frame.easeIn;
          var easeOut = frame.easeOut;
          func.setBezierPoint( _column, frame.frameNumber, frame.value, easeIn.x, easeIn.y, easeOut.x, easeOut.y, new_constant, frame.continuity );
          
        }else if( frame.column.easeType == "EASE" ){
          var easeIn  = frame.easeIn;
          var easeOut = frame.easeOut;
          
          func.setEasePoint( _column, frame.frameNumber, frame.value, easeIn.frame, easeIn.angle, easeOut.frame, easeOut.angle, new_constant, frame.continuity );
        }
      }
    }
});

/**
 * Identifies or sets whether there is a tween. Inverse of constant.
 * @name $.oFrame#tween
 * @type {string}
 */
Object.defineProperty($.oFrame.prototype, 'tween', {
    get : function(){
      return !this.constant;
    }, 
    set : function( new_tween ){
      this.constant = !new_tween;
    }
});
/**
 * Determines the frame's continuity, smooth or otherwise.
 * @name $.oFrame#continuity
 * @type {string}
 */
Object.defineProperty($.oFrame.prototype, 'continuity', {
    get : function(){
        // Not a valid property for non keyframes and blank frames
        var _kfIndex = this.keyframeIndex;
        if ( _kfIndex == -1 ) return null;
        if ( this.isBlank ) return null;

        var _column = this.column.uniqueName;
        var _smooth = func.pointContinuity( _column, _kfIndex );

        return _smooth;
    }, 
    set : function( new_continuity ){
      throw "Not yet implemented";
    }
});

/**
 * Gets the ease parameter of the segment, easing into this frame.
 * @name $.oFrame#easeIn
 * @type {oPoint/object}
 */
Object.defineProperty($.oFrame.prototype, 'easeIn', {
    get : function(){
        // Not a valid property for non keyframes and blank frames
        var _kfIndex = this.keyframeIndex;
        if (_kfIndex == -1) return null;
        if (this.isBlank) return null;

        var _column = this.column.uniqueName;

        if(this.column.easeType == "BEZIER"){
            var _leftHandleX = func.pointHandleLeftX (_column, _kfIndex);
            var _leftHandleY = func.pointHandleLeftY (_column, _kfIndex);
            return new this.$.oPoint (_leftHandleX, _leftHandleY, 0);
        }

        if(this.column.easeType == "EASE"){
            var _frames = func.pointEaseIn(_column, _kfIndex);
            var _angle = func.angleEaseIn(_column, _kfIndex);
            return {frames: _frames, angle: _angle}
        }

    },

    set : function(newEaseIn){
        // Not a valid property for non keyframes and blank frames
        var _kfIndex = this.keyframeIndex;
        if (_kfIndex == -1) throw new Error("can't set ease on a non keyframe");
        if (this.isBlank) throw new Error("can't set ease on an empty frame");

        var _column = this.column.uniqueName;

        if(this.column.easeType == "BEZIER"){
            // Provided easeIn parameter must be a point object representing the left bezier
            var _rightHandle = this.easeOut;
            
            func.setBezierPoint (_column, this.frameNumber, this.value, newEaseIn.x, newEaseIn.y, _rightHandle.x, _rightHandle.y, this.continuity == "CONSTANT", this.continuity)
        }

        if(this.column.easeType == "EASE"){
            // Provided easeIn parameter must be an object with a 'frame' and 'angle' property
            var _easeOut = this.easeOut;

            func.setEasePoint (_column, this.frameNumber, this.value, newEaseIn.frame, newEaseIn.angle, _easeOut.frame, _easeOut.angle, this.continuity== "CONSTANT", this.continuity)
        }
    }
});


/**
 * Gets the ease parameter of the segment, easing out of this frame.
 * @name $.oFrame#easeOut
 * @type {oPoint/object}
 */
Object.defineProperty($.oFrame.prototype, 'easeOut', {
    get : function(){
        // Not a valid property for non keyframes and blank frames
        var _kfIndex = this.keyframeIndex;
        if (_kfIndex == -1) return null;
        if (this.isBlank) return null;

        var _column = this.column.uniqueName;

        if(this.column.easeType == "BEZIER"){
            var _rightHandleX = func.pointHandleRightX (_column, _kfIndex);
            var _rightHandleY = func.pointHandleRightY (_column, _kfIndex);
            return new this.$.oPoint (_rightHandleX, _rightHandleY, 0);
        }

        if(this.column.easeType == "EASE"){
            var _frames = func.pointEaseOut(_column, _kfIndex);
            var _angle = func.angleEaseOut(_column, _kfIndex);
            return {frames: _frames, angle: _angle}
        }
    },

    set : function(newEaseOut){
        // Not a valid property for non keyframes and blank frames
        var _kfIndex = this.keyframeIndex;
        if (_kfIndex == -1) throw new Error("can't set ease on a non keyframe");
        if (this.isBlank) throw new Error("can't set ease on an empty frame");

        var _column = this.column.uniqueName;

        if(this.column.easeType == "BEZIER"){
            // Provided newEaseOut parameter must be a point object representing the left bezier
            var _leftHandle = this.easeIn;
            func.setBezierPoint( _column, this.frameNumber, this.value, _leftHandle.x, _leftHandle.y, newEaseOut.x, newEaseOut.y, this.continuity == "CONSTANT", this.continuity)
        }

        if(this.column.easeType == "EASE"){
            // Provided easeIn parameter must be an object with a 'frame' and 'angle' property
            var _easeIn = this.easeIn;

            func.setEasePoint( _column, this.frameNumber, this.value, _easeIn.frame, _easeIn.angle, newEaseOut.frame, newEaseOut.angle, this.continuity == "CONSTANT", this.continuity)
        }
    }
});
 
 
 
 
 
/**
 * Extends the frames value to the specified duration, replaces in the event that replace is specified.
 * @param   {int}        duration              The duration to extend it to; if no duration specified, extends to the next available keyframe.
 * @param   {bool}       replace               Setting this to false will insert frames as opposed to overwrite existing ones.
 */
$.oFrame.prototype.extend = function( duration, replace ){
    if (typeof replace === 'undefined') var replace = true;
    // setting this to false will insert frames as opposed to overwrite existing ones
 
    if( !this.column ){
      return;
    }
 
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
