//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//      $.oColorButton class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


var oPieButton = require("./oPieButton.js")

/**
 * The constructor for $.oColorButton
 * @name          $.oColorButton
 * @constructor
 * @classdescription This subclass of QPushButton provides an easy way to create a button to choose a color from a palette.
 * This class is a subclass of QPushButton and all the methods from that class are available to modify this button.
 * @param {string}   paletteName              The name of the palette that contains the color
 * @param {string}   colorName                The name of the color (if more than one is present, will pick the first match)
 * @param {bool}     showName                 Wether to display the name of the color on the button
 * @param {QWidget}  parent                   The parent QWidget for the button. Automatically set during initialisation of the menu.
 *
 */
 oColorButton = function(paletteName, colorName, showName, parent) {
  this.paletteName = paletteName;
  this.colorName = colorName;

  if (typeof showName === "undefined") var showName = false;

  this.$.oPieButton.call(this, "", showName?colorName:"", parent);

  var palette = this.$.scn.getPaletteByName(paletteName);
  var color = palette.getColorByName(colorName);
  var colorValue = color.value

  var iconMap = new QPixmap(this.minimumHeight,this.minimumHeight)
  iconMap.fill(new QColor(colorValue.r, colorValue.g, colorValue.b, colorValue.a))
  var icon = new QIcon(iconMap);

  this.icon = icon;

  this.toolTip = this.paletteName + ": " + this.colorName;
}
oColorButton.prototype = Object.create(oPieButton.prototype);


oColorButton.prototype.activate = function(){
  var palette = this.$.scn.getPaletteByName(this.paletteName);
  var color = palette.getColorByName(this.colorName);

  this.$.scn.currentPalette = palette;
  palette.currentColor = color;
  this.closeMenu()
}

exports = oColorButton;