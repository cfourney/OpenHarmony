
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oLineStyle class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oLineStyle class.
 * @constructor
 * @classdesc
 * The $.oLineStyle class describes a lineStyle used to describe the appearance of strokes and perform drawing operations. <br>
 * Initializing a $.oLineStyle without any parameters attempts to get the current pencil thickness settings and color.
 * @param {string}     colorId             the color Id to paint the line with.
 * @param {$.oStencil} stencil             the stencil object representing the thickness keys
 */
function oLineStyle (colorId, stencil) {
  if (typeof minThickness === 'undefined') var minThickness = PenstyleManager.getCurrentPenstyleMinimumSize();
  if (typeof maxThickness === 'undefined') {
    var maxThickness = PenstyleManager.getCurrentPenstyleMaximumSize();
    if (!maxThickness && !minThickness) maxThickness = 1;
  }
  if (typeof stencil === 'undefined') {
    var stencil = new this.$.oStencil("", "pencil", {maxThickness:maxThickness, minThickness:minThickness, keys:[]});
  }

  if (typeof colorId === 'undefined'){
    var _palette = this.$.scn.selectedPalette;
    if (_palette) {
      var _color = this.$.scn.selectedPalette.currentColor;
      if (_color) {
        var colorId = _color.id;
      } else{
        var colorId = "0000000000000003";
      }
    }
  }

  this.colorId = colorId;
  this.stencil = stencil;

  // this.$.debug(colorId+" "+minThickness+" "+maxThickness+" "+stencil, this.$.DEBUG_LEVEL.DEBUG)
}


/**
 * The minimum thickness of the line using this lineStyle
 * @name $.oLineStyle#minThickness
 * @type {float}
 */
Object.defineProperty(oLineStyle.prototype, "minThickness", {
  get: function(){
    return this.stencil.minThickness;
  },

  set: function(newMinThickness){
    this.stencil.minThickness = newMinThickness;
  }
})


/**
 * The minimum thickness of the line using this lineStyle
 * @name $.oLineStyle#maxThickness
 * @type {float}
 */
Object.defineProperty(oLineStyle.prototype, "maxThickness", {
  get: function(){
    return this.stencil.maxThickness;
  },

  set: function(newMaxThickness){
    this.stencil.maxThickness = newMaxThickness;
  }
})

exports.oLineStyle = oLineStyle;