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
//          $.oApp class            //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * The constructor for the $.oApp class
 * @classdesc
 * The $.oApp class provides access to the Harmony application and its widgets.
 * @constructor
 */
$.oApp = function(){
}


/**
 * The Harmony version string
 * @name $.oApp#version
 */
Object.defineProperty($.oApp.prototype, 'version', {
  get : function(){

  }
});


/**
 * @name $.oApp#flavour
 */
Object.defineProperty($.oApp.prototype, 'flavour', {
  get : function(){

  }
});


/**
 * The Harmony Main Window.
 * @name $.oApp#mainWindow
 * @type {QWidget}
 */
Object.defineProperty($.oApp.prototype, 'mainWindow', {
  get : function(){
    var windows = QApplication.topLevelWidgets();
    for ( var i in windows) {
      if (windows[i] instanceof QMainWindow && !windows[i].parentWidget()) return windows[i];
    }
    return false
  }
});


/**
 * The Harmony UI Toolbars.
 * @name $.oApp#toolbars
 * @type {QToolbar}
 */
Object.defineProperty($.oApp.prototype, 'toolbars', {
  get : function(){
    var widgets = QApplication.allWidgets();
    var _toolbars = widgets.filter(function(x){return x instanceof QToolBar})

    return _toolbars
  }
});



/**
 * The Position of the mouse cursor in the toonboom window coordinates.
 * @name $.oApp#mousePosition
 * @type {$.oPoint}
 */
Object.defineProperty($.oApp.prototype, 'mousePosition', {
  get : function(){
    var _position = this.$.app.mainWindow.mapFromGlobal(QCursor.pos());
    return new this.$.oPoint(_position.x(), _position.y(), 0);
  }
});


/**
 * The Position of the mouse cursor in the screen coordinates.
 * @name $.oApp#globalMousePosition
 * @type {$.oPoint}
 */
Object.defineProperty($.oApp.prototype, 'globalMousePosition', {
  get : function(){
    var _position = QCursor.pos();
    return new this.$.oPoint(_position.x(), _position.y(), 0);
  }
});



/**
 * Gets access to a widget from the Harmony Interface.
 * @param   {string}   name              The name of the widget to look for.
 * @param   {string}   [parentName]      The name of the parent widget to look into, in case of duplicates.
 * @return  {QWidget}   The widget if found, or null if it doesn't exist.
 */
$.oApp.prototype.getWidgetByName = function(name, parentName){
  var widgets = QApplication.allWidgets();
  for( var i in widgets){
    if (widgets[i].objectName == name){
      if (typeof parentName !== 'undefined' && (widgets[i].parentWidget().objectName != parentName)) continue;
      return widgets[i];
    }
  }
  return null;
}


/**
 * Access the Harmony Preferences
 * @name $.oApp#preferences
 * @example
 * // To access the preferences of Harmony, grab the preference object in the $.oApp class:
 * var prefs = $.app.preferences;
 * 
 * // It's then possible to access all available preferences of the software:
 * for (var i in prefs){
 *   log (i+" "+prefs[i]);
 * }
 * 
 * // accessing the preference value can be done directly by using the dot notation:
 * prefs.USE_OVERLAY_UNDERLAY_ART = true;
 * log (prefs.USE_OVERLAY_UNDERLAY_ART);
 * 
 * //the details objects of the preferences object allows access to more information about each preference
 * var details = prefs.details
 * log(details.USE_OVERLAY_UNDERLAY_ART.category+" "+details.USE_OVERLAY_UNDERLAY_ART.id+" "+details.USE_OVERLAY_UNDERLAY_ART.type);
 * 
 * for (var i in details){
 *   log(i+" "+JSON.stringify(details[i]))       // each object inside detail is a complete oPreference instance
 * }
 * 
 * // the preference object also holds a categories array with the list of all categories
 * log (prefs.categories)
 */
Object.defineProperty($.oApp.prototype, 'preferences', {
  get: function(){
    if (typeof this._prefsObject === 'undefined'){
      var _prefsObject = {};
      _categories = [];
      _details = {};

      Object.defineProperty(_prefsObject, "categories", {
        enumerable:false,
        value:_categories
      })
      
      Object.defineProperty(_prefsObject, "details", {
        enumerable:false,
        value:_details
      })
      
      var prefFile = (new oFile(specialFolders.resource+"/prefs.xml")).parseAsXml().children[0].children;

      var userPrefFile = {objectName: "category", id: "user", children:(new oFile(specialFolders.userConfig + "/Harmony Premium-pref.xml")).parseAsXml().children[0].children};
      prefFile.push(userPrefFile);

      for (var i in prefFile){
        if (prefFile[i].objectName != "category" || prefFile[i].id == "Storyboard") continue;
        var category = prefFile[i].id;
        if (_categories.indexOf(category) == -1) _categories.push(category);

        var preferences = prefFile[i].children;

        // create a oPreference instance for each found preference and add a getter setter to the $.oApp._prefsObject
        for (var j in preferences){

          // evaluate condition for conditional preferences. For now only support Harmony Premium prefs
          if (preferences[j].objectName == "if"){
            var condition = preferences[j].condition;
            var regex = /(not essentials|not sboard|not paint)/
            if (regex.exec(condition)) preferences = preferences.concat(preferences[j].children)
            continue;
          }
          var type = preferences[j].objectName;
          var keyword = preferences[j].id;
          var description = preferences[j].shortDesc;
          var descriptionText = preferences[j].longDesc;
          if (type == "color"){
            if (typeof preferences[j].alpha === 'undefined') preferences[j].alpha = 255;
            var value = new ColorRGBA(preferences[j].red, preferences[j].green, preferences[j].blue, preferences[j].alpha)
          }else{
            var value = preferences[j].value;
          }
          // var docString = (category+" "+keyword+" "+type+" "+description)
          //
          var pref = this.$.oPreference.createPreference(category, keyword, type, value, description, descriptionText, _prefsObject);
          _details[pref.keyword] = pref;
        }
      }

      this._prefsObject = _prefsObject;
    }

    return this._prefsObject;
  }
})



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oToolbar class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * The $.oToolbar constructor.
 * @name        $.oToolbar
 * @constructor
 * @classdesc   A toolbar that can contain any type of widgets.
 * @param       {string}     name              The name of the toolbar to create.
 * @param       {QWidget[]} [widgets]          The list of widgets to add to the toolbar.
 * @param       {QWidget}   [parent]           The parent widget to add the toolbar to.
 * @param       {bool}      [show]             Whether to show the toolbar instantly after creation.
 */
$.oToolbar = function( name, widgets, parent, show ){
  if (typeof parent === 'undefined') var parent = $.app.mainWindow;
  if (typeof widgets === 'undefined') var widgets = [];
  if (typeof show === 'undefined') var show = true;

  this.name = name;
  this._widgets = widgets;
  this._parent = parent;

  if (show) this.show();
}


/**
 * Shows the oToolbar.
 * @name    $.oToolbar#show
 */
$.oToolbar.prototype.show = function(){
  if (this.$.batchMode) {
    this.$.debug("$.oToolbar not supported in batch mode", this.$.DEBUG_LEVEL.ERROR)
    return;
  }

  var _parent = this._parent;
  var _toolbar = new QToolbar();
  _toolbar.objectName = this.name;

  for (var i in this.widgets){
    _toolbar.addWidget(this.widgets[i]);
  }

  _parent.addToolbar(_toolbar);
  this.toolbar = _toolbar;

  return this.toolbar;
}
