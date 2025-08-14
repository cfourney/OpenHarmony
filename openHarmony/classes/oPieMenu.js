//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oPieMenu class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $.oPieMenu constructor.
 * @name        $.oPieMenu
 * @constructor
 * @classdesc   A type of menu with nested levels that appear around the mouse
 * @param       {string}              name                    The name for this pie Menu.
 * @param       {QWidget[]}           [widgets]               The widgets to display in the menu.
 * @param       {bool}                [show=false]            Whether to immediately show the dialog.
 * @param       {float}               [minAngle]              The low limit of the range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @param       {float}               [maxAngle]              The high limit of the  range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @param       {float}               [radius]                The radius of the menu.
 * @param       {$.oPoint}            [position]              The central position of the menu.
 *
 * @property    {string}              name                    The name for this pie Menu.
 * @property    {QWidget[]}           widgets                 The widgets to display in the menu.
 * @property    {float}               minAngle                The low limit of the range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @property    {float}               maxAngle                The high limit of the  range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @property    {float}               radius                  The radius of the menu.
 * @property    {$.oPoint}            position                The central position of the menu or button position for imbricated menus.
 * @property    {QWidget}             menuWidget              The central position of the menu or button position for imbricated menus.
 * @property    {QColor}              sliceColor              The color of the slices. Can set to any fill type accepted by QBrush
 * @property    {QColor}              backgroundColor         The background of the menu. Can set to any fill type accepted by QBrush
 * @property    {QColor}              linesColor              The color of the lines.
 * @example
// This example function creates a menu full of generated push buttons with callbacks, but any type of widget can be added.
// Normally it doesn't make sense to create buttons this way, and they will be created one by one to cater to specific needs,
// such as launching Harmony actions, or scripts, etc. Assign this function to a shortcut by creating a Harmony Package for it.

