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
 * To react to the user clicking the cancel button, connect a function to $.oProgressDialog.canceled() signal.
 * When $.batchmode is true, the progress will be outputed as a "Progress : value/range" string to the Harmony stdout.
 * @param       {string}              [labelText]                The text displayed above the progress bar.
 * @param       {string}              [range=100]                The maximum value that represents a full progress bar.
 * @param       {string}              [title]                    The title of the dialog
 * @param       {bool}                [show=false]               Whether to immediately show the dialog.
 *
 * @property    {bool}                wasCanceled                Whether the progress bar was cancelled.
 * @property    {$.oSignal}           canceled                   A Signal emited when the dialog is canceled. Can be connected to a callback.
 */
function oProgressDialog ( labelText, range, title, show ){
  if (typeof title === 'undefined') var title = "Progress";
  if (typeof range === 'undefined') var range = 100;
  if (typeof labelText === 'undefined') var labelText = "";

  this._value = 0;
  this._range = range;
  this._title = title;
  this._labelText = labelText;

  this.canceled = new this.$.oSignal();
  this.wasCanceled = false;

  if (!this.$.batchMode) {
    this.progress = new QProgressDialog();
    this.progress.title = this._title;
    this.progress.setLabelText( this._labelText );
    this.progress.setRange( 0, this._range );
    this.progress.setWindowFlags(Qt.Popup|Qt.WindowStaysOnTopHint)

    this.progress["canceled()"].connect( this, function(){this.wasCanceled = true; this.canceled.emit()} );

    if (show) this.show();
  }
}


// legacy compatibility
//$.oDialog.Progress = $.oProgressDialog;


/**
 * The text displayed by the window.
 * @name $.oProgressDialog#label
 * @type {string}
 */
Object.defineProperty( oProgressDialog.prototype, 'label', {
  get: function(){
    return this._labelText;
  },
  set: function( val ){
    this._labelText = val;
    if (!this.$.batchMode) this.progress.setLabelText( val );
  }
});


/**
 * The maximum value that can be displayed by the progress dialog (equivalent to "finished")
 * @name $.oProgressDialog#range
 * @type {int}
 */
Object.defineProperty( oProgressDialog.prototype, 'range', {
    get: function(){
      return this._range;
    },
    set: function( val ){
      this._range = val;
      if (!this.$.batchMode) this.progress.setRange( 0, val );
    }
});


/**
 * The current value of the progress bar. Setting this to the value of 'range' will close the dialog.
 * @name $.oProgressDialog#value
 * @type {int}
 */
Object.defineProperty( oProgressDialog.prototype, 'value', {
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

      // update the widget appearance
      QCoreApplication.processEvents();
    }
});


/**
 * Whether the Progress Dialog was cancelled by the user.
 * @name $.oProgressDialog#cancelled
 * @deprecated use $.oProgressDialog.wasCanceled to get the cancel status, or connect a function to the "canceled" signal.
 */
Object.defineProperty( oProgressDialog.prototype, 'cancelled', {
  get: function(){
    return this.wasCanceled;
  }
});


// oProgressDialog Class Methods

/**
 * Shows the dialog.
 */
oProgressDialog.prototype.show = function(){
  if (this.$.batchMode) {
    this.$.debug("$.oProgressDialog not supported in batch mode", this.$.DEBUG_LEVEL.ERROR)
    return;
  }

  this.progress.show();
}

/**
 * Closes the dialog.
 */
oProgressDialog.prototype.close = function(){
  this.value = this.range;
  this.$.log("Progress : "+this.value+"/"+this._range)

  if (this.$.batchMode) {
    this.$.debug("$.oProgressDialog not supported in batch mode", this.$.DEBUG_LEVEL.ERROR)
    return;
  }

  this.canceled.blocked = true;
  this.progress.close();
  this.canceled.blocked = false;
}


exports.oProgressDialog = oProgressDialog;