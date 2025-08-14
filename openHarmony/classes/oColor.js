//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           $.oColor class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The base class for the $.oColor.
 * @constructor
 * @classdesc  $.oColor Base Class
 * @param   {$.oPalette}             oPaletteObject             The palette to which the color belongs.
 * @param   {int}                    attributeObject            The index of the color in the palette.
 *
 * @property {$.oPalette}            palette                    The palette to which the color belongs.
 */
function oColor ( oPaletteObject, index ){
  // We don't use id in the constructor as multiple colors with the same id can exist in the same palette.
  this._type = "color";

  this.palette = oPaletteObject;
  this._index = index;
}

// $.oColor Object Properties

/**
 * The Harmony color object.
 * @name $.oColor#colorObject
 * @type {BaseColor}
 */
Object.defineProperty(oColor.prototype, 'colorObject', {
    get : function(){
        return this.palette.paletteObject.getColorByIndex(this._index);
    }
});



/**
 * The name of the color.
 * @name $.oColor#name
 * @type {string}
 */
Object.defineProperty(oColor.prototype, 'name', {
    get : function(){
        var _color = this.colorObject;
        return _color.name;
    },

    set : function(newName){
        var _color = this.colorObject;
        _color.setName(newName);
    }
});


/**
 * The id of the color.
 * @name $.oColor#id
 * @type {string}
 */
Object.defineProperty(oColor.prototype, 'id', {
    get : function(){
        var _color = this.colorObject;
        return _color.id
    },

    set : function(newId){
        // TODO: figure out a way to change id? Create a new color with specific id in the palette?
        throw new Error("setting oColor.id Not yet implemented");
    }
});


/**
 * The index of the color.
 * @name $.oColor#index
 * @type {int}
 */
Object.defineProperty(oColor.prototype, 'index', {
    get : function(){
        return this._index;
    },

    set : function(newIndex){
        var _color = this.palette.paletteObject.moveColor(this._index, newIndex);
        this._index = newIndex;
    }
});


/**
 * The type of the color.
 * @name $.oColor#type
 * @type {int}
 */
Object.defineProperty(oColor.prototype, 'type', {
    set : function(){
      throw new Error("setting oColor.type Not yet implemented.");
    },

    get : function(){
        var _color = this.colorObject;
        if (_color.isTexture) return "texture";

        switch (_color.colorType) {
            case PaletteObjectManager.Constants.ColorType.SOLID_COLOR:
                return "solid";
            case PaletteObjectManager.Constants.ColorType.LINEAR_GRADIENT :
                return "gradient";
            case PaletteObjectManager.Constants.ColorType.RADIAL_GRADIENT:
                return "radial gradient";
            default:
        }
    }
});


/**
 * Whether the color is selected.
 * @name $.oColor#selected
 * @type {bool}
 */
Object.defineProperty(oColor.prototype, 'selected', {
    get : function(){
        var _currentId = PaletteManager.getCurrentColorId()
        var _colors = this.palette.colors;
        var _ids = _colors.map(function(x){return x.id})
        return this._index == _ids.indexOf(_currentId);
    },

    set : function(isSelected){
        // TODO: find a way to work with index as more than one color can have the same id, also, can there be no selected color when removing selection?
        if (isSelected){
            var _id = this.id;
            PaletteManager.setCurrentColorById(_id);
        }
    }
});


/**
 * Takes a string or array of strings for gradients and filename for textures. Instead of passing rgba objects, it accepts "#rrggbbaa" hex strings for convenience.<br>set gradients, provide an object with keys from 0 to 1 for the position of each color.<br>(ex: {0: new $.oColorValue("000000ff"), 1:new $.oColorValue("ffffffff")}).
 * @name $.oColor#value
 * @type {$.oColorValue}
 */
