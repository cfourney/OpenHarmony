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
//          oFrame class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor
//
// oFrame(frameNumber, oColumnObject, subColumns)
//
// Properties
//
// int frameNumber
// oColumn column
// int subColumns
// various value
// bool isKeyFrame
// int duration
// int startFrame
 
// oFrame constructor
 
function oFrame(frameNumber, oColumnObject, subColumns){
    if (typeof subColumns === 'undefined') var subColumns = 0;
 
    this.frameNumber = frameNumber;
    this.column = oColumnObject;
    this.subColumns = subColumns;
}
 
 
// oFrame Object Properties
 
// various value
 
Object.defineProperty(oFrame.prototype, 'value', {
    get : function(){
        if (this.subColumns == 0){
            return column.getEntry(this.column.uniqueName, 1, this.frameNumber)
        }
        // TODO: deal with subColumns: return an object with all values from subattributes
    },
 
    set : function(newValue){
        // TODO: assign a value to a frame
 
    }
})
 
 
// bool isKeyFrame
 
Object.defineProperty(oFrame.prototype, 'isKeyFrame', {
    get : function(){
        var _column = this.column.uniqueName
        if (this.column.type == 'DRAWING' || this.column.type == 'TIMING'){
            return !column.getTimesheetEntry(_column, 1, this.frameNumber).heldFrame
        }else if (this.column.type == 'BEZIER'){
            return column.isKeyFrame(_column, 1, this.frameNumber)
        }
    },
 
    set : function(){
        // TODO: create key ?
    }
})
 
 
// int duration
 
Object.defineProperty(oFrame.prototype, 'duration', {
    get : function(){
        // TODO
    }
})
 
 
// int startFrame
 
Object.defineProperty(oFrame.prototype, 'startFrame', {
    get : function(){
        // TODO
    }
})