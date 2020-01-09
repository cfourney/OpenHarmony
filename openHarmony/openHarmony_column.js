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
//          $.oColumn class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * The constructor for the $.oColumn class. 
 * @classdesc  Columns are the objects that hold all the animation information of an attribute. Any animated value in Harmony is so thanks to a column linked to the attribute representing the node parameter. Columns can be added from the scene class, or are directly created when giving a non 1 value when setting an attribute.
 * @constructor
 * @param   {string}                   uniqueName                  The unique name of the column.
 * @param   {$.oAttribute}             oAttributeObject            The oAttribute thats connected to the column.
 *
 * @property {string}                  uniqueName                  The unique name of the column.
 * @property {$.oAttribute}            attributeObject             The attribute object that the column is attached to.
 * @example
 * // You can get the entirety of the columns in the scene by calling:
 * var doc = $.scn;
 * var allColumns = doc.columns;
 *
 * // However, to get a specific column, you can retrieve it from its linked attribute:
 *
 * var myAttribute = doc.nodes[0].attributes.position.x
 * var mycolumn = myAttribute.column;
 *
 * // once you have the column, you can do things like remove duplicates keys to simplify an animation;
 * myColumn.removeDuplicateKeys();
 *
 * // you can extract all the keys to be able to iterate over it:
 * var keyFrames = myColumn.getKeyFrames();
 * 
 * for (var i in keyFrames){
 *   $.log (keyFrames[i].frameNumber);
 * }
 *
 * // you can also link a given column to more than one attribute so they share the same animated values:
 *
 * doc.nodes[0].attributes.position.y.column = myColumn;  // now position.x and position.y will share the same animation on the node.
 */
$.oColumn = function( uniqueName, oAttributeObject ){
  this._type = "column";
  
  this.uniqueName = uniqueName;
  this.attributeObject = oAttributeObject;
  
  this._cacheFrames = [];
  
  //Helper cache for subsequent actions.
  try{
    // fails when the column has no attribute
    if( !this.$.cache_columnToNodeAttribute ){ this.$.cache_columnToNodeAttribute = {}; }
    this.$.cache_columnToNodeAttribute[this.uniqueName] = { "node":oAttributeObject.node, "attribute": this.attributeObject, "date": (new Date()).getTime() };
  }catch(err){}
}


// $.oColumn Object Properties 
/**
 * The name of the column.
 * @name $.oColumn#name
 * @type {string}
 */
Object.defineProperty( $.oColumn.prototype, 'name', {
    get : function(){
         return column.getDisplayName(this.uniqueName);
    },
 
    set : function(newName){
        var _success = column.rename(this.uniqueName, newName)
        if (_success){ 
          this.uniqueName = newName;
        }else{
          throw "Failed to rename the column."
        }
    }
});


/**
 * The type of the column. There are nine column types: drawing (DRAWING), sound (SOUND), 3D Path (3DPATH), Bezier Curve (BEZIER), Ease Curve (EASE), Expression (EXPR), Timing (TIMING) for timing columns, Quaternion path (QUATERNIONPATH) for 3D rotation and Annotation (ANNOTATION) for annotation columns. 
 * @name $.oColumn#type
 * @type {string}
 */
Object.defineProperty( $.oColumn.prototype, 'type', {
    get : function(){
        return column.type(this.uniqueName)
    },
    
    set : function(){
      throw "Not yet implemented."
    }
});
 
 
/**
 * Whether the column is selected.
 * @name $.oColumn#selected
 * @type {bool}
 */
Object.defineProperty($.oColumn.prototype, 'selected', {
    get : function(){
        var sel_num = selection.numberOfColumnsSelected();
        for( var n=0;n<sel_num;n++ ){
          var col = selection.selectedColumn( n );
          if( col == this.uniqueName ){
            return true;
          }
        }
        
        //Also look through the timeline.
        System.println( "TODO: Also look through the timeline" );
        
        return false;
    },
    
    set : function(){
      throw "Not yet implemented."
    }
});


/**
 * An array of the oFrame objects provided by the column.
 * @name $.oColumn#frames
 * @type {$.oFrame[]}
 */
Object.defineProperty($.oColumn.prototype, 'frames', {
    get : function(){
        var frm_cnt = frame.numberOf();
        
        while( this._cacheFrames.length < frame.numberOf()+1 ){
          this._cacheFrames.push( new this.$.oFrame( this._cacheFrames.length, this ) );
        }
        
        return this._cacheFrames;
    },
    
    set : function(){
      throw "Not yet implemented."
    }
});
 

