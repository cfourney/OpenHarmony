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
//          $.oElement class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The base class for the $.oElement.<br> Elements hold the drawings displayed by a "READ" Node or Drawing Node. They can be used to create new drawings, rename them, etc.
 * @constructor
 * @classdesc  $.oElement Class
 * @param   {int}                   id                          The element ID.
 * @param   {$.oColumn}             oColumnObject               The column object associated to the element.
 *
 * @property {int}                  id                          The element ID.
 * @property {$.oColumn}            oColumnObject               The column object associated to the element.
 */
$.oElement = function( id, oColumnObject){
  this._type = "element";
  
  this.id = id;
  this.column = oColumnObject;
}

// $.oElement Object Properties

/**
 * The name of the element.
 * @name $.oElement#name
 * @type {string}
 */
Object.defineProperty($.oElement.prototype, 'name', {
    get : function(){
         return element.getNameById(this.id)
    },
 
    set : function(newName){
         element.renameById(this.id, newName);
    }
})


/**
 * The folder path of the element on the filesystem.
 * @name $.oElement#path
 * @type {string}
 */
Object.defineProperty($.oElement.prototype, 'path', {
    get : function(){
         return fileMapper.toNativePath(element.completeFolder(this.id))
    }
})
 
 
/**
 * The drawings available in the element.
 * @name $.oElement#drawings
 * @type {$.oDrawing[]}
 */
Object.defineProperty($.oElement.prototype, 'drawings', {
    get : function(){
        var _drawingsNumber = Drawing.numberOf(this.id);
        var _drawings = [];
        for (var i=0; i<_drawingsNumber; i++){
            _drawings.push( new this.$.oDrawing(Drawing.name(this.id, i), this) );
        }
        return _drawings;
    }
})
 

/**
 * The file format of the element.
 * @name $.oElement#format
 * @type {string}
 */
Object.defineProperty($.oElement.prototype, 'format', {
    get : function(){
        var _type = element.pixmapFormat(this.id);
        if (_type == "SCAN") _type = "TVG";
        return _type;
    }
})

 
// $.oElement Class methods

/**
 * Adds a drawing to the element. Provide a filename to import an external file as a drawing.
 * @param   {int}        atFrame              The exposures to extend. If UNDEFINED, extends all keyframes.
 * @param   {name}       name                 The name of the drawing to add.
 * @param   {bool}       filename             The filename for the drawing to add.
 *  
 * @return {$.oDrawing}      The added drawing
 */
$.oElement.prototype.addDrawing = function( atFrame, name, filename ){
    if (typeof filename === 'undefined') var filename = false;
    if (typeof name === 'undefined') var name = atFrame+'';
   
    var _fileExists = !!filename; // convert to bool
    // TODO deal with fileExists and storeInProjectFolder
    Drawing.create (this.id, name, _fileExists, true);
   
    if (filename){
        //copy the imported file at the newly created drawing place
        var _file = new this.$.oFile(Drawing.filename(this.id, name));
       
        var _frameFile = new this.$.oFile( filename );
        _frameFile.copy( _file.folder.path, _file.name, true );
    }
   
    // place drawing on the column at the provided frame
    if (this.column != null || this.column != undefined){
      column.setEntry(this.column.uniqueName, 1, atFrame, name);
    }
   
    return new this.$.oDrawing( name, this );
}
 

/**
 * Gets a drawing object by the name.
 * @param   {string}     name              The name of the drawing to get.
 * 
 * @return { $.oDrawing }      The drawing found by the search
 */
$.oElement.prototype.getDrawingByName = function ( name ){
    return new this.$.oDrawing( name, this );
}

 
/**
 * Link a provided palette to an element as an Element palette.
 * @param   {$.oPalette}    oPaletteObject              The oPalette object to link
 * @param   {int}           [listIndex]              The index in the element palette list at which to add the newly linked palette
 * @return  {$.oPalette}    The linked element palette.
 */
$.oElement.prototype.linkPalette = function ( oPaletteObject , listIndex){
  var _paletteList = PaletteObjectManager.getPaletteListByElementId(this.id);
  
  if (typeof listIndex === 'undefined') var listIndex = _paletteList.numPalettes;
  var _palette = _paletteList.insertPalette (oPaletteObject.path, index);
  return _palette;
}


/**
 * Duplicate an element.
 * @param   {string}     [name]              The new name for the duplicated element.
 * @return  {$.oElement}      The duplicate element
 */
$.oElement.prototype.duplicate = function(name){
  if (typeof name === 'undefined') var name = this.name;

  var _fieldGuide = element.fieldChart(this.id);
  var _scanType = element.scanType(this.id);

  var _duplicateElement = this.$.scene.addElement(name, this.format, _fieldGuide, _scanType);
  
  var _drawings = this.drawings;
  var _elementFolder = new this.$.oFolder(_duplicateElement.path.slice(0,-1)+"d");
  
  for (var i in _drawings){
    var _drawingFile = new this.$.oFile(_drawings[i].path);
    try{
      _duplicateElement.addDrawing(i, _drawings[i].name, _drawingFile);
      //_drawingFile.copy(_elementFolder, _drawingFile.name.replace(this.name, "d"));
    }catch(err){
      this.debug("could not copy drawing file "+drawingFile.name+" into element "+_duplicateElement.name, this.DEBUG_LEVEL.ERROR);
    }
  }
  return _duplicateElement;
}