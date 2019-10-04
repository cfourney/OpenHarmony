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
//          oPoint class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// oPoint constructor
 
function oPoint (x, y, z){
    if (typeof z === 'undefined') var z = 0;
 
    this.x = x;
    this.y = y;
    this.z = z;
}
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//            oBox class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor
//
// oBox (left, top, right, bottom)
//
// Properties
//
// int top
// int left
// int right
// int bottom
// int width
// int height
// oPoint center
//
// Methods
//
// void include(oBox box)
//
 
 
// oBox constructor
 
function oBox (left, top, right, bottom){
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
}
 
 
// oBox Object Properties
 
// int width
 
Object.defineProperty(oBox.prototype, 'width', {
    get : function(){
         return this.right - this.left;
    }
})
 
 
// int height
 
Object.defineProperty(oBox.prototype, 'height', {
    get : function(){
         return this.bottom - this.top;
    }
})
 
 
// oPoint center
 
Object.defineProperty(oBox.prototype, 'center', {
    get : function(){
         return new oPoint(this.left+this.width/2, this.top+this.height/2)
    }
})
 
 
// oBox Class methods
 
// include(oBox box)
// Extend a box object to encompass another
 
oBox.prototype.include = function(box){
    if (box.left < this.left) this.left = box.left
    if (box.top < this.top) this.top = box.top
    if (box.right > this.right) this.right = box.right
    if (box.bottom > this.bottom) this.bottom = box.bottom
}


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          oFolder class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor:
//
// oFolder(string path)
//
// Properties:
//
// string path
//
// Methods:
//
// array getFiles()
 
function oFolder(path){
    this.path = fileMapper.toNativePath (path)
}


Object.defineProperty(oFolder.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1)
        return _name;
    }
})

 
oFolder.prototype.getFiles = function(filter){
    // returns the list of URIs in a directory that match a filter
    var dir = new QDir;
    dir.setPath(this.path);
    var nameFilters = new Array;
    nameFilters.push ( filter);
    dir.setNameFilters( nameFilters );
    dir.setFilter( QDir.Files );
 
    return files = dir.entryList().map(function(x){return new oFile(dir.path()+"/"+x)});
}

 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           oFile class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
// Constructor:
//
// oFile(string path)
//
// Properties:
//
// string path
//
// Methods:
//
// string readFile()
// bool writeFile(string content(, bool append))
 
function oFile(path){
    this.path = path.split('\\').join('/')
}

// string name

Object.defineProperty(oFile.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1, this.path.lastIndexOf("."))
        return _name;
    }
})

// string extension

Object.defineProperty(oFile.prototype, 'extension', {
    get: function(){
        var _extension = this.path.slice(this.path.lastIndexOf(".")+1)
        return _extension;
    }
})

 
oFile.prototype.readFile = function() {
    var file = new File(this.path);
 
    try {
        if (file.exists) {
            file.open(FileAccess.ReadOnly);
            var string = file.read();
            file.close();
            return string;
        }
    } catch (err) {
        return null
    }
}


oFile.prototype.writeFile = function(content, append){
    if (typeof append === 'undefined') var append = false
   
    var file = new File(this.path);
    try {
        if (append){
            file.open(FileAccess.Append);
        }else{
            file.open(FileAccess.WriteOnly);
        }
        file.write(content);
        file.close();
        return true
    } catch (err) {return false;}
}

