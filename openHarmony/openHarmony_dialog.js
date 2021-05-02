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
//         $.oDialog class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The base class for the $.oDialog.
 * @classdesc
 * $.oDialog Base Class -- helper class for showing GUI content.
 * @constructor
 */
$.oDialog = function( ){
}


/**
 * Prompts with a confirmation dialog (yes/no choice).
 * @name    $.oDialog#confirm
 * @function
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 * @param   {string}           [cancelButtonText]             The text on the CANCEL button of the dialog.
 *
 * @return  {bool}       Result of the confirmation dialog.
 */

$.oDialog.prototype.confirm = function( labelText, title, okButtonText, cancelButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.confirm not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof labelText === 'undefined')        var labelText = false;
  if (typeof title === 'undefined')            var title = "Confirmation";
  if (typeof okButtonText === 'undefined')     var okButtonText = "OK";
  if (typeof cancelButtonText === 'undefined') var cancelButtonText = "Cancel";

  var d = new Dialog();
      d.title            = title;
      d.okButtonText     = okButtonText;
      d.cancelButtonText = cancelButtonText;

  if( labelText ){
    var label = new Label;
    label.text = labelText;
  }

  d.add( label );

  if ( !d.exec() ){
    return false;
  }

  return true;
}


/**
 * Prompts with an alert dialog (informational).
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 *
 */
$.oDialog.prototype.alert = function( labelText, title, okButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.alert not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof labelText === 'undefined')        var labelText = "Alert!";
  if (typeof title === 'undefined')            var title = "Alert";
  if (typeof okButtonText === 'undefined')     var okButtonText = "OK";

  this.$.debug(labelText, this.$.DEBUG_LEVEL.LOG)

  var d = new QMessageBox( false, title, labelText, QMessageBox.Ok );
  d.setWindowTitle( title );

  d.buttons()[0].text = okButtonText;

  if( labelText ){
    d.text = labelText;
  }

  if ( !d.exec() ){
    return;
  }
}


/**
 * Prompts with an alert dialog with a text box which can be selected (informational).
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 */
$.oDialog.prototype.alertBox = function( labelText, title, okButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.alert not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof labelText === 'undefined')        var labelText = "Alert!";
  if (typeof title === 'undefined')            var title = "Alert";
  if (typeof okButtonText === 'undefined')     var okButtonText = "OK";

  this.$.debug(labelText, this.$.DEBUG_LEVEL.LOG)

  var d = new QDialog();

  var label = new QPlainTextEdit(labelText);
  label.readOnly = true;

  var button = new QPushButton(okButtonText);

  var layout = new QVBoxLayout(d);
  layout.addWidget(label, 1, Qt.Justify);
  layout.addWidget(button, 0, Qt.AlignHCenter);

  d.setWindowTitle( title );
  button.clicked.connect(d.accept);

  d.exec();
}



/**
 * Prompts for a user input.
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [prefilledText]                The text to display in the input area.
 *
 */
$.oDialog.prototype.prompt = function( labelText, title, prefilledText){
  if (typeof labelText === 'undefined') var labelText = "enter value :";
  if (typeof title === 'undefined') var title = "Prompt";
  if (typeof prefilledText === 'undefined') var prefilledText = "";
  return Input.getText(labelText, prefilledText, title);
}


/**
 * Prompts with a file selector window
 * @param   {string}           [text="Select a file:"]       The title of the confirmation dialog.
 * @param   {string}           [filter="*"]                  The filter for the file type and/or file name that can be selected. Accepts wildcard charater "*".
 * @param   {string}           [getExisting=true]            Whether to select an existing file or a save location
 * @param   {string}           [acceptMultiple=false]        Whether or not selecting more than one file is ok. Is ignored if getExisting is falses.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 *
 * @return  {string[]}         The list of selected Files, 'undefined' if the dialog is cancelled
 */
