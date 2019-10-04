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
//          oColumn class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
// Constructor
//
// oColumn(uniqueName)
//
// Properties
//
// String name
// String type
// Array frames
//
 
function oColumn(uniqueName){
    this.uniqueName = uniqueName;
}
 
 
// oColumn Object Properties
 
// String oColumn.name
 
Object.defineProperty(oColumn.prototype, 'name', {
    get : function(){
         return column.getDisplayName(this.uniqueName)
    },
 
    set : function(newName){
        var _success = column.rename(this.uniqueName, newName)
        if (_success) this.uniqueName = newName;
        return _success
    }
})
 
 
// String type
 
Object.defineProperty(oColumn.prototype, 'type', {
    get : function(){
        return column.type(this.uniqueName)
    }
})
 
 
// Array frames
 
Object.defineProperty(oColumn.prototype, 'frames', {
    get : function(){
        var _frames = new Array(frame.numberOf()+1);
        for (var i=1; i<_frames.length; i++){
            _frames[i] = new oFrame(i, this)
        }
        return _frames;
    }
})
 
 
// oColumn Class methods

oColumn.prototype.duplicate = function() {
    // TODO
}