function openMenu(){
  MessageLog.clearLog()

  // we create a list of tool widgets for our submenu
  var toolSubMenuWidgets = [
    new $.oToolButton("select"),
    new $.oToolButton("brush"),
    new $.oToolButton("pencil"),
    new $.oToolButton("eraser"),
  ];
  // we initialise our submenu
  var toolSubMenu = new $.oPieSubMenu("tools", toolSubMenuWidgets);

  // we create a list of tool widgets for our submenu
  // (check out the scripts from http://raindropmoment.com and http://www.cartoonflow.com, they are great!)
  var ScriptSubMenuWidgets = [
    new $.oScriptButton(specialFolders.userScripts + "/CF_CopyPastePivots_1.0.1.js", "CF_CopyPastePivots" ),
    new $.oScriptButton(specialFolders.userScripts + "/ANM_Paste_In_Place.js", "ANM_Paste_In_Place"),
    new $.oScriptButton(specialFolders.userScripts + "/ANM_Set_Layer_Pivots_At_Center_Of_Drawings.js", "ANM_Set_Layer_Pivots_At_Center_Of_Drawings"),
    new $.oScriptButton(specialFolders.userScripts + "/DEF_Copy_Deformation_Values_To_Resting.js", "DEF_Copy_Deformation_Values_To_Resting"),
  ];
  var scriptsSubMenu = new $.oPieSubMenu("scripts", ScriptSubMenuWidgets);

  // we create a list of color widgets for our submenu
  var colorSubMenuWidgets = []
  var currentPalette = $.scn.selectedPalette
  var colors = currentPalette.colors
  for (var i in colors){
    colorSubMenuWidgets.push(new $.oColorButton(currentPalette.name, colors[i].name));
  }
  var colorSubMenu = new $.oPieSubMenu("colors", colorSubMenuWidgets);

  onionSkinSlider = new QSlider(Qt.Horizontal)
  onionSkinSlider.minimum = 0;
	onionSkinSlider.maximum = 256;
  onionSkinSlider.valueChanged.connect(function(value){
    preferences.setDouble("DRAWING_ONIONSKIN_MAX_OPACITY",
      value/256.0);
    view.refreshViews();
  })

  // widgets that will appear in the main menu
  var mainWidgets = [
    onionSkinSlider,
    toolSubMenu,
    colorSubMenu,
    scriptsSubMenu
  ]

  // we initialise our main menu. The numerical values are for the minimum and maximum angle of the
  // circle in multiples of Pi. Going clockwise, 0 is right, 1 is left, -0.5 is the bottom from the right,
  // and 1.5 is the bottom from the left side. 0.5 is the top of the circle.
  var menu = new $.oPieMenu("menu", mainWidgets, false, -0.2, 1.2);

  // configurating the look of it
  // var backgroundGradient = new QRadialGradient (menu.center, menu.maxRadius);
  // var menuBg = menu.backgroundColor
  // backgroundGradient.setColorAt(1, new QColor(menuBg.red(), menuBg.green(), menuBg.blue(), 255));
  // backgroundGradient.setColorAt(0, menuBg);

  // var sliceGradient = new QRadialGradient (menu.center, menu.maxRadius);
  // var menuColor = menu.sliceColor
  // sliceGradient.setColorAt(1, new QColor(menuColor.red(), menuColor.green(), menuColor.blue(), 20));
  // sliceGradient.setColorAt(0, menuColor);

  // menu.backgroundColor = backgroundGradient
  // menu.sliceColor = sliceGradient

  // we show it!
  menu.show();
}*/
function oPieMenu (name, widgets, show, minAngle, maxAngle, radius, position, parent){
  this.name = name;
  this.widgets = widgets;

  if (typeof minAngle === 'undefined') var minAngle = 0;
  if (typeof maxAngle === 'undefined') var maxAngle = 1;
  if (typeof radius === 'undefined') var radius = this.getMenuRadius();
  if (typeof position === 'undefined') var position = this.$.app.globalMousePosition;
  if (typeof show === 'undefined') var show = false;
  if (typeof parent === 'undefined') var parent = this.$.app.mainWindow;
  this._parent = parent;

  // close all previously opened piemenu widgets
  if (!this.$._piemenu) this.$._piemenu = []
  while (this.$._piemenu.length){
    var pie = this.$._piemenu.pop();
    if (pie){
      // a menu was already open, we close it
      pie.closeMenu()
    }
  }

  QWidget.call(this, parent)
  this.objectName = "pieMenu_" + name;
  this.$._piemenu.push(this)

  this.radius = radius;
  this.minAngle = minAngle;
  this.maxAngle = maxAngle;
  this.globalCenter = position;

  // how wide outisde the icons is the slice drawn
  this._circleMargin = 30;

  // set these values before calling show() to customize the menu appearance
  this.sliceColor = new QColor(0, 200, 255, 200);
  this.backgroundColor = new QColor(40, 40, 40, 180);
  this.linesColor = new QColor(0,0,0,0);

  // create main button
  this.button = this.buildButton()

  // add buildWidget call before show(),
  // for some reason show() is not in QWidget.prototype ?
  this.qWidgetShow = this.show
  this.show = function(){
    this.buildWidget()
  }

  this.focusPolicy = Qt.StrongFocus;
  this.focusOutEvent = function(){
    this.deactivate()
  }

  var menu = this;
  this.button.clicked.connect(function(){return menu.deactivate()})

  if (show) this.show();
}
oPieMenu.prototype = Object.create(QWidget.prototype);


/**
 * function run when the menu button is clicked
 */
oPieMenu.prototype.deactivate = function(){
  this.closeMenu()
}

/**
 * Closes the menu and all its subWidgets
 * @private
 */
oPieMenu.prototype.closeMenu = function(){
  for (var i in this.widgets){
    this.widgets[i].close()
  }
  this.close();
}

/**
 * The top left point of the entire widget
 * @name $.oPieMenu#anchor
 * @type {$.oPoint}
 */