/**
 * An array of the keyframes provided by the column.
 * @name $.oColumn#keyframes
 * @type {$.oFrame[]}
 */
Object.defineProperty($.oColumn.prototype, 'keyframes', {
    get : function(){
      var _frames = this.frames;
      
      var et = this.easeType;
      if( et == "BEZIER" || et == "EASE" ){
        var frm_ret = [];
        var column_name = this.uniqueName;
        for( var np=0; np<func.numberOfPoints( column_name );np++ ){
          var frm_num = func.pointX( column_name, np )
          frm_ret.push( _frames[frm_num] );
        }
        return frm_ret;
      }
      
      _frames = _frames.filter(function(x){return x.isKeyFrame});
      return _frames;
    },
    
    set : function(){
      throw "Not yet implemented."
    }
});


/**
 * Provides the available subcolumns, based on the type of the column.
 * @name $.oColumn#subColumns
 * @type {object}
 */
Object.defineProperty($.oColumn.prototype, 'subColumns', {
    get : function(){
      //CF Note: Not sure of this use.
        if (this.type == "3DPATH"){
            return { x : 1,
                     y : 2,
                     z : 3,
                     velocity : 4}
        }
        return null;
    },
    
    set : function(){
      throw "Not available."
    }
});
 

Object.defineProperty($.oColumn.prototype, 'easeType', {
    get : function(){
        switch(this.type){
            case "BEZIER":
                return "BEZIER";
            case "3DPATH":
                return column.getVelocityType( this.uniqueName );
            default:
                return null;
        }
    },

    set : function (){
        //TODO
        throw new Error("oColumn.easeType (set) - not yet implemented");
    }
})
 
 
// $.oColumn Class methods
 
/**
 * Extends the exposure of the drawing's keyframes given the provided arguments.
 * @deprecated Use oDrawingColumn.extendExposures instead.
 * @param   {$.oFrame[]}  exposures            The exposures to extend. If UNDEFINED, extends all keyframes.
 * @param   {int}         amount               The amount to extend.
 * @param   {bool}        replace              Setting this to false will insert frames as opposed to overwrite existing ones.
 */
$.oColumn.prototype.extendExposures = function( exposures, amount, replace){
    if (this.type != "DRAWING") return false;
    // if amount is undefined, extend function below will automatically fill empty frames
   
    if (typeof exposures === 'undefined') var exposures = this.attributeObject.getKeyFrames();
 
    for (var i in exposures) {
        if (!exposures[i].isBlank) exposures[i].extend(amount, replace);
    }
 
}



/**
 * Removes concurrent/duplicate keys from drawing layers.
 */
$.oColumn.prototype.removeDuplicateKeys = function(){
    var _keys = this.getKeyFrames();
        
    var _pointsToRemove = [];
    var _pointC;
    
    // check the extremities
    var _pointA = _keys[0].value
    var _pointB = _keys[1].value
    if (JSON.stringify(_pointA) == JSON.stringify(_pointB)) _pointsToRemove.push(_keys[0].frameNumber)
    
    for (var k=1; k<_keys.length-2; k++){
        _pointA = _keys[k-1].value
        _pointB = _keys[k].value
        _pointC = _keys[k+1].value
        
        MessageLog.trace(this.attributeObject.keyword+" pointA: "+JSON.stringify(_pointA)+" pointB: "+JSON.stringify(_pointB)+" pointC: "+JSON.stringify(_pointC))
        
        if (JSON.stringify(_pointA) == JSON.stringify(_pointB) && JSON.stringify(_pointB) == JSON.stringify(_pointC)){
            _pointsToRemove.push(_keys[k].frameNumber)
        }
    }
    
    _pointA = _keys[_keys.length-2].value
    _pointB = _keys[_keys.length-1].value
    if (JSON.stringify(_pointC) == JSON.stringify(_pointB)) _pointsToRemove.push(_keys[_keys.length-1].frameNumber)
    
    var _frames = this.frames;

    for (var i in _pointsToRemove){
        _frames[_pointsToRemove[i]].isKeyFrame = false;
    }
    
}


/**
 * Not yet implemented.
 */
$.oColumn.prototype.duplicate = function() {
    throw "Not yet implemented.";
}


/**
 * Filters out only the keyframes from the frames array.
 *
 * @return {$.oFrame[]}    Provides the array of frames from the column.
 */
$.oColumn.prototype.getKeyFrames = function(){
    return this.keyframes;
}



