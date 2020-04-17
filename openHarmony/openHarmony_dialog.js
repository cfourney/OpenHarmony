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
  if (typeof okButtonText === 'undefined')     var okButtonText = "Okay";
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
 * @param       {bool}                [show=false]               Whether to immediately show the dialog.
 * @param       {string}              [title]                    The title of the dialog
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
  // circle in multiples of Pi. Going clockwise, 0 is left, 1 is right, -0.5 is the bottom from the left, 
  // and 1.5 is the bottom from the right side. 0.5 is the top of the circle.
  var menu = new $.oPieMenu("menu", widgets, -0.2, 1.2);

  // we show it!
  menu.show();
}
 */
$.oPieMenu = function( name, widgets, minAngle, maxAngle, radius, position, show ){
  this.name = name;
  this.widgets = widgets;

  if (typeof minAngle === 'undefined') var minAngle = 0;
  if (typeof maxAngle === 'undefined') var maxAngle = 1;
  if (typeof radius === 'undefined') var radius = this.getMenuRadius();;
  if (typeof position === 'undefined') var position = this.$.app.mousePosition;
  if (typeof show === 'undefined') var show = false;

  this.radius = radius;
  this.minAngle = minAngle;
  this.maxAngle = maxAngle;
  this.position = position;

  if (show) this.show();
}


/**
 * Build and show the pie menu.
 * @param {$.oPieMenu}   [parent]    specify a parent oPieMenu for imbricated submenus
 */
$.oPieMenu.prototype.show = function(parent){
  // menu geometry
  this._x = this.position.x-this.radius*2;
  this._y = this.position.y-this.radius*2;
  this._height = 4*this.radius;
  this._width = 4*this.radius;

  var _pieMenu = new QWidget;
  var flags = Qt.FramelessWindowHint;
  _pieMenu.setWindowFlags(flags);
  _pieMenu.setAttribute(Qt.WA_TranslucentBackground);

  var menuWidgetCenter = new this.$.oPoint(this._height/2, this._width/2);
  var closeButtonPosition = menuWidgetCenter;

  // set position/dimensions to parent if present
  if (typeof parent !== 'undefined'){
    this._x = 0;
    this._y = 0;
    this._height = parent._height;
    this._width = parent._width;

    closeButtonPosition = this.position;
    _pieMenu.setParent(parent.menuWidget);
  } 
  
  _pieMenu.move(this._x, this._y);
  _pieMenu.minimumHeight = this._height;
  _pieMenu.minimumWidth = this._width;

  // arrange widgets into half a circle around the center
  var menuWidgetCenter = new this.$.oPoint(this._height/2, this._width/2);

  for (var i=0; i < this.widgets.length; i++){
    var widget = this.widgets[i];
    var _itemPosition = this.getItemPosition(i, this.radius, this.minAngle, this.maxAngle);
    var _widgetPosition = new this.$.oPoint(menuWidgetCenter.x+_itemPosition.x, menuWidgetCenter.y+_itemPosition.y);

    if (widget instanceof oPieSubMenu) widget = widget.init(i, _widgetPosition, this);
    
    widget.setParent(_pieMenu);
    widget.show();

    widget.move(_widgetPosition.x-widget.width/2 ,_widgetPosition.y-widget.height/2);
  }

  // add close button
  var closeButton = new QPushButton("close", _pieMenu);
  closeButton.objectName = this.name+"_closeButton";
  closeButton.show();

  closeButton.move(closeButtonPosition.x-(closeButton.width/2), closeButtonPosition.y-(closeButton.height/2));

  if (parent){  
    var self = this;
    var closeCallback = function(){
      _pieMenu.close();
      self.button.show();
    }
    closeButton.clicked.connect(closeCallback);
  }else{
    closeButton.clicked.connect(_pieMenu.close);
  }

  _pieMenu.show();
  this.menuWidget = _pieMenu;

  return _pieMenu;
}


/**
 * Get the angle for the item based on index.
 * @param {int}     index         the index of the widget 
 * @return {$.oPoint}
 */
$.oPieMenu.prototype.getItemAngle = function(index){
  var length = this.widgets.length-1;
  var angle = this.minAngle+((length-index)/length)*(this.maxAngle-this.minAngle);
  
  return angle;
}


/**
 * Get the position from the center for the item based on index.
 * @param {int}     index         the index of the widget 
 * @param {int}     radius        the radius of the menu
 * @return {$.oPoint}
 */
$.oPieMenu.prototype.getItemPosition = function(index, radius){
  var angle = this.getItemAngle(index, this.minAngle, this.maxAngle);
  var pi = Math.PI;
  var _x = Math.cos(angle*pi)*radius;
  var _y = Math.sin(angle*pi+pi)*radius;
  
  return new this.$.oPoint(_x, _y, 0);
}


/**
 * Get a pie menu radius setting for a given amount of items.
 * @param {int}     itemsNumber         the ammount of items to display 
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
 * The $.oPieMenu constructor.
 * @name        $.oPieSubMenu
 * @constructor
 * @classdesc   A type of menu with nested levels that appear around the mouse
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
  this.name = name;
  this.widgets = widgets;
  this.menu = "";
  this.itemAngle = 0.06;
  this.extraRadius = 80;
}


/**
 * Function to initialise the widgets for the submenu
 * @param  {int}           index        The index of the menu amongst the parent's widgets
 * @param  {$.oPoint}      position     The position for the button calling the menu
 * @param  {$.oPieMenu}    parent       The menu parent
 * @private
 * @return {QPushButton}        The button that calls the menu.
 */
$.oPieSubMenu.prototype.init = function(index, position, parent){
  var name = this.name;
  var angle = parent.getItemAngle(index);
  var widgetNum = this.widgets.length/2;
  var minAngle = angle-widgetNum*this.itemAngle;
  var maxAngle = angle+widgetNum*this.itemAngle;
  var radius = parent.radius+this.extraRadius;

  // create the menu
  this.menu = new this.$.oPieMenu(name, this.widgets, minAngle, maxAngle, radius, position, false)

  // initialise the button to open the menu
  this.menu.button = new QPushButton;
  this.menu.button.text = name;

  var self = this;
  this.showCallback = function(){
    self.menuWidget = self.menu.show(parent);
    self.menu.button.hide();
  }
  this.menu.button.clicked.connect(self.showCallback);

  return this.menu.button;
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
