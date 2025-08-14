//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oStencil class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oStencil class.
 * @constructor
 * @classdesc  The $.oStencil class allows access to some of the settings, name and type of the stencils available in the Harmony UI. <br>
 * Harmony stencils can have the following types: "pencil", "penciltemplate", "brush", "texture", "bitmapbrush" and "bitmaperaser". Each type is only available to specific tools. <br>
 * Access the main size information of the brush with the mainBrushShape property.
 * @param   {string}   xmlDescription        the part of the penstyles.xml file between <pen> tags that describe a stencils.
 * @property {string}  name                  the display name of the stencil
 * @property {string}  type                  the type of stencil
 * @property {Object}  thicknessPathObject   the description of the shape of the stencil
 */
function oStencil (name, type, thicknessPathObject) {
  this.name = name;
  this.type = type;
  this.thicknessPathObject = thicknessPathObject;
  // log("thicknessPath: " + JSON.stringify(this.thicknessPathObject))
}


/**
 * The minimum thickness of the line using this stencil
 * @name $.oStencil#minThickness
 * @type {float}
 */
Object.defineProperty(oStencil.prototype, "minThickness", {
  get: function(){
    return this.thicknessPathObject.minThickness;
  },
  set: function(newMinThickness){
    this.thicknessPathObject.minThickness = newMinThickness;
    // TODO: also change in thicknessPath.keys
  }
})


/**
 * The maximum thickness of the line using this stencil
 * @name $.oStencil#maxThickness
 * @type {float}
 */
Object.defineProperty(oStencil.prototype, "maxThickness", {
  get: function(){
    return this.thicknessPathObject.maxThickness;
  },
  set: function(newMaxThickness){
    this.thicknessPathObject.maxThickness = newMaxThickness;
    // TODO: also change in thicknessPath.keys
  }
})


/**
 * Parses the xml string of the stencil xml description to create an object with all the information from it.
 * @private
 */
oStencil.getFromXml = function (xmlString) {
  var object = oStencil.getSettingsFromXml(xmlString)

  var maxThickness = object.mainBrushShape.sizeRange.maxValue
  var minThickness = object.mainBrushShape.sizeRange.minPercentage * maxThickness

  var thicknessPathObject = {
    maxThickness:maxThickness,
    minThickness:minThickness,
    keys: [
      {t:0},
      {t:1}
    ]
  }

  var _stencil = new oStencil(object.name, object.style, thicknessPathObject)
  for (var i in object) {
    try{
      // attempt to set values from the object
      _stencil[i] = _settings[i];
    }catch(err){
      this.$.log(err)
    }
  }
  return _stencil;
}


/**
 * Parses the xml string of the stencil xml description to create an object with all the information from it.
 * @private
 */
oStencil.getSettingsFromXml = function (xmlString) {
  var object = {};
  var objectRE = /<(\w+)>([\S\s]*?)<\/\1>/igm
  var match;
  var string = xmlString + "";
  while (match = objectRE.exec(xmlString)) {
    object[match[1]] = oStencil.getSettingsFromXml(match[2]);
    // remove the match from the string to parse the rest as properties
    string = string.replace(match[0], "");
  }

  var propsRE = /<(\w+) value="([\S\s]*?)"\/>/igm
  var match;
  while (match = propsRE.exec(string)) {
    // try to convert the value to int, float or bool
    var value = match[2];
    var intValue = parseInt(value, 10);
    var floatValue = parseFloat(value);
    if (value == "true" || value == "false") {
      value = !!value;
    } else if (!isNaN(floatValue)) {
      if (intValue == floatValue) {
        value = intValue;
      } else {
        value = floatValue;
      }
    }

    object[match[1]] = match[2];
  }

  return object;
}

oStencil.prototype.toString = function (){
  return "$.oStencil: '" + this.name + "'"
}

exports.oStencil = oStencil;