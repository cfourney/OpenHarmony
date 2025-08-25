
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oPieButton class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for $.oPieButton
 * @constructor
 * @classdesc This subclass of QPushButton provides an easy way to create a button for a PieMenu.<br>
 *
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   iconFile               The icon file for the button
 * @param {string}   text                   A text to display next to the icon
 * @param {QWidget}  parent                 The parent QWidget for the button. Automatically set during initialisation of the menu.
 *
 */
 function oPieButton (iconFile, text, parent) {
  // if icon isnt provided
  if (typeof parent === 'undefined') var parent = this.$.app.mainWindow
  if (typeof text === 'undefined') var text = ""
  if (typeof iconFile === 'undefined') var iconFile = specialFolders.resource+"/icons/script/qtgeneric.svg"

  QPushButton.call(this, text, parent);
  this.name = "PieButton " + text
  this.setParent(parent)

  this.minimumHeight = 24;
  this.minimumWidth = 24;

  // set during addition to the pie Menu
  this.pieIndex = undefined;

  try{
    UiLoader.setSvgIcon(this, iconFile)
    this.setIconSize(new QSize(this.minimumWidth, this.minimumHeight));
  }catch(e){
    this.$.log("failed to load icon "+iconFile)
  }
  this.cursor = new QCursor(Qt.PointingHandCursor);

  var styleSheet = "QPushButton{ background-color: rgba(0, 0, 0, 1%); }" +
  "QPushButton:hover{ background-color: rgba(0, 200, 255, 80%); }"+
  "QToolTip{ background-color: rgba(0, 255, 255, 100%); }"
  this.setStyleSheet(styleSheet);

  var button = this;
  this.clicked.connect(function(){button.activate()})
}
oPieButton.prototype = Object.create(QPushButton.prototype);


/**
 * Closes the parent menu of the button and all its subWidgets.
 */
oPieButton.prototype.closeMenu = function(){
  var menu = this.parentMenu;
  while (menu && menu.parentMenu){
    menu = menu.parentMenu;
  }
  menu.closeMenu()
}

/**
 * Reimplement this function in order to activate the button and also close the menu.
 */
oPieButton.prototype.activate = function(){
  // reimplement to change the behavior when the button is activated.
  // by default, will just close the menu.
  this.closeMenu();
}


/**
 * sets a parent and assigns it to this.parentMenu.
 * using the normal setParent from QPushButton creates a weird bug
 * where calling parent() returns a QWidget and not a $.oPieButton
 * @private
 */
oPieButton.prototype.setParent = function(parent){
  QPushButton.prototype.setParent.call(this, parent);
  this.parentMenu = parent;
}

exports.oPieButton = oPieButton;


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oColorButton class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for $.oColorButton
 * @name          $.oColorButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button to choose a color from a palette.
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   paletteName              The name of the palette that contains the color
 * @param {string}   colorName                The name of the color (if more than one is present, will pick the first match)
 * @param {bool}     showName                 Wether to display the name of the color on the button
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 *
 */
 function oColorButton (paletteName, colorName, showName, parent) {
  this.paletteName = paletteName;
  this.colorName = colorName;

  if (typeof showName === "undefined") var showName = false;

  this.$.oPieButton.call(this, "", showName?colorName:"", parent);

  var palette = this.$.scn.getPaletteByName(paletteName);
  var color = palette.getColorByName(colorName);
  var colorValue = color.value

  var iconMap = new QPixmap(this.minimumHeight,this.minimumHeight)
  iconMap.fill(new QColor(colorValue.r, colorValue.g, colorValue.b, colorValue.a))
  var icon = new QIcon(iconMap);

  this.icon = icon;

  this.toolTip = this.paletteName + ": " + this.colorName;
}
oColorButton.prototype = Object.create(oPieButton.prototype);


oColorButton.prototype.activate = function(){
  var palette = this.$.scn.getPaletteByName(this.paletteName);
  var color = palette.getColorByName(this.colorName);

  this.$.scn.currentPalette = palette;
  palette.currentColor = color;
  this.closeMenu()
}

exports.oColorButton = oColorButton;


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oPrefButton class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////



/**
 * The constructor for $.oPrefButton
 * @name          $.oPrefButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button to change a boolean preference.
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   preferenceString         The name of the preference to show/change.
 * @param {string}   text                     A text for the button display.
 * @param {string}   iconFile                 An icon path for the button.
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 */
function oPrefButton (preferenceString, text, iconFile, parent) {
  this.preferenceString = preferenceString;

  if (typeof iconFile === 'undefined') var iconFile = specialFolders.resource+"/icons/toolproperties/settings.svg";
  this.checkable = true;
  this.checked = preferences.getBool(preferenceString, true);

  this.$.oPieButton.call(this, iconFile, text, parent);

  this.toolTip = this.preferenceString;
}
oPrefButton.prototype = Object.create(oPieButton.prototype);


oPrefButton.prototype.activate = function(){
  var value = preferences.getBool(this.preferenceString, true);
  this.checked != value;
  preferences.setBool(this.preferenceString, value);
  this.closeMenu()
}

exports.oPrefButton = oPrefButton;



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oScriptButton class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////



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
    this.$.debug("error was caught " + e, this.$.DEBUG_LEVEL.ERROR);
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

exports.oScriptButton = oScriptButton;



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oActionButton class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for $.oActionButton
 * @name          $.oActionButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button for a tool.
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   actionName               The action string that will be executed with Action.perform
 * @param {string}   responder                The responder for the action
 * @param {string}   text                     A text for the button display.
 * @param {string}   iconFile                 An icon path for the button.
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 */
function oActionButton (actionName, responder, text, iconFile, parent) {
  this.action = actionName;
  this.responder = responder;

  if (typeof text === 'undefined') var text = "action";

  if (typeof iconFile === 'undefined') var iconFile = specialFolders.resource+"/icons/old/exec.png";

  this.$.oPieButton.call(this, iconFile, text, parent);
  this.toolTip = this.toolName;
}
oActionButton.prototype = Object.create(oPieButton.prototype);


oActionButton.prototype.activate = function(){
  if (this.responder){
    // log("Validating : "+ this.actionName + " ? "+ Action.validate(this.actionName, this.responder).enabled)
    if (Action.validate(this.action, this.responder).enabled){
      Action.perform(this.action, this.responder);
    }
  }else{
    if (Action.Validate(this.action).enabled){
      Action.perform(this.action);
    }
  }
  view.refreshViews();
  this.closeMenu()
}

exports.oActionButton = oActionButton;


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oToolButton class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


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
      this.$.debug("error was caught " + e, this.$.DEBUG_LEVEL.ERROR);
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


exports.oToolButton = oToolButton;