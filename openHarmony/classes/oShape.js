
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          $.oShape class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oShape class. These types of objects are not supported for harmony versions < 16
 * @constructor
 * @classdesc  $.oShape represents shapes drawn on the art layer. Strokes, colors, line styles, can be accessed through this class.<br>Warning, Toonboom stores strokes by index, so stroke objects may become obsolete when modifying the contents of the drawing.
 * @param   {int}                    index                      The index of the shape on the artLayer
 * @param   {$.oArtLayer}            oArtLayerObject            The oArtLayer this layer belongs to.
 *
 * @property {int}          index       the index of the shape in the parent artLayer
 * @property {$.oArtLayer}  artLayer    the art layer that contains this shape
 */
function oShape(index, oArtLayerObject) {
  this.index = index;
  this.artLayer = oArtLayerObject;
}


/**
 * the toonboom key object identifying this shape.
 * @name $.oShape#_key
 * @type {object}
 * @private
 * @readonly
 */
Object.defineProperty(oShape.prototype, '_key', {
  get: function () {
    var _key = this.artLayer._key;
    return { drawing: _key.drawing, art: _key.art, layers: [this.index] };
  }
})


/**
 * The underlying data describing the shape.
 * @name $.oShape#_data
 * @type {$.oShape[]}
 * @readonly
 * @private
 */
Object.defineProperty(oShape.prototype, '_data', {
  get: function () {
    return this.artLayer.drawingData.layers[this.index];
  }
})


/**
 * The strokes making up the shape.
 * @name $.oShape#strokes
 * @type {$.oShape[]}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'strokes', {
  get: function () {
    if (!this.hasOwnProperty("_strokes")) {
      var _data = this._data;

      if (!_data.hasOwnProperty("strokes")) return [];

      var _shape = this;
      var _strokes = _data.strokes.map(function (x, idx) { return new _shape.$.oStroke(idx, x, _shape) })
      this._strokes = _strokes;
    }
    return this._strokes;
  }
})


/**
 * The contours (invisible strokes that can delimit colored areas) making up the shape.
 * @name $.oShape#contours
 * @type {$.oContour[]}
 * @readonly
 */
 Object.defineProperty(oShape.prototype, 'contours', {
  get: function () {
    if (!this.hasOwnProperty("_contours")) {
      var _data = this._data

      if (!_data.hasOwnProperty("contours")) return [];

      var _shape = this;
      var _contours = _data.contours.map(function (x, idx) { return new _shape.$.oContour(idx, x, _shape) })
      this._contours = _contours;
    }
    return this._contours;
  }
})


/**
 * The fills styles contained in the shape
 * @name $.oShape#fills
 * @type {$.oFillStyle[]}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'fills', {
  get: function () {
    if (!this.hasOwnProperty("_fills")) {
      var _data = this._data

      if (!_data.hasOwnProperty("contours")) return [];

      var _shape = this;
      var _fills = _data.contours.map(function (x) { return new _shape.$.oFillStyle(x.colorId, x.matrix) })
      this._fills = _fills;
    }
    return this._fills;
  }
})

/**
 * The stencils used by the shape.
 * @name $.oShape#stencils
 * @type {$.oStencil[]}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'stencils', {
  get: function () {
    if (!this.hasOwnProperty("_stencils")) {
      var _data = this._data;
      var _shape = this;
      var _stencils = _data.thicknessPaths.map(function (x) { return new _shape.$.oStencil("", "pencil", x) })
      this._stencils = _stencils;
    }
    return this._stencils;
  }
})


/**
 * The bounding box of the shape.
 * @name $.oShape#bounds
 * @type {$.oBox}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'bounds', {
  get: function () {
    var _bounds = new this.$.oBox();
    var _contours = this.contours;
    var _strokes = this.strokes;

    for (var i in _contours){
      _bounds.include(_contours[i].bounds);
    }

    for (var i in _strokes){
      _bounds.include(_strokes[i].bounds);
    }

    return _bounds;
  }
})

/**
 * The x coordinate of the shape.
 * @name $.oShape#x
 * @type {float}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'x', {
  get: function () {
    return this.bounds.left;
  }
})


/**
 * The x coordinate of the shape.
 * @name $.oShape#x
 * @type {float}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'y', {
  get: function () {
    return this.bounds.top;
  }
})


/**
 * The width of the shape.
 * @name $.oShape#width
 * @type {float}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'width', {
  get: function () {
    return this.bounds.width;
  }
})


/**
 * The height coordinate of the shape.
 * @name $.oShape#height
 * @type {float}
 * @readonly
 */
Object.defineProperty(oShape.prototype, 'height', {
  get: function () {
    return this.bounds.height;
  }
})


/**
 * Retrieve and set the selected status of each shape.
 * @name $.oShape#selected
 * @type {bool}
 */
Object.defineProperty(oShape.prototype, 'selected', {
  get: function () {
    var _selection = this.artLayer._selectedShapes;
    var _indices = _selection.map(function (x) { return x.index });
    return (_indices.indexOf(this.index) != -1)
  },

  set: function (newSelectedState) {
    var _key = this.artLayer._key;

    var currentSelection = Drawing.selection.get(_key);
    var config = {drawing:_key.drawing, art:_key.art};

    if (newSelectedState){
      // adding elements to selection
      config.selectedLayers = currentSelection.selectedLayers.concat([this.index]);
      config.selectedStrokes = currentSelection.selectedStrokes;
    }else{
      config.selectedLayers = currentSelection.selectedLayers;
      config.selectedStrokes = currentSelection.selectedStrokes;

      // remove current element from selection before setting again
      for (var i=config.selectedLayers.length-1; i>=0; i--){
        if (config.selectedLayers[i] == this.index) config.selectedLayers.splice(i, 1);
      }
      for (var i=config.selectedStrokes.length-1; i>=0; i--){
        if (config.selectedStrokes[i].layer == this.index) config.selectedStrokes.splice(i, 1);
      }
    }

    Drawing.selection.set(config);
  }
})


/**
 * Deletes the shape from its artlayer.
 * Updates the index of all other oShapes on the artLayer in order to
 * keep tracking all of them without having to query the drawing again.
 */
oShape.prototype.remove = function(){
  DrawingTools.deleteLayers(this._key);

  // update shapes list for this artLayer
  var shapes = this.artLayer.shapes
  for (var i in shapes){
    if (i > this.index){
      shapes[i].index--;
    }
  }
  shapes.splice(this.index, 1);
}


/**
 * Deletes the shape from its artlayer.
 * Warning : Because shapes are referenced by index, deleting a shape
 * that isn't at the end of the list of shapes from this layer
 * might render other shape objects from this layer obsolete.
 * Get them again with artlayer.shapes.
 * @deprecated use oShape.remove instead
 */
oShape.prototype.deleteShape = function(){
  this.remove();
}


/**
 * Gets a stroke from this shape by its index
 * @param {int} index
 *
 * @returns {$.oStroke}
 */
oShape.prototype.getStrokeByIndex = function (index) {
  return this.strokes[index];
}


oShape.prototype.toString = function (){
  return "<oShape index:"+this.index+", layer:"+this.artLayer.name+", drawing:'"+this.artLayer._drawing.name+"'>"
}

exports.oShape = oShape;