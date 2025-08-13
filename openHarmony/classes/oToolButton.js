

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oToolButton class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


var oPieButton = require("./oPieButton.js")

/**
 * The constructor for $.oToolButton
 * @name          $.oToolButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button for a tool.
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   toolName               The path to the script file that will be launched
 * @param {string}   scriptFunction           The function name to launch from the script
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 *
 */
 function oToolButton (toolName, showName, iconFile, parent) {
  this.toolName = toolName;
  if (typeof showName === "undefined") var showName = false;

  if (typeof iconFile === "undefined"){
    // find an icon for the function in the script-icons folder
    var scriptIconsFolder = new this.$.oFolder(specialFolders.resource+"/icons/drawingtool");
    try{
      var iconFiles = scriptIconsFolder.getFiles(toolName.replace(" ", "").toLowerCase() + ".*");
    }catch(e){
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
  }
  this.$.oPieButton.call(this, iconFile, showName?toolName:"", parent);

  this.toolTip = this.toolName;
}
oToolButton.prototype = Object.create(oPieButton.prototype);


oToolButton.prototype.activate = function(){
  this.$.app.currentTool = this.toolName;
  this.closeMenu()
}


exports = oToolButton;