$.oDialog.prototype.browseForFile = function( text, filter, getExisting, acceptMultiple, startDirectory){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.browseForFile not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof title === 'undefined') var title = "Select a file:";
  if (typeof filter === 'undefined') var filter = "*"
  if (typeof getExisting === 'undefined') var getExisting = true;
  if (typeof acceptMultiple === 'undefined') var acceptMultiple = false;


  if (getExisting){
    if (acceptMultiple){
      var _files = QFileDialog.getOpenFileNames(0, text, startDirectory, filter)
    }else{
      var _files = QFileDialog.getOpenFileName(0, text, startDirectory, filter)
    }
  }else{
    var _files = QFileDialog.getSaveFileName(0, text, startDirectory, filter)
  }

  this.$.debug(_files)
  return _files;
}


/**
 * Prompts with a browse for folder dialog (informational).
 * @param   {string}           [text]                        The title of the confirmation dialog.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 *
 * @return  {string[]}         The path of the selected folder, 'undefined' if the dialog is cancelled
 */
$.oDialog.prototype.browseForFolder = function(text, startDirectory){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.browseForFolder not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof title === 'undefined') var title = "Select a folder:";

  var _folder = QFileDialog.getExistingDirectory(0, text, startDirectory);
  _folder = _folder.split("\\").join("/");
  // this.$.alert(_folder)
  return _folder;
}


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//     $.oProgressDialog class      //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $.oProgressDialog constructor.
 * @name        $.oProgressDialog
 * @constructor
 * @classdesc   An simple progress dialog to display the progress of a task.
 * @param       {string}              labelText                  The path to the folder.
 * @param       {string}              [range=100]                The path to the folder.
 * @param       {string}              [title]                    The title of the dialog
 * @param       {bool}                [show=false]               Whether to immediately show the dialog.
 *
 * @property    {bool}                cancelled                  Whether the progress bar was cancelled.
 */
$.oProgressDialog = function( labelText, range, title, show ){
  if (typeof title === 'undefined') var title = "Progress";
  if (typeof range === 'undefined') var range = 100;
  if (typeof labelText === 'undefined') var labelText = "";

  this._value = 0;
  this._range = range;
  this._title = title;
  this._labelText = labelText;

  if (show) this.show();

  this.cancelled = false;
}

// legacy compatibility
$.oDialog.Progress = $.oProgressDialog;


/**
 * The text of the window.
 * @name $.oProgressDialog#text
 * @type {string}
 */
Object.defineProperty( $.oProgressDialog.prototype, 'label', {
  get: function(){
    return this._labelText;
  },
  set: function( val ){
    this._labelText = val;
    if (!this.$.batchMode) this.progress.setLabelText( val );
  }
});


/**
 * The range of the window.
 * @name $.oProgressDialog#range
 * @type {int}
 */
Object.defineProperty( $.oProgressDialog.prototype, 'range', {
    get: function(){
      return this._range;
    },
    set: function( val ){
      this._range = val;
      if (!this.$.batchMode) this.progress.setRange( 0, val );
      //QCoreApplication.processEvents();
    }
});


/**
 * The current value of the window.
 * @name $.oProgressDialog#value
 * @type {int}
 */
Object.defineProperty( $.oProgressDialog.prototype, 'value', {
    get: function(){
      return this._value;
    },
    set: function( val ){
      if (val > this.range) val = this.range;
      this._value = val;
      if (this.$.batchMode) {
        this.$.log("Progress : "+val+"/"+this._range)
      }else {
        this.progress.value = val;
      }
      //QCoreApplication.processEvents();
    }
});


/**
 * Whether the Progress Dialog was cancelled by the user
 * @name $.oProgressDialog#cancelled
 * @type {int}
 */
Object.defineProperty( $.oProgressDialog.prototype, 'cancelled', {
  get: function(){
    return this.progress.wasCanceled();
  }
});


// oProgressDialog Class Methods

/**
 * Shows the dialog.
 */
