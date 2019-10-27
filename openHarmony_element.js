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
//          oElement class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

 
/**
 * oElement Class
 * @class

 * @property   name           {string}                       The name of the node.
 * @property   path           {string}                       The folder path of the element on the filesystem.
 * @property   drawings       {[oDrawing]}                   The drawings available in the element.
 
 * @function   {void}         addDrawing( atFrame, name, filename )                                 Adds a drawing to the element.
 * @function   {void}         getDrawingByName( name )                                              Gets a drawing object by the name.
 * @function   {void}         linkPalette( paletteFile )                                            Not yet implemented.
*/
function oElement ( id, oColumnObject){
  this._type = "element";
  this.$     = false;
  
  this.id = id;
  this.column = oColumnObject;
}


// oElement Object Properties

/**
 * .name
 * @return: {string}   The name of the column.
 */
Object.defineProperty(oElement.prototype, 'name', {
    get : function(){
         return element.getNameById(this.id)
    },
 
    set : function(newName){
         element.renameById(this.id, newName);
    }
})


/**
 * .path
 * @return: {string}   The folder path of the element on the filesystem.
 */
Object.defineProperty(oElement.prototype, 'path', {
    get : function(){
         return fileMapper.toNativePath(element.completeFolder(this.id))
    }
})
 
 
/**
 * .drawings
 * @return: { [oDrawing] }   The drawings available in the element.
 */
Object.defineProperty(oElement.prototype, 'drawings', {
    get : function(){
        var _drawingsNumber = Drawings.numberOf(this.id)
        var _drawings = [];
        for (var i=0; i<_drawingsNumber; i++){
            _drawings.push( new oDrawing(Drawing.name(this.id, i), this) );
        }
        return _drawings;
    }
})
 
 
// oElement Class methods
/**
 * addDrawing
 *
 * Summary: Adds a drawing to the element.
 * @param   {int}        atFrame              The exposures to extend. If UNDEFINED, extends all keyframes.
 * @param   {name}       name                 The name of the drawing to add.
 * @param   {bool}       filename             The filename for the drawing to add.
 *  
 * @return: { oDrawing } The added drawing
 */
oElement.prototype.addDrawing = function( atFrame, name, filename ){
    if (typeof filename === 'undefined') var filename = false;
    if (typeof name === 'undefined') var name = atFrame+''
   
    var fileExists = filename?true:false;
    // TODO deal with fileExists and storeInProjectFolder
    Drawing.create (this.id, name, fileExists, true);
   
    if (filename){
        //copy the imported file at the newly created drawing place
        var _file = Drawing.filename( this.id, name );
        //MessageLog.trace(_file)
       
        var _frameFile = new oFile( filename );
        _frameFile.move( _file, true );
       
    }
   
    // place drawing on the column at the provided frame
    if (this.column != null || this.column != undefined)
        column.setEntry(this.column.uniqueName, 1, atFrame, name)
   
    return new oDrawing( name, this );
}
 

/**
 * getDrawingByName
 *
 * Summary: Gets a drawing object by the name.
 * @param   {string}        name              The name of the drawing to get.
 *  
 * @return: { oDrawing } The added drawing
 */
oElement.prototype.getDrawingByName = function ( name ){
    return new oDrawing( name, this );
}
 
/**
 * linkPalette
 *
 * Summary: Not yet implemented.
 * @param   {string}        paletteFile              The path to the palette file to link.
 *  
 * @return: { void }
 */
oElement.prototype.linkPalette = function ( paletteFile ){
  throw "Not yet implemented";
}