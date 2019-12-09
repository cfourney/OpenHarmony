//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, Chris Fourney...
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
//   This library is made available under the MIT license.
//   https://opensource.org/licenses/mit
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
//          $.dialog class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The base class for the $.oDialog.
 * @constructor
 * @classdesc  $.oDialog Base Class -- helper class for showing GUI content.
 */
$.oDialog = function( ){

}


/**
 * Prompts with a confirmation dialog (yes/no choice).
 * @name    $.oDialog#confirm
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 * @param   {string}           [cancelButtonText]             The text on the CANCEL button of the dialog.
 * 
 * @return  {bool}       Result of the confirmation dialog.
 */
$.oDialog.prototype.confirm = function( title, labelText, okButtonText, cancelButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.confirm not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }
  
  if (typeof title === 'undefined')            var title = "Confirmation";
  if (typeof okButtonText === 'undefined')     var okButtonText = "Okay";
  if (typeof cancelButtonText === 'undefined') var cancelButtonText = "Cancel";
  if (typeof labelText === 'undefined')        var labelText = false;
  
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
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 * 
 */
$.oDialog.prototype.alert = function( title, labelText, okButtonText ){ 
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.alert not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }
  
  if (typeof title === 'undefined')            var title = "Alert";
  if (typeof okButtonText === 'undefined')     var okButtonText = "OK";
  if (typeof labelText === 'undefined')        var labelText = false;
  
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
 * Prompts with an alert dialog (informational).
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
  
  var _folder = QFileDialog.getExistingDirectory(0, text, startDirectory)
  
  this.$.debug(_folder)
  return _folder;
}
 
 
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//    $.oDialog.Progress class      //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

 
/**
 * The $.dialog.Progress constructor.
 * @name        $.oDialog.Progress
 * @constructor
 * @classdesc   An simple progress dialog to
 * @param       {string}              labelText                  The path to the folder.
 * @param       {string}              range                      The path to the folder.
 * @param       {bool}                show                       Whether to immediately show the dialog.
 *
 * @property    {bool}                cancelled                  Whether the progress bar was cancelled.
 */
$.oDialog.prototype.Progress  = function( labelText, range, show ){
    if (this.$.batchMode) {
      this.$.debug("$.oDialog.Progress not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
      return;
    }
  
  
    if (typeof title === 'undefined')            var title = "Progress";  
    if (typeof range === 'undefined')            var range = 100;
    if (typeof labelText === 'undefined')        var labelText = "";
    
    this.progress = new QProgressDialog();
    
    this.progress.setLabelText( labelText );
    this.progress.setRange( 0, range );
  
    this._value     = 0;
    this._range     = range;
    this._labelText = labelText;
    
    if ( show ){
      this.progress.show();
    }
    
    this.cancelled = false;
    
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
 * Shows the dialog.
 * @name    $.oDialog.Progress#show
 * @param   {string}   title 
 * @param   {string}   labelText
 * @param   {string}   okButtonText
 */
$.oDialog.prototype.Progress.prototype.show = function( title, labelText, okButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.Progress not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }
  
  this.progress.show();
}

/**
 * Closes the dialog.
 * 
 */
$.oDialog.prototype.Progress.prototype.close = function( title, labelText, okButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.Progress not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  this.value = this.range;
  this.progress.hide();
  this.progress = false;
}


/**
 * The text of the window.
 * @name $.oDialog.Progress#text
 * @type {string}
 */
Object.defineProperty( $.oDialog.prototype.Progress.prototype, 'text', {
  
    get: function(){
      return this._labelText;
    },
    set: function( val ){
      this._labelText = val;
      this.progress.setLabelText( val );
    }
});


/**
 * The range of the window.
 * @name $.oDialog.Progress#range
 * @type {int}
 */
Object.defineProperty( $.oDialog.prototype.Progress.prototype, 'range', {
    get: function(){
      return this._range;
    },
    set: function( val ){
      this._range = val;
      this.progress.setRange( 0, val );
      QCoreApplication.processEvents();
    }
});


/**
 * The current value of the window.
 * @name $.oDialog.Progress#value
 * @type {int}
 */
Object.defineProperty( $.oDialog.prototype.Progress.prototype, 'value', {
    get: function(){
      return this._value;
    },
    set: function( val ){
      this.progress.setValue( val );
      QCoreApplication.processEvents();
    }
});