Object.defineProperty(oPieMenu.prototype, "anchor", {
  get: function(){
    var point = this.globalCenter.add(-this.center.x, -this.center.y);
    return point;
  }
})


/**
 * The center of the entire widget
 * @name $.oPieMenu#center
 * @type {$.oPoint}
 */
Object.defineProperty(oPieMenu.prototype, "center", {
  get: function(){
    return new this.$.oPoint(this.widgetSize/2, this.widgetSize/2)
  }
})


/**
 * The min radius of the pie background
 * @name $.oPieMenu#minRadius
 * @type {int}
 */
Object.defineProperty(oPieMenu.prototype, "minRadius", {
  get: function(){
    return this._circleMargin;
  }
})


/**
 * The max radius of the pie background
 * @name $.oPieMenu#maxRadius
 * @type {int}
 */
Object.defineProperty(oPieMenu.prototype, "maxRadius", {
  get: function(){
    return this.radius + this._circleMargin;
  }
})

/**
 * The widget size of the pie background (it's a square so it's both the width and the height.)
 * @name $.oPieMenu#widgetSize
 * @type {int}
 */
 Object.defineProperty(oPieMenu.prototype, "widgetSize", {
  get: function(){
    return this.maxRadius*4;
  }
})


/**
 * Builds the menu's main button.
 * @private
 * @returns {$.oPieButton}
 */
oPieMenu.prototype.buildButton = function(){
  // add main button in constructor because it needs to exist before show()
  var icon = specialFolders.resource + "/icons/brushpreset/defaultpresetellipse/ellipse03.svg"
  button = new this.$.oPieButton(icon, "", this);
  button.objectName = this.name+"_button";
  button.parentMenu = this;

  return button;
}

/**
 * Build and show the pie menu and its widgets.
 * @private
 */
oPieMenu.prototype.buildWidget = function(){
  // match the widget geometry with the main window/parent
  var anchor = this.anchor
  this.move(anchor.x, anchor.y);
  this.minimumHeight = this.maximumHeight = this.widgetSize;
  this.minimumWidth = this.maximumWidth = this.widgetSize;

  if (this.$.app.version + this.$.app.minorVersion > 21){
    // above Harmony 21.1
    var flags = new Qt.WindowFlags(Qt.Window|Qt.FramelessWindowHint|Qt.NoDropShadowWindowHint);
    this.setWindowFlags(flags);
  } else {
    var flags = new Qt.WindowFlags(Qt.Popup|Qt.FramelessWindowHint|Qt.WA_TransparentForMouseEvents);
    this.setWindowFlags(flags);
  }
  this.setAttribute(Qt.WA_MouseTracking, true);
  this.setAttribute(Qt.WA_TranslucentBackground, true);
  this.setAttribute(Qt.WA_DeleteOnClose, true);

  // draw background pie slice
  this.slice = this.drawSlice();
  this.qWidgetShow()
  // arrange widgets into half a circle around the center
  var center = this.center;

  for (var i=0; i < this.widgets.length; i++){
    var widget = this.widgets[i];
    widget.pieIndex = i;
    widget.setParent(this);

    var itemPosition = this.getItemPosition(i);
    var widgetPosition = new this.$.oPoint(center.x + itemPosition.x, center.y + itemPosition.y);

    widget.show();
    widget.move(widgetPosition.x - widget.width/2, widgetPosition.y - widget.height/2);
  }

  this.button.show();
  this.button.move(center.x - (this.button.width/2), center.y - (this.button.height/2));
}


/**
 * draws a background transparent slice and set up the mouse tracking.
 * @param {int}   [minRadius]      specify a minimum radius for the slice
 * @private
 */
