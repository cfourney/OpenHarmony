//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oColorValue class       //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * This class holds a color value. It can be used to set color attributes to a specific value and to convert colors between different formats such as hex strings, RGBA decompositions, as well as HSL values.
 * @constructor
 * @classdesc  Constructor for the $.oColorValue Class.
 * @param   {string/object}            colorValue            Hex string value, or object in form {rgba}
 *
 * @property {int}                    r                      The int value of the red component.
 * @property {int}                    g                      The int value of the green component.
 * @property {int}                    b                      The int value of the blue component.
 * @property {int}                    a                      The int value of the alpha component.
 * @example
 * // initialise the class to start setting up attributes and making conversions by creating a new instance
 *
 * var myColor = new $.oColorValue("#336600ff");
 * $.log(myColor.r+" "+mycolor.g+" "+myColor.b+" "+myColor+a) // you can then access each component of the color
 *
 * var myBackdrop = $.scn.root.addBackdrop("Backdrop")
 * var myBackdrop.color = myColor                             // can be used to set the color of a backdrop
 *
 */
function oColorValue ( colorValue ){
    if (typeof colorValue === 'undefined') var colorValue = "#000000ff";

    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 255;

    //Special case in which RGBA values are defined directly.
    switch( arguments.length ){
      case 4:
        this.a = ( (typeof arguments[3]) == "number" ) ? arguments[3] : 0;
      case 3:
        this.r = ( (typeof arguments[0]) == "number" ) ? arguments[0] : 0;
        this.g = ( (typeof arguments[1]) == "number" ) ? arguments[1] : 0;
        this.b = ( (typeof arguments[2]) == "number" ) ? arguments[2] : 0;
        return;
      default:
    }

    if (typeof colorValue === 'string'){
      this.fromColorString(colorValue);
    }else{
      if (typeof colorValue.r === 'undefined') colorValue.r = 0;
      if (typeof colorValue.g === 'undefined') colorValue.g = 0;
      if (typeof colorValue.b === 'undefined') colorValue.b = 0;
      if (typeof colorValue.a === 'undefined') colorValue.a = 255;

      this.r = colorValue.r;
      this.g = colorValue.g;
      this.b = colorValue.b;
      this.a = colorValue.a;
    }
}


/**
 * Gets the color's HUE value.
 * @name $.oColorValue#h
 * @type {float}
 */
Object.defineProperty(oColorValue.prototype, 'h', {
    get : function(){
        var r = this.r;
        var g = this.g;
        var b = this.b;

        var cmin = Math.min(r,g,b);
        var cmax = Math.max(r,g,b);
        var delta = cmax - cmin;
        var h = 0;
        var s = 0;
        var l = 0;

        if (delta == 0){
          h = 0.0;
        // Red is max
        }else if (cmax == r){
          h = ((g - b) / delta) % 6.0;
        // Green is max
        }else if (cmax == g){
          h = (b - r) / delta + 2.0;
        // Blue is max
        }else{
          h = (r - g) / delta + 4.0;
        }

        h = Math.round(h * 60.0);

        //WRAP IN 360.
        if (h < 0){
            h += 360.0;
        }

        // // Calculate lightness
        // l = (cmax + cmin) / 2.0;

        // // Calculate saturation
        // s = delta == 0 ? 0 : delta / (1.0 - Math.abs(2.0 * l - 1.0));

        // s = Math.min( Math.abs(s)*100.0, 100.0 );
        // l = (Math.abs(l)/255.0)*100.0;

        return h;
    },

    set : function( new_h ){
      var h = Math.min( new_h, 360.0 );
      var s = Math.min( this.s, 100.0 )/100.0;
      var l = Math.min( this.l, 100.0 )/100.0;

      var c = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
      var x = c * (1 - Math.abs((h / 60.0) % 2.0 - 1.0));
      var m = l - c/2.0;
      var r = 0.0;
      var g = 0.0;
      var b = 0.0;

      if (0.0 <= h && h < 60.0) {
        r = c; g = x; b = 0;
      } else if (60.0 <= h && h < 120.0) {
        r = x; g = c; b = 0;
      } else if (120.0 <= h && h < 180.0) {
        r = 0; g = c; b = x;
      } else if (180.0 <= h && h < 240.0) {
        r = 0; g = x; b = c;
      } else if (240.0 <= h && h < 300.0) {
        r = x; g = 0; b = c;
      } else if (300.0 <= h && h < 360.0) {
        r = c; g = 0; b = x;
      }

      this.r = (r + m) * 255.0;
      this.g = (g + m) * 255.0;
      this.b = (b + m) * 255.0;
    }
});


/**
 * Gets the color's SATURATION value.
 * @name $.oColorValue#s
 * @type {float}
 */
