//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//       $.oPreference class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * The constructor for the oPreference Class.
 * @classdesc
 * The oPreference class wraps a single preference item.
 * @constructor
 * @param {string} category             The category of the preference
 * @param {string} keyword              The keyword used by the preference
 * @param {string} type                 The type of value held by the preference
 * @param {string} description          A short string of description
 * @param {string} descriptionText      The complete tooltip text for the preference
 * @example
 * // To access the preferences of Harmony, grab the preference object in the $.oApp class:
 * var prefs = $.app.preferences;
 *
 * // It's then possible to access all available preferences of the software:
 * for (var i in prefs){
 *   log (i+" "+prefs[i]);
 * }
 *
 * // accessing the preference value can be done directly by using the dot notation:
 * prefs.USE_OVERLAY_UNDERLAY_ART = true;
 * log (prefs.USE_OVERLAY_UNDERLAY_ART);
 *
 * //the details objects of the preferences object allows access to more information about each preference
 * var details = prefs.details
 * log(details.USE_OVERLAY_UNDERLAY_ART.category+" "+details.USE_OVERLAY_UNDERLAY_ART.id+" "+details.USE_OVERLAY_UNDERLAY_ART.type);
 *
 * for (var i in details){
 *   log(i+" "+JSON.stringify(details[i]))       // each object inside detail is a complete oPreference instance
 * }
 *
 * // the preference object also holds a categories array with the list of all categories
 * log (prefs.categories)
 */
function oPreference (category, keyword, type, value, description, descriptionText){
  this.category = category;
  this.keyword = keyword;
  this.type = type;
  this.description = description;
  this.descriptionText = descriptionText;
  this.defaultValue = value;
}


/**
 * get and set a preference value
 * @name $.oPreference#value
 */
Object.defineProperty (oPreference.prototype, 'value', {
  get: function(){
    try{
      switch(this.type){
        case "bool":
          var _value = preferences.getBool(this.keyword, this.defaultValue);
          break
        case "int":
          var _value = preferences.getInt(this.keyword, this.defaultValue);
          break;
        case "double":
          var _value = preferences.getDouble(this.keyword, this.defaultValue);
          break;
        case "color":
          var _value = preferences.getColor(this.keyword, this.defaultValue);
          _value = new this.$.oColorValue(_value.r, _value.g, _value.b, _value.a)
          break;
        default:
          var _value = preferences.getString(this.keyword, this.defaultValue);
      }
    }catch(err){
      this.$.debug(err, this.$.DEBUG_LEVEL.ERROR)
    }
    this.$.debug("Getting value of Preference "+this.keyword+" : "+_value, this.$.DEBUG_LEVEL.LOG)
    return _value;
  },

  set : function(newValue){
    switch(this.type){
      case "bool":
        preferences.setBool(this.keyword, newValue);
        break
      case "int":
        preferences.setInt(this.keyword, newValue);
        break;
      case "double":
        preferences.setDouble(this.keyword, newValue);
        break;
      case "color":
        if (typeof newValue == String) newValue = (new oColorValue()).fromColorString(newValue);
        preferences.setColor(this.keyword, new ColorRGBA(newValue.r, newValue.g, newValue.b, newValue.a));
        break;
      default:
        preferences.setString(this.keyword, newValue);
    }
    this.$.debug("Preference "+this.keyword+" was set to : "+newValue, this.$.DEBUG_LEVEL.LOG)
  }
})


/**
 * Creates getter setters on a simple object for the preference described by the params
 * @private
 * @param {string} category             The category of the preference
 * @param {string} keyword              The keyword used by the preference
 * @param {string} type                 The type of value held by the preference
 * @param {string} description          A short string of description
 * @param {string} descriptionText      The complete tooltip text for the preference
 * @param {Object} prefObject           The preference object that will receive the getter setter property (usually $.oApp._prefObject)
 */
oPreference.createPreference = function(category, keyword, type, value, description, descriptionText, prefObject){
  if (!prefObject.details.hasOwnProperty(keyword)){
    var pref = new this.prototype.$.oPreference(category, keyword, type, value, description, descriptionText);
    Object.defineProperty(prefObject, keyword,{
      enumerable: true,
      get : function(){
        return pref.value;
      },
      set : function(newValue){
        pref.value = newValue;
      }
    })
  }else{
    var pref = prefObject.details[keyword]
  }

  return pref;
}

exports.oPreference = oPreference;