oPieMenu.prototype.drawSlice = function(){
  var index = 0;

  // get the slice and background geometry
  var center = this.center;
  var angleSlice = this.getItemAngleRange(index);
  var slicePath = this.getSlicePath(center, angleSlice[0], angleSlice[1], this.minRadius, this.maxRadius);
  var contactPath = this.getSlicePath(center, this.minAngle, this.maxAngle, this.minRadius, this.maxRadius);

  // create a widget to paint into
  var sliceWidget = new QWidget(this);
  sliceWidget.objectName = "slice";
  // make widget background invisible
  sliceWidget.setStyleSheet("background-color: rgba(0, 0, 0, 1%);");
  if (this.$.app.version + this.$.app.minorVersion > 21){
    sliceWidget.setAttribute(Qt.WA_TranslucentBackground);
    sliceWidget.mouseTracking = true
  }else{
    var flags = new Qt.WindowFlags(Qt.FramelessWindowHint);
  }
  sliceWidget.setWindowFlags(flags);
  sliceWidget.minimumHeight = this.height;
  sliceWidget.minimumWidth = this.width;
  sliceWidget.lower();

  var sliceWidth = angleSlice[1]-angleSlice[0];

  // painting the slice on sliceWidget.update()
  var sliceColor = this.sliceColor;
  var backgroundColor = this.backgroundColor;
  var linesColor = this.linesColor;

  sliceWidget.paintEvent = function(){
    var painter = new QPainter();
    painter.save();
    painter.begin(sliceWidget);

    // draw background
    painter.setRenderHint(QPainter.Antialiasing);
    painter.setPen(new QPen(linesColor));
    painter.setBrush(new QBrush(backgroundColor));

    painter.drawPath(contactPath);

    // draw slice and rotate around widget center
    painter.translate(center.x, center.y);
    painter.rotate(sliceWidth*index*(-180));
    painter.translate(-center.x, -center.y);
    painter.setPen(new QPen(linesColor));
    painter.setBrush(new QBrush(sliceColor));
    painter.drawPath(slicePath);
    painter.end();
    painter.restore();
  }

  //set up automatic following of the mouse
  sliceWidget.mouseTracking = true;

  var pieMenu = this;
  var indexWidget = null;
  sliceWidget.leaveEvent = function(event){
    var localPos = sliceWidget.mapFromGlobal(QCursor.pos())
    var position = new pieMenu.$.oPoint(localPos.x(), localPos.y());
    var distance = position.distance(center);
    if (distance < pieMenu.minRadius) {
      // leave from the bottom
      if (pieMenu.deactivate){
        pieMenu.deactivate();
      } else if (indexWidget.deactivate) 
        indexWidget.deactivate();

    } else if (distance > pieMenu.maxRadius){
      // leave from the top
      if (indexWidget.activate) indexWidget.activate();
    }
  }

  sliceWidget.mouseMoveEvent = function(mousePos){
    // work out the index based on relative position to the center
    var position = new pieMenu.$.oPoint(mousePos.x(), mousePos.y());
    var angle = -position.add(-center.x, -center.y).polarCoordinates.angle/Math.PI;
    if (angle < (-0.5)) angle += 2; // our coordinates system uses continuous angle values with cutoff at the bottom (1.5/-0.5)
    var currentIndex = pieMenu.getIndexAtAngle(angle);
    var distance = position.distance(center);

    // on distance value change, if the distance is greater than the maxRadius, activate the widget
    var indexChanged = (index != currentIndex)
    var indexWithinRange = (currentIndex >= 0 && currentIndex < pieMenu.widgets.length)

    // react to distance/angle change when the mouse moves on the pieMenu
    if (indexWithinRange){
      indexWidget = pieMenu.widgets[currentIndex];

      if (indexChanged && distance){
        index = currentIndex;
        sliceWidget.update();
        indexWidget.setFocus(true);
      }

    }
  }

  return sliceWidget;
}


/**
 * Generate a pie slice path to draw based on parameters
 * @param {$.oPoint}    center      the center of the slice
 * @param {float}       minAngle    a value between -0.5 and 1.5 for the lowest angle value for the pie slice
 * @param {float}       maxAngle    a value between -0.5 and 1.5 for the highest angle value for the pie slice
 * @param {float}       minRadius   the smallest circle radius
 * @param {float}       maxRadius   the largest circle radius
 * @private
 */
