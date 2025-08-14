//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oFillStyle class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oFillStyle class.
 * @constructor
 * @classdesc
 * The $.oFillStyle class describes a fillStyle used to describe the appearance of filled in color areas and perform drawing operations. <br>
 * Initializing a $.oFillStyle without any parameters attempts to get the current color id.
 * @param {string}     colorId             the color Id to paint the line with.
 * @param {object}     fillMatrix
 */
function oFillStyle (colorId, fillMatrix) {
  if (typeof fillMatrix === 'undefined') var fillMatrix = {
    "ox": 1,
    "oy": 1,
    "xx": 1,
    "xy": 0,
    "yx": 0,
    "yy": 1
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
  this.fillMatrix = fillMatrix;

  this.$.log("new fill created: " + colorId + " " + JSON.stringify(this.fillMatrix))
}


oFillStyle.prototype.toString = function(){
  return "<oFillStyle colorId:"+this.colorId+", matrix:"+JSON.stringify(this.fillMatrix)+">";
}

exports.oFillStyle = oFillStyle;