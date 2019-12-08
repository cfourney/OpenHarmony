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
//          $.oPalette class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// $.oPalette constructor
/**
 * The base class for the $.oPalette.
 * @constructor
 * @classdesc  $.oPalette Base Class
 * @param   {palette}                 paletteObject             The Harmony palette object.
 * @param   {oSceneObject}            oSceneObject              The DOM Scene object.
 * @param   {paletteList}             paletteListObject         The Harmony paletteListObject object.
 *                                                          
 * @property   {palette}                 paletteObject          The Harmony palette object.
 * @property   {oSceneObject}            scene                  The DOM Scene object.
 */
$.oPalette = function( paletteObject, oSceneObject, paletteListObject ){
  this._type = "palette";

  this.paletteObject = paletteObject;
  this._paletteList  = paletteListObject;
  this.scene         = oSceneObject;
}
 
 
// $.oPalette Object Properties
/**
 * The palette ID.
 * @name $.oPalette#id
 * @type {string}
 */
Object.defineProperty($.oPalette.prototype, 'id', {
    get : function(){
        return this.paletteObject.id;
    },
 
    set : function(newId){
        // TODO: same as rename maybe? or hardcode the palette ID and reimport it as a file?
        throw "Not yet implemented.";
    }

})


/**
 * The palette name.
 * @name $.oPalette#name
 * @type {string}
 */
Object.defineProperty($.oPalette.prototype, 'name', {
    get : function(){
         return this.paletteObject.getName();
    },
 
    set : function(newName){
        // TODO: Rename palette file then unlink and relink the palette
        throw "Not yet implemented.";
    }
})
 
 
/**
 * The palette path on disk.
 * @name $.oPalette#path
 * @type {$.oFile}
 */
Object.defineProperty($.oPalette.prototype, 'path', {
    get : function(){
         var _path = this.paletteObject.getPath()
         _path = fileMapper.toNativePath(_path)
         return new this.$.oFile( _path+"/"+this.name+".plt" );
    },
 
    set : function(newPath){
        // TODO: move palette file then unlink and relink the palette ? Or provide a move() method
        throw "Not yet implemented.";
    }
})


/**
 * Whether the palette is selected.
 * @name $.oPalette#selected
 * @type {bool}
 */
Object.defineProperty($.oPalette.prototype, 'selected', {
    get : function(){
        var _currentId = PaletteManager.getCurrentPaletteId()
        return this.id == _currentId;
    },
 
    set : function(isSelected){
        // TODO: find a way to work with index as more than one color can have the same id, also, can there be no selected color when removing selection?
        if (isSelected){
            var _id = this.id;
            PaletteManager.setCurrentPaletteById(_id);
        }
    }
})


/**
 * The oColor objects contained in the palette.
 * @name $.oPalette#colors
 * @type {oColor[]}
 */
Object.defineProperty($.oPalette.prototype, 'colors', {
  get : function(){
    var _palette = this.paletteObject
    var _colors = []
    for (var i = 0; i<_palette.nColors; i++){
      _colors.push (new this.$.oColor (this, i))
    }
    return _colors
  }
})


// $.oPalette Class methods

/**
 * Not yet implemented.
 */
$.oPalette.prototype.addColor = function (name, type, colorData){
  throw "Not yet implemented.";
}



/**
 * Gets a oColor object based on id.
 * @param   {string}     id                          the color id as found in toonboom palette file.
 *  
 * @return: {oColor}     the found oColor object.
 */
// getColorById(id)
$.oPalette.prototype.getColorById = function (id){
  var _colors = this.colors;
  var _ids = _colors.map(function(x){return x.id})
  if (_ids.indexOf(id) != -1) return _colors[_ids.indexOf(id)]
  return null;
}



/**
 *  Removes the palette file from the filesystem and palette list.
 * @param   {bool}       removeFile                 Whether the palette file should be removed on the filesystem.
 *  
 * @return: {bool}       The success-result of the removal.
 */
$.oPalette.prototype.remove = function ( removeFile ){
  if (typeof removeFile === 'undefined') var removeFile = false;
  
  this._paletteList.removePaletteById( this.id );
  
  if( removeFile ){
    var _paletteFile = new this.$.oFile(this.path)
    _paletteFile.remove();
  }
  
  //Todo: should actually check for its removal.
  return true;
}