$.oProgressDialog.prototype.show = function(){
  if (this.$.batchMode) {
    this.$.debug("$.oProgressDialog not supported in batch mode", this.$.DEBUG_LEVEL.ERROR)
    return;
  }

  this.progress = new QProgressDialog();
  this.progress.title = this._title;
  this.progress.setLabelText( this._labelText );
  this.progress.setRange( 0, this._range );

  this.progress.show();

  {
    //CANCEL EVENT.
    var prog = this;
    var canceled = function(){
      prog.cancelled = true;
    }
    this.progress["canceled()"].connect( this, canceled );
  }

}

/**
 * Closes the dialog.
 */
$.oProgressDialog.prototype.close = function(){
  this.value = this.range;
  this.$.log("Progress : "+value+"/"+this._range)

  if (this.$.batchMode) {
    this.$.debug("$.oProgressDialog not supported in batch mode", this.$.DEBUG_LEVEL.ERROR)
    return;
  }

  this.progress.hide();
  this.progress = false;
}


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
 * @param       {float}               [minAngle]              The low limit of the range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @param       {float}               [maxAngle]              The high limit of the  range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @param       {float}               [radius]                The radius of the menu.
 * @param       {$.oPoint}            [position]              The central position of the menu.
 * @param       {bool}                [show=false]            Whether to immediately show the dialog.
 * @param       {QColor}              [sliceColor]            The color of the slices. Can set to any fill type accepted by QBrush
 * @param       {QColor}              [backgroundColor]       The background of the menu. Can set to any fill type accepted by QBrush
 * @param       {QColor}              [linesColor]            The color of the lines.
 *
 * @property    {string}              name                    The name for this pie Menu.
 * @property    {QWidget[]}           widgets                 The widgets to display in the menu.
 * @property    {float}               minAngle                The low limit of the range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @property    {float}               maxAngle                The high limit of the  range of angles used by the menu, in multiples of PI (0 : left, 0.5 : top, 1 : right, -0.5 : bottom)
 * @property    {float}               radius                  The radius of the menu.
 * @property    {$.oPoint}            position                The central position of the menu or button position for imbricated menus.
 * @property    {QWidget}             menuWidget              The central position of the menu or button position for imbricated menus.
 * @example
// This example function creates a menu full of generated push buttons with callbacks, but any type of widget can be added.
// Normally it doesn't make sense to create buttons this way, and they will be created one by one to cater to specific needs,
// such as launching Harmony actions, or scripts, etc. Assign this function to a shortcut by creating a Harmony Package for it.

function openMenu(){

  // make a callback factory for our buttons and provide access to the openHarmony object
  var oh = $;
  function getCallback(message){
    var $ = oh;
    var message = message;
    return function(){
      $.alert(message);
    }
  }

  // we create a list of random widgets for our submenu
  var subwidgets = [];
  for (var i=0; i<5; i++){
    var button = new QPushButton;
    button.text = i;

    var callback = getCallback("submenu button "+i);
    button.clicked.connect(callback);

    subwidgets.push(button);
  }

  // we initialise our submenu
  var subMenu = new $.oPieSubMenu("more", subwidgets);

  // we create a list of random widgets for our main menu
  var widgets = [];
  for (var i=0; i<8; i++){
    var button = new QPushButton;
    button.text = i;

    var callback = getCallback("button "+i);
    button.clicked.connect(callback);

    widgets.push(button);
  }

  // we swap one of our widgets for the submenu
  widgets[3] = subMenu;

  // we initialise our main menu. The numerical values are for the minimum and maximum angle of the
  // circle in multiples of Pi. Going counter clockwise, 0 is right, 1 is left, 1.5 is the bottom from the left,
  // and -0.5 is the bottom from the right side. 0.5 is the top of the circle.
  var menu = new $.oPieMenu("menu", widgets, -0.2, 1.2);

  var backgroundGradient = new QRadialGradient (menu.center, maxRadius);
  backgroundGradient.setColorAt(1, new QColor(backgroundColor.red(), backgroundColor.green(), backgroundColor.blue(), 255));
  backgroundGradient.setColorAt(0, backgroundColor);

  var sliceGradient = new QRadialGradient (menu.center, maxRadius);
  sliceGradient.setColorAt(1, new QColor(sliceColor.red(), sliceColor.green(), sliceColor.blue(), 20));
  sliceGradient.setColorAt(0, sliceColor);

  menu.backgroundColor = backgroundGradient
  menu.sliceColor = sliceGradient

  // we show it!
  menu.show();
}
 */