//------------------------------------------------------
//TODO FULL IMPLEMENTATION OF THIS.


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oDrawingColumn class     //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * the $.oDrawingColumn constructor. Only called internally by the factory function [scene.getColumnByName()]{@link $.oScene#getColumnByName};
 * @constructor
 * @classdesc  oDrawingColumn is a special case of column which can be linked to an [oElement]{@link $.oElement}. This type of column is used to display drawings and always is visible in the Xsheet window.
 * @augments   $.oColumn
 * @param   {string}                   uniqueName                  The unique name of the column.
 * @param   {$.oAttribute}             oAttributeObject            The oAttribute thats connected to the column.
 *
 * @property {string}                  uniqueName                  The unique name of the column.
 * @property {$.oAttribute}            attributeObject             The attribute object that the column is attached to.
 */
$.oDrawingColumn = function( uniqueName, oAttributeObject ) {
    // $.oDrawingColumn can only represent a column of type 'DRAWING'
    if (column.type(uniqueName) != 'DRAWING') throw new Error("'uniqueName' parameter must point to a 'DRAWING' type node");
    //MessageBox.information("getting an instance of $.oDrawingColumn for column : "+uniqueName)
    $.oColumn.call(this, uniqueName, oAttributeObject);
}

 
// extends $.oColumn and can use its methods
$.oDrawingColumn.prototype = Object.create($.oColumn.prototype);


/**
 * Retrieve and set the drawing element attached to the column.
 * @name $.oDrawingColumn#element
 * @type {$.oElement}
 */
Object.defineProperty($.oDrawingColumn.prototype, 'element', {
    get : function(){
        return new this.$.oElement(column.getElementIdOfDrawing( this.uniqueName), this);
    },

    set : function(oElementObject){
        column.setElementIdOfDrawing( this.uniqueName, oElementObject.id );
        oElementObject.column = this;
    }
})


/**
 * Extends the exposure of the drawing's keyframes given the provided arguments.
 * @param   {$.oFrame[]}  exposures            The exposures to extend. If UNDEFINED, extends all keyframes.
 * @param   {int}         amount               The amount to extend.
 * @param   {bool}        replace              Setting this to false will insert frames as opposed to overwrite existing ones.(currently unsupported))
 */
$.oDrawingColumn.prototype.extendExposures = function( exposures, amount, replace){
    // if amount is undefined, extend function below will automatically fill empty frames
    if (typeof exposures === 'undefined') var exposures = this.getKeyFrames();
 
    this.$.debug("extendingExposures "+exposures.map(function(x){return x.frameNumber}), this.$.DEBUG_LEVEL.LOG)
    for (var i in exposures) {
        if (!exposures[i].isBlank) exposures[i].extend(amount, replace);
    }
}


/**
 * Renames the column's exposed drawings according to the frame they are first displayed at.
 * @param   {string}  [prefix]            a prefix to add to all names.
 * @param   {string}  [suffix]            a suffix to add to all names.
 */
$.oDrawingColumn.prototype.renameAllByFrame = function(prefix, suffix){
  if (typeof prefix === 'undefined') var prefix = "";
  if (typeof suffix === 'undefined') var suffix = "";
  
  var _displayedDrawings = this.getKeyFrames();
  var _element = this.element;
  var _drawings = _element.drawings;
  
  // remove duplicates
  var _seen = [];
  for (var i=0; i<_displayedDrawings.length; i++){
    var _drawing = _displayedDrawings[i].value
    if (_seen.indexOf(_drawing.name) == -1){
      _seen.push(_drawing.name);
    }else{
      _displayedDrawings.splice(i,1);
      i--;
    }
  }
  
  // rename
  for (var i in _displayedDrawings){
    var _frameNum = _displayedDrawings[i].frameNumber;
    var _drawing = _displayedDrawings[i].value;
    
    _drawing.name = prefix+_frameNum+suffix;
  }
}


/**
 * Removes unused drawings from the column.
 * @param   {$.oFrame[]}  exposures            The exposures to extend. If UNDEFINED, extends all keyframes.
 */
$.oDrawingColumn.prototype.removeUnexposedDrawings = function(){
  var _displayedDrawings = this.getKeyFrames().map(function(x){return x.value.name});
  var _element = this.element;
  var _drawings = _element.drawings;

  for (var i=_drawings.length-1; i>=0; i--){
    if (_displayedDrawings.indexOf(_drawings[i].name) == -1) _drawings[i].remove();
  }
}