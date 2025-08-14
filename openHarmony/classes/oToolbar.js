
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
function oToolbar ( name, widgets, parent, show ){
  if (typeof parent === 'undefined') var parent = this.$.app.mainWindow;
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
oToolbar.prototype.show = function(){
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

exports.oToolbar = oToolbar;