Object.defineProperty(oColor.prototype, 'value', {
  get : function(){
    var _color = this.colorObject;

    switch(this.type){
      case "solid":
        return new this.$.oColorValue(_color.colorData);
      case "texture":
        return this.palette.path.parent.path + this.palette.name+"_textures/" + this.id + ".tga";
      case "gradient":
      case "radial gradient":
        var _gradientArray = _color.colorData;
        var _value = {};
        for (var i in _gradientArray){
          var _data = _gradientArray[i];
          _value[_gradientArray[i].t] = new this.$.oColorValue(_data.r, _data.g, _data.b, _data.a);
        }
        return _value;
      default:
    }
  },

  set : function(newValue){
    var _color = this.colorObject;

    switch(this.type){
      case "solid":
        _value = new $.oColorValue(newValue);
        _color.setColorData(_value);
        break;
      case "texture":
        // TODO: need to copy the file into the folder first?
        _color.setTextureFile(newValue);
        break;
      case "gradient":
      case "radial gradient":
        var _value = [];
        var _gradient = newValue;
        for (var i  in _gradient){
          var _color = _gradient[i];
          var _tack = {r:_color.r, g:_color.g, b:_color.b, a:_color.a, t:parseFloat(i, 10)}
          _value.push(_tack);
        }
        _color.setColorData(_value);
        break;
      default:
    };
  }
});


// Methods

/**
 * Moves the palette to another Palette Object (CFNote: perhaps have it push to paletteObject, instead of being done at the color level)
 * @param   {$.oPalette}         oPaletteObject              The paletteObject to move this color into.
 * @param   {int}                index                       Need clarification from mchap
 *
 * @return: {$.oColor}           The new resulting $.oColor object.
 */
oColor.prototype.moveToPalette = function (oPaletteObject, index){
    if (typeof index === 'undefined') var index = oPaletteObject.paletteObject.nColors;
    var _duplicate = this.copyToPalette(oPaletteObject, index)
    this.remove()

    return _duplicate;
}


/**
 * Copies the palette to another Palette Object (CFNote: perhaps have it push to paletteObject, instead of being done at the color level)
 * @param   {$.oPalette}         oPaletteObject              The paletteObject to move this color into.
 * @param   {int}                index                       Need clarification from mchap
 *
 * @return: {$.oColor}           The new resulting $.oColor object.
 */
oColor.prototype.copyToPalette = function (oPaletteObject, index){
    var _color = this.colorObject;

    oPaletteObject.paletteObject.cloneColor(_color);
    var _colors = oPaletteObject.colors;
    var _duplicate = _colors.pop();

    if (typeof index !== 'undefined')  _duplicate.index = index;

    return _duplicate;
}


/**
 * Removes the color from the palette it belongs to.
 */
oColor.prototype.remove = function (){
    // TODO: find a way to work with index as more than one color can have the same id
    this.palette.paletteObject.removeColor(this.id);
}


/**
 * Static helper function to convert from {r:int, g:int, b:int, a:int} to a hex string in format #FFFFFFFF <br>
 *          Consider moving this to a helper function.
 * @param   { obj }       rgbaObject                       RGB object
 * @static
 * @return: { string }    Hex color string in format #FFFFFFFF.
 */
oColor.prototype.rgbaToHex = function (rgbaObject){
    var _hex = "#";
    _hex += rvbObject.r.toString(16)
    _hex += rvbObject.g.toString(16)
    _hex += rvbObject.b.toString(16)
    _hex += rvbObject.a.toString(16)

    return _hex;
}


/**
 *  Static helper function to convert from hex string in format #FFFFFFFF to {r:int, g:int, b:int, a:int} <br>
 *          Consider moving this to a helper function.
 * @param   { string }    hexString                       RGB object
 * @static
 * @return: { obj }    The hex object returned { r:int, g:int, b:int, a:int }
 */
oColor.prototype.hexToRgba = function (hexString){
    var _rgba = {};
    //Needs a better fail state.

    _rgba.r = parseInt(hexString.slice(1,3), 16)
    _rgba.g = parseInt(hexString.slice(3,5), 16)
    _rgba.b = parseInt(hexString.slice(5,7), 16)
    _rgba.a = parseInt(hexString.slice(7,9), 16)

    return _rgba;
}

exports.oColor = oColor;