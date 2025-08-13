
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oPrefButton class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


var oPieButton = require("./oPieButton.js")

/**
 * The constructor for $.oPrefButton
 * @name          $.oPrefButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button to change a boolean preference.
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   preferenceString         The name of the preference to show/change.
 * @param {string}   text                     A text for the button display.
 * @param {string}   iconFile                 An icon path for the button.
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 */
oPrefButton = function(preferenceString, text, iconFile, parent) {
  this.preferenceString = preferenceString;

  if (typeof iconFile === 'undefined') var iconFile = specialFolders.resource+"/icons/toolproperties/settings.svg";
  this.checkable = true;
  this.checked = preferences.getBool(preferenceString, true);

  $.oPieButton.call(this, iconFile, text, parent);

  this.toolTip = this.preferenceString;
}
oPrefButton.prototype = Object.create(oPieButton.prototype);


oPrefButton.prototype.activate = function(){
  var value = preferences.getBool(this.preferenceString, true);
  this.checked != value;
  preferences.setBool(this.preferenceString, value);
  this.closeMenu()
}

exports = oPrefButton;