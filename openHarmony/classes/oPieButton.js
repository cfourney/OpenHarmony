
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
 oPieButton = function(iconFile, text, parent) {
  // if icon isnt provided
  if (typeof parent === 'undefined') var parent = $.app.mainWindow
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
    $.log("failed to load icon "+iconFile)
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

exports = oPieButton;