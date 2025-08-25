//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           $.oFile class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $.oFile helper class -- providing utilities for file manipulation and access.
 * @constructor
 * @classdesc  $.oFile Base Class
 * @param      {string}              path                     The path to the file.
 *
 * @property    {string}             path                     The path to the file.
 */
function oFile (path){
  this._type = "file";
  this._path = fileMapper.toNativePath(path).split('\\').join('/');

  // fix lowercase drive letter
  var path_components = this._path.split("/");
  if (path_components[0] && about.isWindowsArch()){
    // local path that starts with a drive letter
    path_components[0] = path_components[0].toUpperCase()
    this._path = path_components.join("/");
  }
}


/**
 * The name of the file with extension.
 * @name $.oFile#fullName
 * @type {string}
 */
Object.defineProperty(oFile.prototype, 'fullName', {
    get: function(){
        var _name = this.path.slice( this.path.lastIndexOf("/")+1 );
        return _name;
    }
});


/**
 * The name of the file without extenstion.
 * @name $.oFile#name
 * @type {string}
 */
Object.defineProperty(oFile.prototype, 'name', {
    get: function(){
      var _fullName = this.fullName;
      if (_fullName.indexOf(".") == -1) return _fullName;

      var _name = _fullName.slice(0, _fullName.lastIndexOf("."));
      return _name;
    },
    set: function(newName){
      this.rename(newName)
    }
});


/**
 * The extension of the file.
 * @name $.oFile#extension
 * @type {string}
 */
Object.defineProperty(oFile.prototype, 'extension', {
    get: function(){
      var _fullName = this.fullName;
      if (_fullName.indexOf(".") == -1) return "";

      var _extension = _fullName.slice(_fullName.lastIndexOf(".")+1);
      return _extension;
    }
});


/**
 * The folder containing the file.
 * @name $.oFile#folder
 * @type {$.oFolder}
 */
Object.defineProperty(oFile.prototype, 'folder', {
    get: function(){
        var _folder = this.path.slice(0,this.path.lastIndexOf("/"));
        return new this.$.oFolder(_folder);
    }
});


/**
 * Whether the file exists already.
 * @name $.oFile#exists
 * @type {bool}
 */
Object.defineProperty(oFile.prototype, 'exists', {
    get: function(){
        var _file = new File( this.path );
        return _file.exists;
    }
})


/**
 * The path of the file. Setting a path doesn't move the file, only changes where the file object is pointing.
 * @name $.oFile#path
 * @type {string}
 */
Object.defineProperty( oFile.prototype, 'path', {
  get: function(){
    return this._path;
  },

  set: function( newPath ){
    this._path = fileMapper.toNativePath( newPath ).split("\\").join("/");
  }
});


/**
 * The path of the file encoded as a toonboom relative path.
 * @name $.oFile#toonboomPath
 * @readonly
 * @type {string}
 */
Object.defineProperty( oFile.prototype, 'toonboomPath', {
  get: function(){
    var _path = this._path;
    if (!this.$.scene.online) return _path;
    if (_path.slice(0,2) != ("//")) return _path;

    var _pathComponents = _path.replace("//", "").split("/");
    var _drive = (_pathComponents[1]=="usadata000")?_pathComponents[1]:_pathComponents[1].toUpperCase();
    var _path = _pathComponents.slice(2);

    return ["",_drive].concat(_path).join("/");
  }
});


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
    this.$.debug(err, this.$.DEBUG_LEVEL.ERROR)
    return null
  }
}


/**
 * Writes to the file.
 * @param   {string}   content               Content to write to the file.
 * @param   {bool}     [append=false]        Whether to append to the file.
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


/**
 * Moves the file to the specified path.
 * @param   {string}   folder                  destination folder for the file.
 * @param   {bool}     [overwrite=false]       Whether to overwrite the file.
 *
 * @return: { bool }                           The result of the move.
 */
oFile.prototype.move = function( newPath, overwrite ){
  if (typeof overwrite === 'undefined') var overwrite = false;

  if(newPath instanceof this.$.oFile) newPath = newPath.path;

  var _file = new PermanentFile(this.path);
  var _dest = new PermanentFile(newPath);
  // this.$.alert("moving "+_file.path()+" to "+_dest.path()+" exists?"+_dest.exists())

  if (_dest.exists()){
    if (!overwrite){
      this.$.debug("destination file "+newPath+" exists and will not be overwritten. Can't move file.", this.$.DEBUG_LEVEL.ERROR);
      return false;
    }else{
      _dest.remove()
    }
  }

  var success = _file.move(_dest);
  // this.$.alert(success)
  if (success) {
    this.path = _dest.path()
    return this;
  }
  return false;
}


 /**
 * Moves the file to the folder.
 * @param   {string}   folder                  destination folder for the file.
 * @param   {bool}     [overwrite=false]       Whether to overwrite the file.
 *
 * @return: { bool }                           The result of the move.
 */
