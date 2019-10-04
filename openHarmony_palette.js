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
 
 
// Constructor
//
// oPalette(paletteObject)
//
// Properties
//
// String name
// String path
//
// Methods
 
// oPalette constructor
 
function oPalette(paletteObject){
    this.paletteObject = paletteObject;
}
 
 
// oPalette Object Properties
 
// String name
 
Object.defineProperty(oPalette.prototype, 'name', {
    get : function(){
         return this.paletteObject.getName()
    },
 
    set : function(newName){
        // TODO: Rename palette file then unlink and relink the palette
 
    }
})
 
 
// String path
 
Object.defineProperty(oPalette.prototype, 'path', {
    get : function(){
         var _path = this.paletteObject.getPath()
         _path = fileMapper.toNativePath(_path)
         return _path+this.name+".plt"
    },
 
    set : function(newPath){
        // TODO: move palette file then unlink and relink the palette ? Or provide a move() method
 
    }
})