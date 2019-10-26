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
 
 
/**
 * oPoint Class
 * @class
 * @constructor      oPoint( {float}x, {float}y, {float}z )    
 * @property         x           {float}                   Horizontal coordinate
 * @property         y           {float}                   Vertical coordinate
 * @property         z           {float}                   Depth Coordinate
 
*/
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
 
 
/**
 * oBox class
 * @class
 * @constructor      oBox( {float} left, {float} top, {float} right, {float} bottom )    
 * @property         left          {float}                   left horizontal bound
 * @property         top           {float}                   top vertical bound
 * @property         right         {float}                   right horizontal bound
 * @property         bottom        {float}                   bottom vertical bound
 * @property         center        {float}                   Center of the box.
 *
 * @function        {float}      include( {oBox} box )       Adds the input box to the bounds of the current oBox
*/
function oBox (left, top, right, bottom){
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
}
 
 
// oBox Object Properties
Object.defineProperty(oBox.prototype, 'width', {
    get : function(){
         return this.right - this.left + 1; //Inclusive size.
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
         return new oPoint(this.left+this.width/2, this.top+this.height/2);
    }
})
 
 
/**
 * include
 *
 * Summary: Adds the input box to the bounds of the current oBox.
 * @param   {oBox}   box                The oBox to include.
 *  
 * @return: {void}                     
 */
oBox.prototype.include = function(box){
    if (box.left < this.left) this.left = box.left;
    if (box.top < this.top) this.top = box.top;
    if (box.right > this.right) this.right = box.right;
    if (box.bottom > this.bottom) this.bottom = box.bottom;
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
 
 
/**
 * oFolder class
 * @class
 * @constructor      oFolder( {string} path )    
 * @property         path          {string}                  path to the folder
 * @property         files         [{oFile}]                 files in the folder
 * @property         folders       [{oFolder}]               folder in the folder
 * @property         content       [{oFolder/oFile}]         content in the folder
 *
 * @function        {float}      include( {oBox} box )       Adds the input box to the bounds of the current oBox
*/
function oFolder(path){
    this.path = fileMapper.toNativePath(path);
}

/**
 * name
 *
 * @return: {string} The name of the folder.
 */
Object.defineProperty(oFolder.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1)
        return _name;
    }
});

/**
 * files
 *
 * @return: {[oFile]} The files in the folder.
 */
Object.defineProperty(oFolder.prototype, 'files', {
    get: function(){
      var dir = new QDir;
      dir.setPath(this.path);
      dir.setFilter( QDir.Files );
   
      return files = dir.entryList().map(function(x){return new oFile(dir.path()+"/"+x)});
    }
});

/**
 * folders
 *
 * @return: {[oFolder]} The folders within the folder.
 */
Object.defineProperty(oFolder.prototype, 'folders', {
    get: function(){
      var dir = new QDir;
      dir.setPath(this.path);
      dir.setFilter( QDir.Dirs );
   
      return files = dir.entryList().map(function(x){return new oFile(dir.path()+"/"+x)});
    }
});

/**
 * content
 *
 * @return: {string} The content within the folder.
 */
Object.defineProperty(oFolder.prototype, 'content', {
    get: function(){
      var content = this.files;
          content = content.concat( this.folders );
      return content;
    }
});

/**
 * getFiles
 *
 * Summary: Adds the input box to the bounds of the current oBox.
 * @param   {string}   filter                Filter wildcards for the content of the folder.
 *  
 * @return: { [oFile] }                      The file content of folder.                     
 */
oFolder.prototype.getFiles = function( filter ){
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
 
 
/**
 * oFile class
 * @class
 * @constructor      oFile( {string} path )    
 * @property         path          {string}                                 path to the file
 * @property         name          {string}                                 name of the file
 * @property         extension     {string}                                 extension of the file
 *                                                                       
 * @function        {string}      read( )                                   Reads the contents of the file.
 * @function        {void}        write( {string} content, {bool} append )  Writes to the file path.
*/
function oFile(path){
    this.path = path.split('\\').join('/')
}

/**
 * name
 *
 * @return: {string} The name of the file.
 */
Object.defineProperty(oFile.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1, this.path.lastIndexOf("."))
        return _name;
    }
})

/**
 * extension
 *
 * @return: {string} The extension of the file.
 */
Object.defineProperty(oFile.prototype, 'extension', {
    get: function(){
        var _extension = this.path.slice(this.path.lastIndexOf(".")+1)
        return _extension;
    }
})


//Todo, Size, Date Created, Date Modified
 
 
/**
 * read
 *
 * Summary: Reads the content of the file.
 *  
 * @return: { string }                      The contents of the file.                     
 */
oFile.prototype.read = function() {
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

 
/**
 * write
 *
 * Summary: Writes to the file.
 * @param   {string}   content               Content to write to the file.
 * @param   {bool}     append                Whether to append to the file.
 *  
 * @return: { void }                         No Return.         
 */
oFile.prototype.write = function(content, append){
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