$.oPieMenu = function( name, widgets, show, minAngle, maxAngle, radius, position, parent){
  this.name = name;
  this.widgets = widgets;

  if (typeof minAngle === 'undefined') var minAngle = 0;
  if (typeof maxAngle === 'undefined') var maxAngle = 1;
  if (typeof radius === 'undefined') var radius = this.getMenuRadius();
  if (typeof position === 'undefined') var center = this.$.app.mousePosition;
  if (typeof show === 'undefined') var show = false;
  if (typeof parent === 'undefined') var parent = this.$.app.mainWindow;
  this._parent = parent;

  QWidget.call(this, parent)
  this.objectName = name;

  this.radius = radius;
  this.minAngle = minAngle;
  this.maxAngle = maxAngle;
  this.center = center;

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
  var qWidgetShow = this.show
  this.show = function(){
    log("showing widget")
    this.buildWidget()
    qWidgetShow()
  }

  if (show) this.show();
}
$.oPieMenu.prototype = Object.create(QWidget.prototype);


/**
 * The top left point of the entire widget
 * @name $.oPieMenu#anchor
 * @type {$.oPoint}
 */
Object.defineProperty($.oPieMenu.prototype, "anchor", {
  get: function(){
    var point = this._parent.mapToGlobal(new QPoint(0,0));
    return new this.$.oPoint(point.x(), point.y())
  }
})


/**
 * The min radius of the pie background
 * @name $.oPieMenu#minRadius
 * @type {int}
 */
Object.defineProperty($.oPieMenu.prototype, "minRadius", {
  get: function(){
    return this._circleMargin;
  }
})


/**
 * The max radius of the pie background
 * @name $.oPieMenu#maxRadius
 * @type {int}
 */
Object.defineProperty($.oPieMenu.prototype, "maxRadius", {
  get: function(){
    return this.radius + this._circleMargin;
  }
})


$.oPieMenu.prototype.buildButton = function(){
  // add main button in constructor because it needs to exist before show()
  var icon = specialFolders.resource + "/icons/brushpreset/defaultpresetellipse/ellipse03.svg"
  button = new this.$.oPieButton(icon, "", this);
  button.objectName = this.name+"_button";
  button.clicked.connect(this.close)

  return button;
}

/**
 * Build and show the pie menu.
 */
$.oPieMenu.prototype.buildWidget = function(){
  log("oPieMenu buildWidget")
  // match the widget geometry with the main window/parent
  this.move(this.anchor.x, this.anchor.y);
  this.minimumHeight = this._parent.height;
  this.minimumWidth = this._parent.width;

  var flags = new Qt.WindowFlags(Qt.Popup| Qt.FramelessWindowHint);
  this.setWindowFlags(flags);
  this.setStyleSheet("background-color: rgba(20, 20, 20, 85%);");
  this.setAttribute(Qt.WA_TranslucentBackground);

  // draw background pie slice
  this.slice = this.drawSlice();

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

  this.focusPolicy = Qt.StrongFocus;
  this.focusOutEvent = function(){
    log("focus out");
    this.close()
  }
}


/**
 * draws a background transparent slice
 * @param {int}   [minRadius]      specify a minimum radius for the slice
 * @private
 */
