//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//    $.oColorOverrideNode class    //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oNode = require("./oNode.js");

/**
 * Constructor for the $.oColorOverrideNode class
 * @classdesc
 * $.oColorOverrideNode is a subclass of $.oNode and implements the same methods and properties as $.oNode. <br>
 * It represents color overrides in the scene.
 * @constructor
 * @augments   $.oNode
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 */
 function oColorOverrideNode (path, oSceneObject) {
  // $.oDrawingNode can only represent a node of type 'READ'
  if (node.type(path) != 'COLOR_OVERRIDE_TVG') throw "'path' parameter must point to a 'COLOR_OVERRIDE_TVG' type node";
  var instance = this.$.oNode.call(this, path, oSceneObject);
  if (instance) return instance;

  this._type = 'colorOverrideNode';
  this._coObject = node.getColorOverride(path)
}
oColorOverrideNode.prototype = Object.create(oNode.prototype);
oColorOverrideNode.prototype.constructor = oColorOverrideNode;


/**
 * The list of palette overrides in this color override node
 * @name $.oColorOverrideNode#palettes
 * @type {$.oPalette[]}
 * @readonly
 */
Object.defineProperty(oColorOverrideNode.prototype, "palettes", {
  get: function(){
    this.$.debug("getting palettes", this.$.DEBUG_LEVEL.LOG)
    if (!this._palettes){
      this._palettes = [];

      var _numPalettes = this._coObject.getNumPalettes();
      for (var i=0; i<_numPalettes; i++){
        var _palettePath = this._coObject.palettePath(i) + ".plt";
        var _palette = this.$.scn.getPaletteByPath(_palettePath);
        if (_palette) this._palettes.push(_palette);
      }
    }

    return this._palettes;
  }
})

/**
 * Add a new palette to the palette list (for now, only supports scene palettes)
 * @param {$.oPalette} palette
*/
oColorOverrideNode.prototype.addPalette = function(palette){
  var _palettes = this.palettes // init palettes cache to add to it

  this._coObject.addPalette(palette.path.path);
  this._palettes.push(palette);
}

/**
 * Removes a palette to the palette list (for now, only supports scene palettes)
 * @param {$.oPalette} palette
 */
oColorOverrideNode.prototype.removePalette = function(palette){
  this._coObject.removePalette(palette.path.path);
}

exports = oColorOverrideNode;