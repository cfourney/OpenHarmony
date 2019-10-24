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
//          oPalette class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// oPalette constructor
/**
 * oPalette Class
 * @class

 * @property   id           {string}                         The palette ID.
 * @property   name         {string}                         The palette name. 
 * @property   path         {string}                         The palette path. 
 * @property   selected     {bool}                           Whether the palette is selected in the interface.
 * @property   colors       {[oColor]}                       The oColor objects contained in the palette.
 *
 * @function   {void}       addColor(name, type, colorData)                 Not yet implemented.
 * @function   {void}       remove( removeFile )                            Removes the palette from the Palette List in the scene. Removes it from the filesystem if removeFile is true.  
*/
function oPalette( paletteObject, oSceneObject, paletteListObject ){
  this._type = "palette";
  this.$     = oSceneObject.$;

  this.paletteObject = paletteObject;
  this._paletteList  = paletteListObject;
  this.scene         = oSceneObject;
}
 
 
// oPalette Object Properties

/**
 * .id
 * @return: {string}   The palette ID.
 */
Object.defineProperty(oPalette.prototype, 'id', {
    get : function(){
        return this.paletteObject.id;
    },
 
    set : function(newId){
        // TODO: same as rename maybe? or hardcode the palette ID and reimport it as a file?
        throw "Not yet implemented.";
    }

})


/**
 * .name
 * @return: {string}   The palette name.
 */ 
Object.defineProperty(oPalette.prototype, 'name', {
    get : function(){
         return this.paletteObject.getName();
    },
 
    set : function(newName){
        // TODO: Rename palette file then unlink and relink the palette
        throw "Not yet implemented.";
    }
})
 
 
/**
 * .path
 * @return: {string}   The palette path.
 */ 
Object.defineProperty(oPalette.prototype, 'path', {
    get : function(){
         var _path = this.paletteObject.getPath()
         _path = fileMapper.toNativePath(_path)
         return _path+this.name+".plt"
    },
 
    set : function(newPath){
        // TODO: move palette file then unlink and relink the palette ? Or provide a move() method
        throw "Not yet implemented.";
    }
})


/**
 * .path
 * @return: {bool}   Whether the palette is selected.
 */ 
Object.defineProperty(oPalette.prototype, 'selected', {
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
 * .path
 * @return: {[oColor]}   The oColor objects contained in the palette.
 */ 
Object.defineProperty(oPalette.prototype, 'colors', {
    get : function(){
        var _palette = this.paletteObject
        var _colors = []
        for (var i = 0; i<_palette.nColors; i++){
            _colors.push (new oColor (this, i))
        }
        return _colors
    }
})


// oPalette Class methods
/**
 * addColor
 *
 * Summary: Not yet implemented.
 */
oPalette.prototype.addColor = function (name, type, colorData){
    throw "Not yet implemented.";
}


/**
 * remove
 *
 * Summary: Removes the palette file from the filesystem and palette list.
 * @param   {bool}       removeFile                 Whether the palette file should be removed on the filesystem.
 *  
 * @return: { ... }      The value of the attribute in the native format of that attribute (contextual to the attribute).
 */
oPalette.prototype.remove = function ( removeFile ){
    if (typeof removeFile === 'undefined') var removeFile = false;
    
    this._paletteList.removePaletteById( this.id );
    
    if( removeFile ){
      var _paletteFile = new oFile(this.path)
      _paletteFile.remove();
    }
    
    //Todo: should actually check for its removal.
    return true;
}