//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oScriptButton class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


var oPieButton = require("./oPieButton.js")

/**
 * The constructor for $.oScriptButton
 * @name          $.oScriptButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button for a widget that will launch a function from another script file.<br>
 * The buttons created this way automatically load the icon named after the script if it finds one named like the funtion in a script-icons folder next to the script file.<br>
 * It will also automatically set the callback to lanch the function from the script.<br>
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   scriptFile               The path to the script file that will be launched
 * @param {string}   scriptFunction           The function name to launch from the script
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 */
function oScriptButton(scriptFile, scriptFunction, parent) {
  this.scriptFile = scriptFile;
  this.scriptFunction = scriptFunction;

  // find an icon for the function in the script-icons folder
  var scriptFile = new this.$.oFile(scriptFile)
  var scriptIconsFolder = new this.$.oFolder(scriptFile.folder.path+"/script-icons");
  try{
    var iconFiles = scriptIconsFolder.getFiles(scriptFunction+".*");
  } catch(e){
    this.$.log("error was caught " + e);
    var iconFiles = [];
  }

  if (iconFiles.length > 0){
    var iconFile = iconFiles[0].path;
  }else{
    // choose default toonboom "missing icon" script icon
    // currently svg icons seem unsupported?
    var iconFile = specialFolders.resource+"/icons/script/qtgeneric.svg";
  }

  this.$.oPieButton.call(this, iconFile, "", parent);

  this.toolTip = this.scriptFunction;
}
oScriptButton.prototype = Object.create(oPieButton.prototype);

oScriptButton.prototype.activate = function(){
  include(this.scriptFile);
  eval(this.scriptFunction)();
  this.closeMenu()
}

exports = oScriptButton;