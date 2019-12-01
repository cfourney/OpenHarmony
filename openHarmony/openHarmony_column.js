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
//          $.oColumn class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * The base class for the column.
 * @constructor
 * @classdesc  $.oColumn Class
 * @param   {string}                   uniqueName                  The unique name of the column.
 * @param   {$.oAttribute}             oAttributeObject            The oAttribute thats connected to the column.
 *
 * @property {string}                  uniqueName                  The unique name of the column.
 * @property {$.oAttribute}            attributeObject             The attribute object that the column is attached to.
 */
$.oColumn = function( uniqueName, oAttributeObject ){
  this._type = "column";
  
  this.uniqueName = uniqueName;
  this.attributeObject = oAttributeObject;
  
  //Helper cache for subsequent actions.
  if( !this.$.cache_columnToNodeAttribute ){ this.$.cache_columnToNodeAttribute = {}; }
  if( !this.$.cache_columnToNodeAttribute[this.uniqueName] ){ this.$.cache_columnToNodeAttribute[this.uniqueName] = []; }
  
  this.$.cache_columnToNodeAttribute[this.uniqueName].push( { "node":oAttributeObject.node, "attribute": this } );
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
 * The type of the column.
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
        System.println( "TODO" );
        
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
        var _frames = new Array(frame.numberOf()+1);
        for (var i=1; i<_frames.length; i++){
            _frames[i] = new this.$.oFrame( i, this );
        }
        return _frames;
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
})
 
 
// $.oColumn Class methods
 
/**
 * Extends the exposure of the drawing's keyframes given the provided arguments.
 * @deprecated
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
    var _frames = this.frames;
    _frames = _frames.filter(function(x){return x.isKeyFrame});
    return _frames;
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
 * The extension class for drawing columns.
 * @constructor
 * @classdesc  $.oDrawingColumn Class
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
 * Provides the drawing element attached to the column.
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
 * @param   {bool}        replace              Setting this to false will insert frames as opposed to overwrite existing ones.
 */
$.oDrawingColumn.prototype.extendExposures = function( exposures, amount, replace){
    // if amount is undefined, extend function below will automatically fill empty frames
    if (typeof exposures === 'undefined') var exposures = this.getKeyFrames();
 
    //MessageBox.information("extendingExposures "+exposures.map(function(x){return x.frameNumber}))
    for (var i in exposures) {
        //MessageBox.information(i+" extending: "+exposures[i])
        //MessageBox.information(exposures[i].isBlank)
        if (!exposures[i].isBlank) exposures[i].extend(amount, replace);
    }
}