$.oPieMenu.prototype.drawSlice = function(){
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
  sliceWidget.setStyleSheet("background-color: rgba(0, 0, 0, 0%);");
  var flags = new Qt.WindowFlags(Qt.FramelessWindowHint);
  sliceWidget.setWindowFlags(flags)
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
  var currentDistance = false;
  sliceWidget.mouseMoveEvent = function(mousePos){
    // work out the index based on relative position to the center
    var position = new pieMenu.$.oPoint(mousePos.x(), mousePos.y());
    var angle = -position.translate(-center.x, -center.y).polarCoordinates.angle/Math.PI;
    if (angle < (-0.5)) angle += 2; // our coordinates system uses continuous angle values with cutoff at the bottom (1.5/-0.5)
    var currentIndex = pieMenu.getIndexAtAngle(angle);
    var distance = position.translate(center.x,  center.y).distance(center) > pieMenu.maxRadius;

    // on index value change, change the slice rotation and update slicewidget, as well as focus the widget
    if (index != currentIndex && currentIndex >= 0 && currentIndex < pieMenu.widgets.length){
      index = currentIndex;
      sliceWidget.update();
      var indexWidget = pieMenu.widgets[index];
      if (indexWidget instanceof pieMenu.$.oPieSubMenu) indexWidget = indexWidget.button;
      indexWidget.setFocus(true);
    }

    // on distance value change, if the distance is greater than the maxRadius, activate the widget
    if (distance != currentDistance && currentIndex >= 0 && currentIndex < pieMenu.widgets.length){
      currentDistance = distance;
      var indexWidget = pieMenu.widgets[index];

      if (distance){
        log("activating widget "+index+ " " +indexWidget.hasOwnProperty("activate"))
        if (indexWidget.activate) indexWidget.activate();
      }else{
        if (indexWidget.deactivate) indexWidget.deactivate();
      }
    }
  }

  sliceWidget.mouseDownEvent = function(mousePos){
    log("mouse Down at "+mousePos)
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
$.oPieMenu.prototype.getSlicePath = function(center, minAngle, maxAngle, minRadius, maxRadius){
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
$.oPieMenu.prototype.getItemAngleRange = function(index){
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
$.oPieMenu.prototype.getItemAngle = function(index){
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
$.oPieMenu.prototype.getIndexAtAngle = function(angle){
  var angleRange = (this.maxAngle-this.minAngle)/this.widgets.length
  return Math.floor((angle-this.minAngle)/angleRange);
}


/**
 * Get the position from the center for the item based on index.
 * @private
 * @param {int}     index         the index of the widget
 * @return {$.oPoint}
 */
$.oPieMenu.prototype.getItemPosition = function(index){
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
$.oPieMenu.prototype.getMenuRadius = function(){
  var itemsNumber = this.widgets.length
  var _maxRadius = 200;
  var _minRadius = 30;
  var _speed = 10; // the higher the value, the slower the progression

  // hyperbolic tangent function to determin the radius
  var exp = Math.exp(2*itemsNumber/_speed);
  var _radius = ((exp-1)/(exp+1))*_maxRadius+_minRadius;

  return _radius;
}


// /**
//  * Show the button that brings up the submenu
//  * @param {$.oPieMenu}   parent
//  * @private
//  */
// $.oPieMenu.prototype.showButton = function(parent){
//   var _button = this.button;
//   var self = this;

//   var openMenuCallback = function(){
//     self.menuWidget = self.show(parent);
//     self.hideButton();
//   }

//   _button.mouseReleaseEvent = openMenuCallback;
//   _button.show();
//   if (_button.underMouse()){
//     _button.leaveEvent = function(){
//       _button.enterEvent = openMenuCallback;
//       _button.leaveEvent = null;
//     }
//   }else{
//     _button.enterEvent = openMenuCallback;
//   }
// // }


// /**
//  * Hide the button that brings up the submenu
//  * @private
//  */
// $.oPieMenu.prototype.hideButton = function(){
//   var _button = this.button;
//   _button.hide();
//   _button.enterEvent = null;
//   _button.mouseReleaseEvent = false;
// }

// $.oPieMenu.prototype.toString = function(){
//   return "$.oPieMenu"
// }


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
 */
$.oPieSubMenu = function(name, widgets) {
  log("pieSubMenu init")
  // min/max angle and radius will be set from parent during buildWidget()
  this.$.oPieMenu.call(this, name, widgets, false);

  // change these settings before calling show() to modify the look of the pieSubMenu
  this.itemAngle = 0.06;
  this.extraRadius = 80;
  this._parent = undefined;
}
$.oPieSubMenu.prototype = Object.create($.oPieMenu.prototype)


/**
 * The top left point of the entire widget
 * @name $.oPieSubMenu#minAngle
 * @type {$.oPoint}
 */
Object.defineProperty($.oPieSubMenu.prototype, "parentMenu", {
  get: function(){
    return this._parent;
  }
})


/**
 * The top left point of the entire widget
 * @name $.oPieSubMenu#anchor
 * @type {$.oPoint}
 */
Object.defineProperty($.oPieSubMenu.prototype, "anchor", {
  get: function(){
    var point = this.parentMenu.anchor;
    return new this.$.oPoint(point.x, point.y)
  }
})


/**
 * The min radius of the pie background
 * @name $.oPieSubMenu#minRadius
 * @type {int}
 */
Object.defineProperty($.oPieSubMenu.prototype, "minRadius", {
  get: function(){
    return this.parentMenu.maxRadius;
  }
})


/**
 * The max radius of the pie background
 * @name $.oPieSubMenu#maxRadius
 * @type {int}
 */
Object.defineProperty($.oPieSubMenu.prototype, "maxRadius", {
  get: function(){
    return this.minRadius + this.extraRadius;
  }
})


/**
 * activate the menu button when activate() is called on the menu
 * @private
 */
$.oPieSubMenu.prototype.activate = function(){
  this.showMenu(true);
}

/**
 * activate the menu button when activate() is called on the menu
 * @private
 */
$.oPieSubMenu.prototype.deactivate = function(){
  this.showMenu(false);
}


/**
 * In order for pieSubMenus to behave like other pie widgets, we reimplement
 * move() so that it only moves the button, and the slice will remain aligned with
 * the parent.
 * @param  {int}      x     The x coordinate for the button relative to the piewidget
 * @param  {int}      y     The x coordinate for the button relative to the piewidget
 * @private
 */
$.oPieSubMenu.prototype.move = function(x, y){
  log("oPieSubMenu move")
  QWidget.prototype.move.call(this, this.parent().x, this.parent().y);
  this.button.move(x+this.width/2-this.button.width/2, y+this.height/2-this.button.height/2 );
}


/**
 * Function to initialise the widgets for the submenu
 * @param  {int}           index        The index of the menu amongst the parent's widgets
 * @param  {$.oPoint}      position     The position for the button calling the menu
 * @param  {$.oPieMenu}    parent       The menu parent
 * @private
 * @return {QPushButton}        The button that calls the menu.
 */
$.oPieSubMenu.prototype.setParent = function(parent){
  $.oPieMenu.prototype.setParent.call(this, parent);
  this._parent = parent;
  log(this.parent() instanceof QWidget);
  log(this._parent instanceof $.oPieMenu);
}


$.oPieSubMenu.prototype.buildButton = function(){
  // add main button in constructor because it needs to exist before show()
  var menuIcon = specialFolders.resource + "/icons/toolbar/menu.svg";
  var closeIcon = specialFolders.resource + "/icons/toolbar/collapseopen.png";
  var button = new this.$.oPieButton(menuIcon, "", this);
  button.objectName = this.name+"_button";

  // create slots to show/hide submenu elements
  var menu = this;
  this.showMenu = function(visibility){
    menu.slice.visible = visibility;
    for (var i in this.widgets){
      menu.widgets[i].visible = visibility;
      var icon = visibility?closeIcon:menuIcon;
      UiLoader.setSvgIcon(button, icon);
    }
  }

  this.toggleMenu = function(){
    menu.showMenu(!menu.slice.visible);
  }

  button.clicked.connect(this.toggleMenu);

  return button;
}

/**
 * Function to initialise the widgets for the submenu
 * @param  {int}           index        The index of the menu amongst the parent's widgets
 * @param  {$.oPoint}      position     The position for the button calling the menu
 * @param  {$.oPieMenu}    parent       The menu parent
 * @private
 * @return {QPushButton}        The button that calls the menu.
 */
$.oPieSubMenu.prototype.buildWidget = function(){
  log("oPieSubMenu buildWidget")
  if (!this.hasOwnProperty("_parent")){
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

  $.oPieMenu.prototype.buildWidget.call(this);

  this.showMenu(false)
}



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
 *
 */
 $.oPieButton = function(iconFile, text, parent) {
  // if icon isnt provided
  if (typeof parent === 'undefined') var parent = $.app.mainWindow
  if (typeof text === 'undefined') var text = ""
  if (typeof iconFile === 'undefined') var iconFile = specialFolders.resource+"/icons/script/qtgeneric.svg"

  QPushButton.call(this, text, parent);

  this.minimumHeight = 24;
  this.minimumWidth = 24;

  // set during addition to the pie Menu
  this.pieIndex = undefined;

  UiLoader.setSvgIcon(this, iconFile)
  this.setIconSize(new QSize(this.minimumHeight,this.minimumWidth));
  this.cursor = new QCursor(Qt.PointingHandCursor);

  var styleSheet = "QPushButton{ background-color: rgba(0, 0, 0, 1%); }" +
  "QPushButton:hover{ background-color: rgba(0, 200, 255, 80%); }"+
  "QToolTip{ background-color: rgba(0, 255, 255, 100%); }"

  this.setStyleSheet(styleSheet);
}
$.oPieButton.prototype = Object.create(QPushButton.prototype);


$.oPieButton.prototype.activate = function(){
  // reimplement to change the behavior when the button is activated
  log("activate")
  this.clicked()
}


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
 * @param {QWidget}  parent                   The parent QWidget for the button.
 *
 */
$.oScriptButton = function(scriptFile, scriptFunction, parent) {
  this.scriptFile = scriptFile;
  this.scriptFunction = scriptFunction;

  // find an icon for the function in the script-icons folder
  var scriptFile = new this.$.oFile(scriptFile)
  var scriptIconsFolder = new this.$.oFolder(scriptFile.folder.path+"/script-icons");
  var iconFiles = scriptIconsFolder.getFiles(scriptFunction+".*");
  if (iconFiles.length > 0){
    var iconFile = iconFiles[0].path;
  }else{
    // choose default toonboom "missing icon" script icon
    // currently svg icons seem unsupported?
    var iconFile = specialFolders.resource+"/icons/script/qtgeneric.svg"
  }

  this.$.oPieButton.call(this, iconFile, parent);

  // this.minimumHeight = 32;
  // this.minimumWidth = 32;

  // var icon = new QIcon(iconFile);
  // this.icon = icon;
  // this.setIconSize(new QSize(24, 24));

  this.toolTip = this.scriptFunction;
}
$.oScriptButton.prototype = Object.create($.oPieButton.prototype);



/**
 * Runs the script on mouse Click
 * @private
 */
$.oScriptButton.prototype.mouseReleaseEvent = function(){
  var _scriptFile = this.scriptFile;
  var _scriptFunction = this.scriptFunction;
  include(_scriptFile);
  eval(_scriptFunction)();
}




//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oPrefButton class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


$.oPrefButton = function(preferenceString, parent) {
  this.scriptFile = scriptFile;

  // find an icon for the function in the script-icons folder
  var scriptFile = new this.$.oFile(scriptFile)
  var scriptIconsFolder = new this.$.oFolder(scriptFile.folder.path+"/script-icons");
  var iconFiles = scriptIconsFolder.getFiles(scriptFunction+".*");
  if (iconFiles.length > 0){
    var iconFile = iconFiles[0].path;
  }else{
    // choose default toonboom "missing icon" script icon
    // currently svg icons seem unsupported?
    var iconFile = specialFolders.resource+"/icons/script/qtgeneric.svg"
  }

  $.oPieButton.call(this, iconFile, parent);
}
$.oPrefButton.prototype = Object.create($.oPieButton.prototype);