//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library
//
//
//         Developped by Mathieu Chaptel, Chris Fourney
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
//   This library is made available under the Mozilla Public license 2.0.
//   https://www.mozilla.org/en-US/MPL/2.0/
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
//          $.oFolder class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $.oFolder helper class -- providing utilities for folder manipulation and access.
 * @constructor
 * @classdesc  $.oFolder Base Class
 * @param       {string}              path                      The path to the folder.
 *
 * @property    {string}             path                      The path to the folder.
 */
function oFolder (path){
    this._type = "folder";
    this._path = fileMapper.toNativePath(path).split("\\").join("/");

    // fix lowercase drive letter
    var path_components = this._path.split("/");
    if (path_components[0] && about.isWindowsArch()){
      // local path that starts with a drive letter
      path_components[0] = path_components[0].toUpperCase()
      this._path = path_components.join("/");
    }
}


/**
 * The path of the folder.  Setting a path doesn't move the file, only changes where the file object is pointing.
 * @name $.oFolder#path
 * @type {string}
 */
Object.defineProperty(oFolder.prototype, 'path', {
    get: function(){
      return this._path;
    },
    set: function( newPath ){
      this._path = fileMapper.toNativePath( newPath ).split("\\").join("/");
    }
});


/**
 * The path of the file encoded as a toonboom relative path.
 * @name $.oFolder#toonboomPath
 * @readonly
 * @type {string}
 */