oFile.prototype.moveToFolder = function( folder, overwrite ){
  if (hasOwnProperty(folder, "path")) folder = folder.path;
  var _fileName = this.fullName;

  return this.move(folder+"/"+_fileName, overwrite)
}


 /**
 * Renames the file.
 * @param   {string}   newName                 the new name for the file, without the extension.
 * @param   {bool}     [overwrite=false]       Whether to replace a file of the same name if it exists in the folder.
 *
 * @return: { bool }                           The result of the renaming.
 */
oFile.prototype.rename = function( newName, overwrite){
  if (newName == this.name) return true;
  if (this.extension != "") newName += "."+this.extension;
  return this.move(this.folder.path+"/"+newName, overwrite);
}



/**
 * Copies the file to the folder.
 * @param   {string}   [folder]                Content to write to the file.
 * @param   {string}   [copyName]              Name of the copied file without the extension. If not specified, the copy will keep its name unless another file is present in which case it will be called "_copy"
 * @param   {bool}     [overwrite=false]       Whether to overwrite the file.
 *
 * @return: { bool }                           The result of the copy.
 */
oFile.prototype.copy = function( destfolder, copyName, overwrite){
    if (typeof overwrite === 'undefined') var overwrite = false;
    if (typeof copyName === 'undefined') var copyName = this.name;
    if (typeof destfolder === 'undefined') var destfolder = this.folder.path;

    var _fileName = this.fullName;
    if(hasOwnProperty(destfolder, "path")) destfolder = destfolder.path;

    // remove extension from name in case user added it to the param
    copyName.replace ("."+this.extension, "");
    if (this.name == copyName && destfolder == this.folder.path) copyName += "_copy";

    var _fileName = copyName+((this.extension.length>0)?"."+this.extension:"");

    var _file = new PermanentFile(this.path);
    var _dest = new PermanentFile(destfolder+"/"+_fileName);

    if (_dest.exists() && !overwrite){
        throw new Error("Destination file "+destfolder+"/"+_fileName+" exists and will not be overwritten. Can't copy file.", this.$.DEBUG_LEVEL.ERROR);
    }

    this.$.debug("copying "+_file.path()+" to "+_dest.path(), this.$.DEBUG_LEVEL.LOG)

    var success = _file.copy(_dest);
    if (!success) throw new Error ("Copy of file "+_file.path()+" to location "+_dest.path()+" has failed.", this.$.DEBUG_LEVEL.ERROR)

    return new this.$.oFile(_dest.path());
}


/**
 * Removes the file.
 * @return: { bool }                           The result of the removal.
 */
oFile.prototype.remove = function(){
    var _file = new PermanentFile(this.path)
    if (_file.exists()) return _file.remove()
}



/**
 * Parses the file as a XML and returns an object containing the values.
 * @example
 * // parses the xml file as an object with imbricated hierarchy.
 * // each xml node is represented by a simple object with a "children" property containing the children nodes,
 * // and a objectName property representing the name of the node.
 * // If the node has attributes, those are set as properties on the object. All values are set as strings.
 *
 * // example: parsing the shortcuts file
 *
 * var shortcutsFile = (new $.oFile(specialFolders.userConfig+"/shortcuts.xml")).parseAsXml();
 *
 * // The returned object will always be a simple document object with a single "children" property containing the document nodes.
 *
 * var shortcuts = shortcuts.children[0].children     // children[0] is the "shortcuts" parent node, we want the nodes contained within
 *
 * for (var i in shortcuts){
 *   log (shortcuts[i].id)
 * }
 */
oFile.prototype.parseAsXml = function(){
  if (this.extension.toLowerCase() != "xml") return

  // build an object model representation of the contents of the XML by parsing it character by character
  var xml = this.read();
  var xmlDocument = new this.$.oXml(xml);
  return xmlDocument;
}


 /**
 * Used in converting the file to a string value, provides the string-path.
 * @return  {string}   The file path's as a string.
 */
oFile.prototype.toString = function(){
    return this.path;
}

exports.oFile = oFile;