Object.defineProperty(oColorValue.prototype, 's', {
    get : function(){
        var r = this.r;
        var g = this.g;
        var b = this.b;

        var cmin = Math.min(r,g,b);
        var cmax = Math.max(r,g,b);
        var delta = cmax - cmin;
        var s = 0;
        var l = 0;

        // Calculate lightness
        l = (cmax + cmin) / 2.0;
        s = delta == 0 ? 0 : delta / (1.0 - Math.abs(2.0 * l - 1.0));

        // Calculate saturation
        s = Math.min( Math.abs(s)*100.0, 100.0 );

        return s;
    },

    set : function( new_s ){
      var h = Math.min( this.h, 360.0 );
      var s = Math.min( new_s, 100.0 )/100.0;
      var l = Math.min( this.l, 100.0 )/100.0;

      var c = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
      var x = c * (1 - Math.abs((h / 60.0) % 2.0 - 1.0));
      var m = l - c/2.0;
      var r = 0.0;
      var g = 0.0;
      var b = 0.0;

      if (0.0 <= h && h < 60.0) {
        r = c; g = x; b = 0;
      } else if (60.0 <= h && h < 120.0) {
        r = x; g = c; b = 0;
      } else if (120.0 <= h && h < 180.0) {
        r = 0; g = c; b = x;
      } else if (180.0 <= h && h < 240.0) {
        r = 0; g = x; b = c;
      } else if (240.0 <= h && h < 300.0) {
        r = x; g = 0; b = c;
      } else if (300.0 <= h && h < 360.0) {
        r = c; g = 0; b = x;
      }

      this.r = (r + m) * 255.0;
      this.g = (g + m) * 255.0;
      this.b = (b + m) * 255.0;
    }
});


/**
 * Gets the color's LIGHTNESS value.
 * @name $.oColorValue#l
 * @type {float}
 */
Object.defineProperty(oColorValue.prototype, 'l', {
    get : function(){
        var r = this.r;
        var g = this.g;
        var b = this.b;

        var cmin = Math.min(r,g,b);
        var cmax = Math.max(r,g,b);
        var delta = cmax - cmin;
        var s = 0;
        var l = 0;


        // Calculate lightness
        l = (cmax + cmin) / 2.0;
        l = (Math.abs(l)/255.0)*100.0;
        return l;
    },

    set : function( new_l ){
      var h = Math.min( this.h, 360.0 );
      var s = Math.min( this.s, 100.0 )/100.0;
      var l = Math.min( new_l, 100.0 )/100.0;

      var c = (1.0 - Math.abs(2.0 * l - 1.0)) * s;
      var x = c * (1 - Math.abs((h / 60.0) % 2.0 - 1.0));
      var m = l - c/2.0;
      var r = 0.0;
      var g = 0.0;
      var b = 0.0;

      if (0.0 <= h && h < 60.0) {
        r = c; g = x; b = 0;
      } else if (60.0 <= h && h < 120.0) {
        r = x; g = c; b = 0;
      } else if (120.0 <= h && h < 180.0) {
        r = 0; g = c; b = x;
      } else if (180.0 <= h && h < 240.0) {
        r = 0; g = x; b = c;
      } else if (240.0 <= h && h < 300.0) {
        r = x; g = 0; b = c;
      } else if (300.0 <= h && h < 360.0) {
        r = c; g = 0; b = x;
      }

      this.r = (r + m) * 255.0;
      this.g = (g + m) * 255.0;
      this.b = (b + m) * 255.0;
    }
});


/**
 * Creates an int from the color value, as used for backdrop colors.
 * @return: {string}       ALPHA<<24  RED<<16  GREEN<<8  BLUE
 */
oColorValue.prototype.toInt = function (){
     return ((this.a & 0xff) << 24) | ((this.r & 0xff) << 16) | ((this.g & 0xff) << 8) | (this.b & 0xff);
}


/**
 * The colour value represented as a string.
 * @return: {string}       RGBA components in a string in format #RRGGBBAA
 */
oColorValue.prototype.toString = function (){
    var _hex = "#";

    var r = ("00"+this.r.toString(16)).slice(-2);
    var g = ("00"+this.g.toString(16)).slice(-2);
    var b = ("00"+this.b.toString(16)).slice(-2);
    var a = ("00"+this.a.toString(16)).slice(-2);

    _hex += r + g + b + a;

    return _hex;
}


/**
 * The colour value represented as a string.
 * @return: {string}       RGBA components in a string in format #RRGGBBAA
 */
oColorValue.prototype.toHex = function (){
  return this.toString();
}


/**
 * Ingest a hex string in form #RRGGBBAA to define the colour.
 * @param   {string}    hexString                The colour in form #RRGGBBAA
 */
oColorValue.prototype.fromColorString = function (hexString){
    hexString = hexString.replace("#","");
    if (hexString.length == 6) hexString += "ff";
    if (hexString.length != 8) throw new Error("incorrect color string format");

    this.$.debug( "HEX : " + hexString, this.$.DEBUG_LEVEL.LOG);

    this.r = parseInt(hexString.slice(0,2), 16);
    this.g = parseInt(hexString.slice(2,4), 16);
    this.b = parseInt(hexString.slice(4,6), 16);
    this.a = parseInt(hexString.slice(6,8), 16);
}


/**
 * Uses a color integer (used in backdrops) and parses the INT; applies the RGBA components of the INT to thos oColorValue
 * @param   { int }    colorInt                      24 bit-shifted integer containing RGBA values
 */
oColorValue.prototype.parseColorFromInt = function(colorInt){
	this.r = colorInt >> 16 & 0xFF;
	this.g = colorInt >> 8 & 0xFF;
	this.b = colorInt & 0xFF;
  this.a = colorInt >> 24 & 0xFF;
}

exports.oColorValue = oColorValue;