

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oDrawingColumn class      //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oColumn = require("./oColumn.js");

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
function oDrawingColumn ( uniqueName, oAttributeObject ) {
  // $.oDrawingColumn can only represent a column of type 'DRAWING'
    if (column.type(uniqueName) != 'DRAWING') throw new Error("'uniqueName' parameter must point to a 'DRAWING' type node");
    //MessageBox.information("getting an instance of $.oDrawingColumn for column : "+uniqueName)
    var instance = $.oColumn.call(this, uniqueName, oAttributeObject);
    if (instance) return instance;
}


// extends $.oColumn and can use its methods
oDrawingColumn.prototype = Object.create(oColumn.prototype);


/**
 * Retrieve and set the drawing element attached to the column.
 * @name $.oDrawingColumn#element
 * @type {$.oElement}
 */
Object.defineProperty(oDrawingColumn.prototype, 'element', {
    get : function(){
      // get info about synched layer if the column is fetched from the attribute (which is the case most of the time)
      var _synchedLayer = null;
      if (this.attributeObject){
        _synchedLayer = this.attributeObject.layer.getValue();
      }
      return new this.$.oElement(column.getElementIdOfDrawing( this.uniqueName), _synchedLayer, this);
    },

    set : function(oElementObject){
        column.setElementIdOfDrawing( this.uniqueName, oElementObject.id );
        oElementObject.column = this;
    }
})


/**
 * Extends the exposure of the drawing's keyframes by the specified amount.
 * @param   {$.oFrame[]}  [exposures]            The exposures to extend. If not specified, extends all keyframes.
 * @param   {int}         [amount]               The number of frames to add to each exposure. If not specified, will extend frame up to the next one.
 * @param   {bool}        [replace=false]        Setting this to false will insert frames as opposed to overwrite existing ones.(currently unsupported))
 */
oDrawingColumn.prototype.extendExposures = function( exposures, amount, replace){
    // if amount is undefined, extend function below will automatically fill empty frames

    if (typeof exposures === 'undefined' && typeof amount === 'undefined') {
      column.fillEmptyCels (this.name, 1, this.$.scene.length);
      return; // in case of simple call of this function, we fallback on the fastest way to call the vanilla instruction
    }

    if (typeof exposures === 'undefined') var exposures = this.keyframes;

    //this.$.debug("extendingExposures "+exposures.map(function(x){return x.frameNumber})+" by "+amount, this.$.DEBUG_LEVEL.DEBUG)

    // can't extend blank exposures, so we remove them from the list to extend
    exposures = exposures.filter(function(x){return !x.isBlank})

    for (var i in exposures) {
      exposures[i].extend(amount, replace);
    }
}


/**
 * Duplicates a Drawing column.
 * @param {bool}          [duplicateElement=true]     Whether to also duplicate the element. Default is true.
 * @param {$.oAttribute}  [newAttribute]              Whether to link the new column to an attribute at this point.
 *
 * @return {$.oColumn}    The created column.
 */
oDrawingColumn.prototype.duplicate = function(newAttribute, duplicateElement) {
  // duplicate element?
  if (typeof duplicateElement === 'undefined') var duplicateElement = true;
  var _duplicateElement = duplicateElement?this.element.duplicate():this.element;

  var _duplicateColumn = this.$.scene.addColumn(this.type, this.name, _duplicateElement);

  // linking to an attribute if one is provided
  if (typeof newAttribute !== 'undefined'){
    newAttribute.column = _duplicateColumn;
    _duplicateColumn.attributeObject = newAttribute;
  }

  var _frames = this.frames;
  for (var i in _frames){
    var _duplicateFrame = _duplicateColumn.frames[i];
    _duplicateFrame.value = _frames[i].value;
    if (_frames[i].isKeyframe) _duplicateFrame.isKeyframe = true;
  }

  return _duplicateColumn;
}


/**
 * Renames the column's exposed drawings according to the frame they are first displayed at.
 * @param   {string}  [prefix]            a prefix to add to all names.
 * @param   {string}  [suffix]            a suffix to add to all names.
 */
oDrawingColumn.prototype.renameAllByFrame = function(prefix, suffix){
  if (typeof prefix === 'undefined') var prefix = "";
  if (typeof suffix === 'undefined') var suffix = "";

  // get exposed drawings
  var _displayedDrawings = this.getExposedDrawings();
  this.$.debug("Column "+this.name+" has drawings : "+_displayedDrawings.map(function(x){return x.value}), this.$.DEBUG_LEVEL.LOG);

  // remove duplicates
  var _seen = [];
  for (var i=0; i<_displayedDrawings.length; i++){
    var _drawing = _displayedDrawings[i].value;

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
    this.$.debug("renaming drawing "+_drawing+" of column "+this.name+" to "+prefix+_frameNum+suffix, this.$.DEBUG_LEVEL.LOG);
    _drawing.name = prefix+_frameNum+suffix;
  }
}


/**
 * Removes unused drawings from the column.
 * @param   {$.oFrame[]}  exposures            The exposures to extend. If UNDEFINED, extends all keyframes.
 */
oDrawingColumn.prototype.removeUnexposedDrawings = function(){
  var _element = this.element;
  var _displayedDrawings = this.getExposedDrawings().map(function(x){return x.value.name;});
  var _element = this.element;
  var _drawings = _element.drawings;

  for (var i=_drawings.length-1; i>=0; i--){
    this.$.debug("removing drawing "+_drawings[i].name+" of column "+this.name+"? "+(_displayedDrawings.indexOf(_drawings[i].name) == -1), this.$.DEBUG_LEVEL.LOG);
    if (_displayedDrawings.indexOf(_drawings[i].name) == -1) _drawings[i].remove();
  }
}

oDrawingColumn.prototype.getExposedDrawings = function (){
  return this.keyframes.filter(function(x){return x.value != null});
}


/**
 * @private
 */
oDrawingColumn.prototype.toString = function(){
  return "<$.oDrawingColumn '"+this.name+"'>";
}

exports = oDrawingColumn;