oPieMenu.prototype.getSlicePath = function(center, minAngle, maxAngle, minRadius, maxRadius){
  // work out the geometry
  var smallArcBoundingBox = new QRectF(center.x-minRadius, center.y-minRadius, minRadius*2, minRadius*2);
  var smallArcStart = new this.$.oPoint();
  smallArcStart.polarCoordinates = {radius: minRadius, angle:minAngle*(-Math.PI)}
  smallArcStart.translate(center.x, center.y);
  var smallArcAngleStart = minAngle*180;
  var smallArcSweep = (maxAngle-minAngle)*180; // convert values from 0-2 (radiant angles in multiples of pi) to degrees

  var bigArcBoundingBox = new QRectF(center.x-maxRadius, center.y-maxRadius, maxRadius*2, maxRadius*2);
  var bigArcAngleStart = maxAngle*180;
  var bigArcSweep = -smallArcSweep;

  // we draw the slice path
  var slicePath = new QPainterPath;
  slicePath.moveTo(new QPointF(smallArcStart.x, smallArcStart.y));
  slicePath.arcTo(smallArcBoundingBox, smallArcAngleStart, smallArcSweep);
  slicePath.arcTo(bigArcBoundingBox, bigArcAngleStart, bigArcSweep);

  return slicePath;
}


/**
 * Get the angle range for the item pie slice based on index.
 * @private
 * @param {int}     index         the index of the widget
 * @return {float[]}
 */
oPieMenu.prototype.getItemAngleRange = function(index){
  var length = this.widgets.length;
  var angleStart = this.minAngle+(index/length)*(this.maxAngle-this.minAngle);
  var angleEnd = this.minAngle+((index+1)/length)*(this.maxAngle-this.minAngle);

  return [angleStart, angleEnd];
}

/**
 * Get the angle for the item widget based on index.
 * @private
 * @param {int}     index         the index of the widget
 * @return {float}
 */
oPieMenu.prototype.getItemAngle = function(index){
  var angleRange = this.getItemAngleRange(index, this.minAngle, this.maxAngle);
  var angle = (angleRange[1] - angleRange[0])/2+angleRange[0]

  return angle;
}


/**
 * Get the widget index for the angle value.
 * @private
 * @param {float}     angle         the index of the widget
 * @return {float}
 */
oPieMenu.prototype.getIndexAtAngle = function(angle){
  var angleRange = (this.maxAngle-this.minAngle)/this.widgets.length
  return Math.floor((angle-this.minAngle)/angleRange);
}


/**
 * Get the position from the center for the item based on index.
 * @private
 * @param {int}     index         the index of the widget
 * @return {$.oPoint}
 */
oPieMenu.prototype.getItemPosition = function(index){
  // we add pi to the angle because of the inverted Y axis of widgets coordinates
  var pi = Math.PI;
  var angle = this.getItemAngle(index, this.minAngle, this.maxAngle)*(-pi);
  var _point = new this.$.oPoint();
  _point.polarCoordinates = {radius:this.radius, angle:angle}

  return _point;
}


/**
 * Get a pie menu radius setting for a given amount of items.
 * @private
 * @return {float}
 */
oPieMenu.prototype.getMenuRadius = function(){
  var itemsNumber = this.widgets.length
  var _maxRadius = UiLoader.dpiScale(200);
  var _minRadius = UiLoader.dpiScale(30);
  var _speed = 10; // the higher the value, the slower the progression

  // hyperbolic tangent function to determin the radius
  var exp = Math.exp(2*itemsNumber/_speed);
  var _radius = ((exp-1)/(exp+1))*_maxRadius+_minRadius;

  return _radius;
}

exports.oPieMenu = oPieMenu;



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oPieSubMenu class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


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

exports.oPieSubMenu= oPieSubMenu;