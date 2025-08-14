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
function oDialog (){
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

oDialog.prototype.confirm = function( labelText, title, okButtonText, cancelButtonText ){
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
oDialog.prototype.alert = function( labelText, title, okButtonText ){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.alert not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof labelText === 'undefined') var labelText = "Alert!";
  if (typeof title === 'undefined') var title = "Alert";
  if (typeof okButtonText === 'undefined') var okButtonText = "OK";

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
 * @param   {string}           [okButtonText="OK"]            The text on the OK button of the dialog.
 * @param   {bool}             [htmlSupport=false]
 */
oDialog.prototype.alertBox = function( labelText, title, okButtonText, htmlSupport){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.alert not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof labelText === 'undefined') var labelText = "";
  if (typeof title === 'undefined') var title = "";
  if (typeof okButtonText === 'undefined') var okButtonText = "OK";
  if (typeof htmlSupport === 'undefined') var htmlSupport = false;

  this.$.debug(labelText, this.$.DEBUG_LEVEL.LOG)

  var d = new QDialog();

  if (htmlSupport){
    var label = new QTextEdit(labelText + "");
  }else{
    var label = new QPlainTextEdit(labelText + "");
  }
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
 * Prompts with an toast alert. This is a small message that can't be clicked and only stays on the screen for the duration specified.
 * @param   {string}         labelText          The label/internal text of the dialog.
 * @param   {$.oPoint}       [position]         The position on the screen where the toast will appear (by default, slightly under the middle of the screen).
 * @param   {float}          [duration=2000]    The duration of the display (in milliseconds).
 * @param   {$.oColorValue}  [color="#000000"]  The color of the background (a 50% alpha value will be applied).
 */
oDialog.prototype.toast = function(labelText, position, duration, color){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.alert not supported in batch mode", this.$.DEBUG_LEVEL.WARNING);
    return;
  }

  if (typeof duration === 'undefined') var duration = 2000;
  if (typeof color === 'undefined') var color = new $.oColorValue(0,0,0);
  
  var toast = new QWidget()
  if (this.$.app.version + this.$.app.minorVersion > 21){
    // above Harmony 21.1
    if (typeof position === 'undefined'){
      var center = QApplication.desktop().availableGeometry.center();
      var position = new $.oPoint(center.x(), center.y()+UiLoader.dpiScale(150))
    }
    var flags = new Qt.WindowFlags(Qt.Tool|Qt.FramelessWindowHint); // https://qtcentre.org/threads/71912-Qt-WA_TransparentForMouseEvents
    toast.setWindowFlags(flags);
    toast.setAttribute(Qt.WA_TranslucentBackground);
  } else {
    if (typeof position === 'undefined'){
      var center = QApplication.desktop().screen().rect.center();
      var position = new $.oPoint(center.x(), center.y()+UiLoader.dpiScale(150))
    }
    var flags = new Qt.WindowFlags(Qt.Popup|Qt.FramelessWindowHint|Qt.WA_TransparentForMouseEvents);
    toast.setWindowFlags(flags);
    toast.setAttribute(Qt.WA_TranslucentBackground);
  }
  toast.setAttribute(Qt.WA_DeleteOnClose);

  var styleSheet = "QWidget {" +
  "background-color: rgba("+color.r+", "+color.g+", "+color.b+", 50%); " +
  "color: white; " +
  "border-radius: "+UiLoader.dpiScale(10)+"px; " +
  "padding: "+UiLoader.dpiScale(10)+"px; " +
  "font-family: Arial; " +
  "font-size: "+UiLoader.dpiScale(12)+"pt;}"

  toast.setStyleSheet(styleSheet);

  var layout = new QHBoxLayout(toast);
  layout.addWidget(new QLabel(labelText), 0, Qt.AlignHCenter);

  var timer = new QTimer()
  timer.singleShot = true;
  timer.timeout.connect(this, function(){
    toast.close();
  })

  toast.show();

  toast.move(position.x-toast.width/2, position.y);

  timer.start(duration);
}


/**
 * Prompts for a user input.
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [prefilledText]                The text to display in the input area.
 *
 */
oDialog.prototype.prompt = function( labelText, title, prefilledText){
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
oDialog.prototype.browseForFile = function( text, filter, getExisting, acceptMultiple, startDirectory){
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
      var _files = QFileDialog.getOpenFileNames(0, text, startDirectory, filter);
    }else{
      var _files = QFileDialog.getOpenFileName(0, text, startDirectory, filter);
    }
  }else{
    var _files = QFileDialog.getSaveFileName(0, text, startDirectory, filter);
  }

  for (var i in _files){
    _files[i] = _files[i].replace(/\\/g, "/");
  }

  this.$.debug(_files);
  return _files;
}


/**
 * Prompts with a browse for folder dialog (informational).
 * @param   {string}           [text]                        The title of the confirmation dialog.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 *
 * @return  {string}           The path of the selected folder, 'undefined' if the dialog is cancelled
 */
oDialog.prototype.browseForFolder = function(text, startDirectory){
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


/**
 * Prompts with a file selector window
 * @param   {string}           [text="Select a file:"]       The title of the file browser dialog.
 * @param   {string}           [filter="*"]                  The filter for the file type and/or file name that can be selected. Accepts wildcard charater "*".
 * @param   {string}           [getExisting=true]            Whether to select an existing file or a save location
 * @param   {string}           [acceptMultiple=false]        Whether or not selecting more than one file is ok. Is ignored if getExisting is false.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 *
 * @return  {oFile[]}           An oFile array, or 'undefined' if the dialog is cancelled
 */
oDialog.prototype.chooseFile = function( text, filter, getExisting, acceptMultiple, startDirectory){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.chooseFile not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof text === 'undefined') var text = "Select a file:";
  if (typeof filter === 'undefined') var filter = "*"
  if (typeof getExisting === 'undefined') var getExisting = true;
  if (typeof acceptMultiple === 'undefined') var acceptMultiple = false;


  if (getExisting){
    if (acceptMultiple){
      var _chosen = QFileDialog.getOpenFileNames(0, text, startDirectory, filter);
    }else{
      var _chosen = QFileDialog.getOpenFileName(0, text, startDirectory, filter);
    }
  }else{
    var _chosen = QFileDialog.getSaveFileName(0, text, startDirectory, filter);
  }

  // If acceptMultiple is true, we get an empty array on cancel, otherwise we get an empty string
  // length is 0 for both cases, but an empty array is truthy in my testing
  if (!_chosen.length) return undefined;

  try {
    _chosen = _chosen.map(function(thisFile){return new $.oFile(thisFile);});
  } catch (err) {
    // No "map" method means not an array
    _chosen = [new this.$.oFile(_chosen)];
  }

  this.$.debug(_chosen);
  return _chosen;
}


/**
 * Prompts with a browse for folder dialog.
 * @param   {string}           [text]                        The title of the file browser dialog.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 *
 * @return  {oFolder}           An oFolder for the selected folder, or undefined if dialog was cancelled
 */
oDialog.prototype.chooseFolder = function(text, startDirectory){
  if (this.$.batchMode) {
    this.$.debug("$.oDialog.chooseFolder not supported in batch mode", this.$.DEBUG_LEVEL.WARNING)
    return;
  }

  if (typeof text === 'undefined') var text = "Select a folder:";

  var _folder = QFileDialog.getExistingDirectory(0, text, startDirectory);

  if (!_folder) return undefined; // User cancelled

  return new this.$.oFolder(_folder);
}


exports.oDialog = oDialog;