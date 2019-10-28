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
 * The oPoint helper class - representing a 3D point.
 * @constructor
 * @classdesc  oPoint Base Class
 * @param     {float}              x                              Horizontal coordinate
 * @param     {float}              y                              Vertical coordinate
 * @param     {float}             [z]                             Depth Coordinate
 *
 * @property     {float}           x                              Horizontal coordinate
 * @property     {float}           y                              Vertical coordinate
 * @property     {float}           z                              Depth Coordinate
 */
oPoint = function(x, y, z){
    if (typeof z === 'undefined') var z = 0;
    
    this._type = "point";
    
    this.x = x;
    this.y = y;
    this.z = z;
}
 
/**
 * Adds the input box to the bounds of the current oBox.
 * @param   {oPoint}       add_pt                The point to add to this point. 
 *
 * @return: { oPoint }                           Returns self (for inline addition).
 */
oPoint.prototype.pointAdd = function( add_pt ){
    this.x += add_pt.x;
    this.y += add_pt.y;
    this.z += add_pt.z;
    
  return this;
}

/**
 * Subtracts the input box to the bounds of the current oBox.
 * @param   {oPoint}       sub_pt                The point to subtract to this point. 
 *
 * @return: { oPoint }                           Returns self (for inline addition).
 */
oPoint.prototype.pointSubtract = function( sub_pt ){
    this.x -= sub_pt.x;
    this.y -= sub_pt.y;
    this.z -= sub_pt.z;
    
  return this;
}

/**
 * Multiply all coordinates by this value.
 * @param   {float}       float_val                Multiply all coordinates by this value. 
 *
 * @return: { oPoint }                           Returns self (for inline addition).
 */
oPoint.prototype.multiply = function( float_val ){
    this.x *= float_val;
    this.y *= float_val;
    this.z *= float_val;
    
  return this;
}

/**
 * Divides all coordinates by this value.
 * @param   {float}       float_val                Divide all coordinates by this value. 
 *
 * @return: { oPoint }                           Returns self (for inline addition).
 */
oPoint.prototype.divide = function( float_val ){
    this.x /= float_val;
    this.y /= float_val;
    this.z /= float_val;
    
  return this;
}


/**
 * Linearily Interpolate between this (0.0) and the provided point (1.0)
 * @param   {oPoint}       point                The target point at 100%
 * @param   {double}       perc                 0-1.0 value to linearily interp
 *
 * @return: { oPoint }                          The interpolated value.
 */
oPoint.prototype.lerp = function( point, perc ){
  var delta = new oPoint( point.x, point.y, point.z );
 
  delta = delta.pointSubtract( this );
  delta.multiply( perc );
  delta.pointAdd( this );
  
  return delta;
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
 * The oBox helper class - representing a 2D box.
 * @constructor
 * @classdesc  oBox Base Class
 * @param      {float}       left                             left horizontal bound
 * @param      {float}       top                              top vertical bound
 * @param      {float}       right                            right horizontal bound
 * @param      {float}       bottom                           bottom vertical bound
 *
 * @property      {float}       left                             left horizontal bound
 * @property      {float}       top                              top vertical bound
 * @property      {float}       right                            right horizontal bound
 * @property      {float}       bottom                           bottom vertical bound
 */
oBox = function( left, top, right, bottom ){
    this._type = "box";

    if (typeof top === 'undefined') var top = Infinity
    if (typeof left === 'undefined') var left = Infinity
    if (typeof right === 'undefined') var right = -Infinity
    if (typeof bottom === 'undefined') var bottom = -Infinity
    
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
}
 
 
/**
 * The width of the box.
 * @name oBox#width
 * @type {float}
 */
Object.defineProperty(oBox.prototype, 'width', {
    get : function(){
         return this.right - this.left + 1; //Inclusive size.
    }
})
 
 
/**
 * The height of the box.
 * @name oBox#height
 * @type {float}
 */
Object.defineProperty(oBox.prototype, 'height', {
    get : function(){
         return this.bottom - this.top;
    }
})
 
 
/**
 * The center of the box.
 * @name oBox#center
 * @type {oPoint}
 */
Object.defineProperty(oBox.prototype, 'center', {
    get : function(){
         return new oPoint(this.left+this.width/2, this.top+this.height/2);
    }
})
 
 
/**
 * Adds the input box to the bounds of the current oBox.
 * @param   {oBox}       box                The oBox to include.                    
 */
oBox.prototype.include = function(box){
    if (box.left < this.left) this.left = box.left;
    if (box.top < this.top) this.top = box.top;
    if (box.right > this.right) this.right = box.right;
    if (box.bottom > this.bottom) this.bottom = box.bottom;
}

/**
 * Adds the bounds of the nodes to the current oBox.
 * @param   {oNode[]}       oNodeArray                An array of nodes to include in the box.                 
 */
oBox.prototype.includeNodes = function(oNodeArray){
    for (var i in oNodeArray){
         var _node = oNodeArray[i];
         var _nodeBox = _node.bounds;
          
         this.include(_nodeBox);
    } 
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
 * The oFolder helper class -- providing utilities for folder manipulation and access.
 * @constructor
 * @classdesc  oFolder Base Class
 * @param      {string}              path                      The path to the folder.
 *
 * @property    {string}             path                      The path to the folder.
 */
oFolder = function(path){
    this._type = "folder";

    this.path = fileMapper.toNativePath(path);
}


/**
 * The name of the folder.
 * @name oFolder#name
 * @type {string}
 */
Object.defineProperty(oFolder.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1)
        return _name;
    }
});


/**
 * The files in the folder.
 * @name oFolder#files
 * @type {oFile[]}
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
 * The folders within this folder.
 * @name oFolder#folders
 * @type {oFile[]}
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
 * The content within the folder -- both folders and files.
 * @name oFolder#content
 * @type {oFile/oFolder[] }
 */
Object.defineProperty(oFolder.prototype, 'content', {
    get: function(){
      var content = this.files;
          content = content.concat( this.folders );
      return content;
    }
});

/**
 * Adds the input box to the bounds of the current oBox.
 * @param   {string}   filter                Filter wildcards for the content of the folder.
 *  
 * @return: { oFile[] }                      The file content of folder.                     
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
 * The oFile helper class -- providing utilities for file manipulation and access.
 * @constructor
 * @classdesc  oFile Base Class
 * @param      {string}              path                     The path to the file.
 *
 * @property    {string}             path                     The path to the file.
 */
oFile = function(path){
    this._type = "file";

    this.path = path.split('\\').join('/')
}


/**
 * The name of the file.
 * @name oFile#name
 * @type {string}
 */
Object.defineProperty(oFile.prototype, 'name', {
    get: function(){
        var _name = this.path.slice(this.path.lastIndexOf("/")+1, this.path.lastIndexOf("."))
        return _name;
    }
})


/**
 * The extension of the file.
 * @name oFile#extension
 * @type {string}
 */
Object.defineProperty(oFile.prototype, 'extension', {
    get: function(){
        var _extension = this.path.slice(this.path.lastIndexOf(".")+1)
        return _extension;
    }
})


//Todo, Size, Date Created, Date Modified
 
 
/**
 * Reads the content of the file.
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
 * Writes to the file.
 * @param   {string}   content               Content to write to the file.
 * @param   {bool}     append                Whether to append to the file.   
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