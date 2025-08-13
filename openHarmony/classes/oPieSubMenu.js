
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oPieSubMenu class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


var oPieMenu = require("./oPieMenu.js");

/**
 * The $.oPieSubMenu constructor.
 * @name        $.oPieSubMenu
 * @constructor
 * @classdesc   A menu with more options that opens/closes when the user clicks on the button.
 * @param       {string}              name                     The name for this pie Menu.
 * @param       {QWidget[]}           [widgets]                The widgets to display in the menu.
 *
 * @property    {string}              name                     The name for this pie Menu.
 * @property    {string}              widgets                  The widgets to display in the menu.
 * @property    {string}              menu                     The oPieMenu Object containing the widgets for the submenu
 * @property    {string}              itemAngle                a set angle for each items instead of spreading them across the entire circle
 * @property    {string}              extraRadius              using a set radius between each submenu levels
 * @property    {$.oPieMenu}          parentMenu               the parent menu for this subMenu. Set during initialisation of the menu.
 */
function oPieSubMenu (name, widgets) {
  this.menuIcon = specialFolders.resource + "/icons/toolbar/menu.svg";
  this.closeIcon = specialFolders.resource + "/icons/toolbar/collapseopen.png";

  // min/max angle and radius will be set from parent during buildWidget()
  this.$.oPieMenu.call(this, name, widgets, false);

  // change these settings before calling show() to modify the look of the pieSubMenu
  this.itemAngle = 0.06;
  this.extraRadius = UiLoader.dpiScale(80);
  this.parentMenu = undefined;

  this.focusOutEvent = function(){} // delete focusOutEvent response from submenu
}
oPieSubMenu.prototype = Object.create(oPieMenu.prototype)


/**
 * function called when main button is clicked
 */
oPieSubMenu.prototype.deactivate = function(){
  this.showMenu(false);
}

/**
 * The top left point of the entire widget
 * @name $.oPieSubMenu#anchor
 * @type {$.oPoint}
 */
Object.defineProperty(oPieSubMenu.prototype, "anchor", {
  get: function(){
    var center = this.parentMenu.globalCenter;
    return center.add(-this.widgetSize/2, -this.widgetSize/2);
  }
})


/**
 * The min radius of the pie background
 * @name $.oPieSubMenu#minRadius
 * @type {int}
 */
Object.defineProperty(oPieSubMenu.prototype, "minRadius", {
  get: function(){
    return this.parentMenu.maxRadius;
  }
})


/**
 * The max radius of the pie background
 * @name $.oPieSubMenu#maxRadius
 * @type {int}
 */
Object.defineProperty(oPieSubMenu.prototype, "maxRadius", {
  get: function(){
    return this.minRadius + this.extraRadius;
  }
})


/**
 * activate the menu button when activate() is called on the menu
 * @private
 */
oPieSubMenu.prototype.activate = function(){
  this.showMenu(true);
  this.setFocus(true)
}


/**
 * In order for pieSubMenus to behave like other pie widgets, we reimplement
 * move() so that it only moves the button, and the slice will remain aligned with
 * the parent.
 * @param  {int}      x     The x coordinate for the button relative to the piewidget
 * @param  {int}      y     The x coordinate for the button relative to the piewidget
 * @private
 */
oPieSubMenu.prototype.move = function(x, y){
  // move the actual widget to its anchor, but move the button instead
  QWidget.prototype.move.call(this, this.anchor.x, this.anchor.y);

  // calculate the actual position for the button as if it was a child of the pieMenu
  // whereas it uses global coordinates
  var buttonPos = new this.$.oPoint(x, y)
  var parentAnchor = this.parentMenu.anchor;
  var anchorDiff = parentAnchor.add(-this.anchor.x, -this.anchor.y)
  var localPos = buttonPos.add(anchorDiff.x, anchorDiff.y)

  // move() is used by the pieMenu with half the widget size to center the button, so we have to cancel it out
  this.button.move(localPos.x+this.widgetSize/2-this.button.width/2, localPos.y+this.widgetSize/2-this.button.height/2 );
}


/**
 * sets a parent and assigns it to this.parentMenu.
 * using the normal setParent from QPushButton creates a weird bug
 * where calling parent() returns a QWidget and not a $.oPieButton
 * @private
 */
oPieSubMenu.prototype.setParent = function(parent){
  this.$.oPieMenu.prototype.setParent.call(this, parent);
  this.parentMenu = parent;
}


/**
 * build the main button for the menu
 * @private
 * @returns {$.oPieButton}
 */
oPieSubMenu.prototype.buildButton = function(){
  // add main button in constructor because it needs to exist before show()
  var button = new this.$.oPieButton(this.menuIcon, this.name, this);
  button.activate = function(){}; // prevent the button from closing the entire pie menu 
  button.objectName = this.name+"_button";

  return button;
}


/**
 * Shows or hides the menu itself (not the button)
 * @param {*} visibility
 */
oPieSubMenu.prototype.showMenu = function(visibility){
  for (var i in this.widgets){
    this.widgets[i].visible = visibility;
  }
  this.slice.visible = visibility;
  var icon = visibility?this.closeIcon:this.menuIcon;
  UiLoader.setSvgIcon(this.button, icon);
  this.slice.mouseTracking = visibility;
}


/**
 * toggles the display of the menu
 */
oPieSubMenu.prototype.toggleMenu = function(){
  this.showMenu(!this.slice.visible);
}

/**
 * Function to initialise the widgets for the submenu
 * @private
 */
oPieSubMenu.prototype.buildWidget = function(){
  if (!this.parentMenu){
    throw new Error("must set parent first before calling $.oPieMenu.buildWidget()")
  }
  parentWidget = this.parentMenu;

  // submenu widgets calculate their range from to go on both sides of the button, at a fixed angle
  // (in order to keep the span of submenu options centered around the menu button)
  var widgetNum = this.widgets.length/2;
  var angle = parentWidget.getItemAngle(this.pieIndex);

  // create the submenu on top of the main menu
  this.radius = parentWidget.radius+this.extraRadius;
  this.minAngle = angle-widgetNum*this.itemAngle;
  this.maxAngle = angle+widgetNum*this.itemAngle;

  this.$.oPieMenu.prototype.buildWidget.call(this);

  this.showMenu(false)
}

exports = oPieSubMenu;