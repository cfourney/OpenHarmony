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
 
// Constructor
//
// oElement (id, columnObject)
//
// Properties
//
// string id
// oColumn column
// string name
// string path
// {[oDrawings]} drawings
//
// Methods
//
// oDrawing addDrawing(int atFrame, string name, string filename)
// oDrawing getDrawingByName(string name)
// linkPalette (oPalette paletteFile)


// NEW
// oElement constructor
 
/**
 * oElement Class
 * @class

 * @property   name           {string}                       The name of the node.
 * @property   path           {string}                       The parent path of the node, the group in which it is contained.
 * @property   fullpath       {string}                       The path of the node in the network.
 * @property   type           {string}                       The type of the node.

 * @function   {oAttribute}       attribute( {string} atribute_str )                                           Get the specific attribute
 * @function   {bool}             linkInNode( {oNode} oNodeObject, {int} inPort, {int} outPort)                Link's this node's in-port to the given module, at the inport and outport indices.
 * @function   {bool}             linkOutNode( {oNode} oNodeObject, {int} outPort, {int} inPort)               Link's this node's out-port to the given module, at the inport and outport indices.
 * @function   {[oNode]}          subNodes( {bool} recurse )                                                   Obtains the nodes contained in the group, allows recursive search.
 * @function   {oNode}            clone()                                                                      Clone the node via copy and paste. WIP, should return the new cloned node.
 * @function   {void}             centerAbove( {[oNode]} oNodeArray, {float} xOffset, {float} yOffset) )       Center this node above the nodes in the array provided.
 * @function   {void}             duplicate( string search_str )                                               WIP
*/
 
 
 
function oElement (id, oColumnObject){
    this.id = id;
    this.column = oColumnObject;
    
    
};


// oElement Object Properties

// NEW
// string name
 
Object.defineProperty(oElement.prototype, 'name', {
    get : function(){
         return element.getNameById(this.id)
    },
 
    set : function(newName){
         element.renameById(this.id, newName);
    }
});


//NEW
// string path
 
Object.defineProperty(oElement.prototype, 'path', {
    get : function(){
         return fileMapper.toNativePath(element.completeFolder(this.id))
    }
});
 
 
// NEW
// {[oDrawings]} drawings
 
Object.defineProperty(oElement.prototype, 'drawings', {
    get : function(){
        var _drawingsNumber = Drawings.numberOf(this.id)
        var _drawings = [];
        for (var i=0; i<_drawingsNumber; i++){
            _drawings.push(new oDrawing(Drawing.name(this.id, i), this))
        }
        return _drawings;
    }
});
 
 
// NEW
// oElement Class methods
 
oElement.prototype.addDrawing = function(atFrame, name, filename){
    if (typeof filename === 'undefined') var filename = false;
    if (typeof name === 'undefined') var name = atFrame+''
   
    var fileExists = filename?true:false;
    // TODO deal with fileExists and storeInProjectFolder
    Drawing.create (this.id, name, fileExists, true);
   
    if (filename){
        //copy the imported file at the newly created drawing place
        var _file = Drawing.filename(this.id, name)
        //MessageLog.trace(_file)
       
        var _frameFile = new oFile(filename)
        _frameFile.move(_file, true)
       
    }
   
    // place drawing on the column at the provided frame
    if (this.column != null || this.column != undefined)
        column.setEntry(this.column.uniqueName, 1, atFrame, name)
   
    return new oDrawing(name, this);
}
 

// NEW
// getDrawingByName(string name)
 
oElement.prototype.getDrawingByName = function (name){
    return new oDrawing(name, this)
}
 

// NEW
// linkPalette
 
oElement.prototype.linkPalette = function (paletteFile){
    // TODO
}