Object.defineProperty( oFolder.prototype, 'toonboomPath', {
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


/**
 * The name of the folder.
 * @name $.oFolder#name
 * @type {string}
 */
Object.defineProperty(oFolder.prototype, 'name', {
    get: function(){
        var _name = this.path.split("/");
        _name = _name.pop();
        return _name;
    },
    set: function(newName){
      this.rename(newName)
    }
});


/**
 * The parent folder.
 * @name $.oFolder#folder
 * @type {$.oFolder}
 */
Object.defineProperty(oFolder.prototype, 'folder', {
    get: function(){
        var _folder = this.path.slice(0,this.path.lastIndexOf("/", this.path.length-2));
        return new this.$.oFolder(_folder);
    }
});


/**
 * The parent folder.
 * @name $.oFolder#exists
 * @type {string}
 */
Object.defineProperty(oFolder.prototype, 'exists', {
    get: function(){
        var dir = new QDir;
        dir.setPath(this.path)
        return dir.exists();
    }
});


/**
 * The files in the folder.
 * @name $.oFolder#files
 * @type {$.oFile[]}
 * @deprecated use oFolder.getFiles() instead to specify filter
 */
Object.defineProperty(oFolder.prototype, 'files', {
    get: function(){
      return this.getFiles("*");
    }
});


/**
 * The folders within this folder.
 * @name $.oFolder#folders
 * @type {$.oFile[]}
 * @deprecated oFolder.folder is the containing parent folder, it can't also mean the children folders
 */
Object.defineProperty(oFolder.prototype, 'folders', {
    get: function(){
      var _dir = new QDir;
      _dir.setPath(this.path);
      if (!_dir.exists) throw new Error("can't get files from folder "+this.path+" because it doesn't exist");
      _dir.setFilter(QDir.Dirs);
      var _folders = _dir.entryList();

      for (var i = _folders.length-1; i>=0; i--){
          if (_folders[i] == "." || _folders[i] == "..") _folders.splice(i,1);
      }

      return _folders.map(function(x){return new oFolder( _dir.path() + "/" + x )});
    }
});


/**
 * The content within the folder -- both folders and files.
 * @name $.oFolder#content
 * @type {$.oFile/$.oFolder[] }
 */
Object.defineProperty(oFolder.prototype, 'content', {
    get: function(){
      var content = this.files;
          content = content.concat( this.folders );
      return content;
    }
});


/**
 * Enum for the type of content to retrieve from the oFolder.
 * @enum {QFlag}
 */
oFolder.prototype.ContentType = {
  FOLDER: QDir.Filters(QDir.Dirs | QDir.NoDotAndDotDot),
  FILE: QDir.Files
}


/**
 * Lists the contents of the folder, filtered by the contentType and name filter(s).
 * Primarily a helper function for listFile/listFolder, but can be called directly to provide custom filtering
 * by providing QDir::Filters to the contentType parameter.
 * @param   {$.oFolder.ContentType} [contentType]      Type of content to retrieve.
 * @param   {string|string[]}       [filter="*"]       Single filter, or array of filters for the contents of the folder.
 * @example
 * // List files with a case-sensitive filter. Will match l* and not L*
 * var dir = new $.oFolder("/tmp/example");
 * dir.listEntries(QDir.Filters(QDir.Files | QDir.CaseSensitive), "l*")
 * @example
 * // List files including hidden files.
 * var dir = new $.oFolder("/tmp/example");
 * dir.listEntries(QDir.Filters(QDir.Files | QDir.Hidden))
 *
 * @returns {string[]}   Names of the folder contents that match the filter and type provided.
 */
oFolder.prototype.listEntries = function(contentType, filter) {
  // Undefined filters become a wildcard
  // A single string filter becomes a single-item array
  // Array of filters are unchanged.
  var _filter;
  if (typeof filter === "undefined") {
    _filter = ["*"];
  }
  else if (typeof filter === "string") {
    _filter = [filter];
  }
  else {
    _filter = filter;
  }

  var _dir = new QDir(this.path);
  if (!_dir.exists()){
    this.$.debug("can't get files from folder "+this.path+" because it doesn't exist", this.$.DEBUG_LEVEL.ERROR);
    return [];
  }

  _dir.setNameFilters(_filter);
  _dir.setFilter(contentType);

  return _dir.entryList()
}


/**
 * lists the file names contained inside the folder.
 * @param   {string|string[]} [filter="*"] Wildcard (globbing) filter that understands * and ? wildcards. Used to filter the contents of the folder.
 *
 * @returns {string[]}  Names of the files contained in the folder that match the namefilter(s).
 */
oFolder.prototype.listFiles = function(filter){
  return this.listEntries(this.ContentType.FILE, filter);
}


/**
 * get the files from the folder
 * @param   {string|string[]} [filter="*"] Wildcard (globbing) filter that understands * and ? wildcards. Used to filter the contents of the folder.
 *
 * @returns {$.oFile[]}  A list of files contained in the folder that match the namefilter(s), as oFile objects.
 */
oFolder.prototype.getFiles = function(filter){
  var _fileList = this.listFiles(filter);
  var _files = _fileList.map(function(filePath) {
    return new this.$.oFile(this.path + "/" + filePath);
  }, this);

  return _files;
}


/**
 * lists the folder names contained inside the folder.
 * @param   {string|string[]} [filter="*"] Wildcard (globbing) filter that understands * and ? wildcards. Used to filter the contents of the folder.
 *
 * @returns {string[]}  Names of the files contained in the folder that match the namefilter(s).
 */
oFolder.prototype.listFolders = function(filter){
  return this.listEntries(this.ContentType.FOLDER, filter);
}


/**
 * gets the folders inside the oFolder
 * @param   {string|string[]} [filter="*"] Wildcard (globbing) filter that understands * and ? wildcards. Used to filter the contents of the folder.
 *
 * @returns {$.oFolder[]}  A list of folders contained in the folder that match the namefilter(s), as oFolder objects.
 */
oFolder.prototype.getFolders = function(filter){

  var _folderList = this.listFolders(filter);
  var _folders = _folderList.map(function(folderPath) {
    return new this.$.oFolder(this.path + "/" + folderPath);
  }, this);

  return _folders;
}


 /**
 * Creates the folder, if it doesn't already exist.
 * @returns { bool }      The existence of the newly created folder.
 */
oFolder.prototype.create = function(){
  if( this.exists ){
    this.$.debug("folder "+this.path+" already exists and will not be created", this.$.DEBUG_LEVEL.WARNING)
    return true;
  }

  var dir = new QDir(this.path);

  dir.mkpath(this.path);
  if (!this.exists) throw new Error ("folder " + this.path + " could not be created.")
}


/**
 * Copy the folder and its contents to another path.
 * @param   {string}   folderPath          The path to an existing folder in which to copy this folder. (Can provide an oFolder)
 * @param   {string}   [copyName]          Optionally, a name for the folder copy, if different from the original
 * @param   {bool}     [overwrite=false]   Whether to overwrite the files that are already present at the copy location.
 * @returns {$.oFolder} the oFolder describing the newly created copy.
 */
oFolder.prototype.copy = function( folderPath, copyName, overwrite ){
  // TODO: it should propagate errors from the recursive copy and throw them before ending?
  if (typeof overwrite === 'undefined') var overwrite = false;
  if (typeof copyName === 'undefined' || !copyName) var copyName = this.name;
  if (!(folderPath instanceof this.$.oFolder)) folderPath = new this.$.oFolder(folderPath);
  if (this.name == copyName && folderPath == this.folder.path) copyName += "_copy";

  if (!folderPath.exists) throw new Error("Target folder " + folderPath +" doesn't exist. Can't copy folder "+this.path)

  var nextFolder = new this.$.oFolder(folderPath.path + "/" + copyName);
  nextFolder.create();
  var files = this.getFiles();

  for (var i in files){
    var _file = files[i];
    var targetFile = new oFile(nextFolder.path + "/" + _file.fullName);

    // deal with overwriting
    if (targetFile.exists && !overwrite){
      this.$.debug("File " + targetFile + " already exists, skipping copy of "+ _file, this.$.DEBUG_LEVEL.ERROR);
      continue;
    }

    _file.copy(nextFolder, undefined, overwrite);
  }
  var folders = this.getFolders();
  for (var i in folders){
    folders[i].copy(nextFolder, undefined, overwrite);
  }

  return nextFolder;
}


/**
 * Move this folder to the specified path.
 * @param   {string}   destFolderPath           The new complete path of the folder after the move
 * @param   {bool}     [overwrite=false]        Whether to overwrite the target.
 *
 * @return { bool }                            The result of the move.
 * @todo implement with Robocopy
 */
oFolder.prototype.move = function( destFolderPath, overwrite ){
    if (typeof overwrite === 'undefined') var overwrite = false;

    if (destFolderPath instanceof this.$.oFolder) destFolderPath = destFolderPath.path;

    var dir = new Dir;
    dir.path = destFolderPath;

    if (dir.exists && !overwrite)
        throw new Error("destination file "+dir.path+" exists and will not be overwritten. Can't move folder.");

    var path = fileMapper.toNativePath(this.path);
    var destPath = fileMapper.toNativePath(dir.path);

    var destDir = new Dir;
    try {
        destDir.rename( path, destPath );
        this._path = destPath;

        return true;
    }catch (err){
        throw new Error ("Couldn't move folder "+this.path+" to new address "+destPath + ": " + err);
    }
}


/**
 * Move this folder to a different parent folder, while retaining its content and base name.
 * @param   {string}   destFolderPath           The path of the destination to copy the folder into.
 * @param   {bool}     [overwrite=false]        Whether to overwrite the target. Default is false.
 *
 * @return: { bool }                            The result of the move.
 */
oFolder.prototype.moveToFolder = function( destFolderPath, overwrite ){
  destFolderPath = (destFolderPath instanceof this.$.oFolder)?destFolderPath:new this.$.oFolder(destFolderPath)

  var folder = destFolderPath.path;
  var name = this.name;

  this.move(folder+"/"+name, overwrite);
}


/**
 * Renames the folder
 * @param {string} newName
 */
oFolder.prototype.rename = function(newName){
  var destFolderPath = this.folder.path+"/"+newName
  if ((new this.$.oFolder(destFolderPath)).exists) throw new Error("Can't rename folder "+this.path + " to "+newName+", a folder already exists at this location")

  this.move(destFolderPath)
}


/**
 * Deletes the folder.
 * @param   {bool}    removeContents            Whether to check if the folder contains files before deleting.
 */
oFolder.prototype.remove = function (removeContents){
  if (typeof removeContents === 'undefined') var removeContents = false;

  if (this.listFiles.length > 0 && this.listFolders.length > 0 && !removeContents) throw new Error("Can't remove folder "+this.path+", it is not empty.")
  var _folder = new Dir(this.path);
  _folder.rmdirs();
}


/**
 * Get the sub folder or file by name.
 * @param   {string}   name                     The sub name of a folder or file within a directory.
 * @return: {$.oFolder/$.oFile}                 The resulting oFile or oFolder.
 */
oFolder.prototype.get = function( destName ){
  var new_path = this.path + "/" + destName;
  var new_folder = new oFolder( new_path );
  if( new_folder.exists ){
    return new_folder;
  }

  var new_file = new oFile( new_path );
  if( new_file.exists ){
    return new_file;
  }

  return false;
}


 /**
 * Used in converting the folder to a string value, provides the string-path.
 * @return  {string}   The folder path's as a string.
 */
oFolder.prototype.toString = function(){
    return this.path;
}

exports.oFolder = oFolder;