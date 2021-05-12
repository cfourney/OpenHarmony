//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library
//
//
//         Developped by Mathieu Chaptel, Chris Fourney
//
//
//   This library is an open source implementation of a Document Object Model
//   for Toonboom Harmony. It also implements patterns similar to JQuery
//   for traversing this DOM.
//
//   Its intended purpose is to simplify and streamline toonboom scripting to
//   empower users and be easy on newcomers, with default parameters values,
//   and by hiding the heavy lifting required by the official API.
//
//   This library is provided as is and is a work in progress. As such, not every
//   function has been implemented or is garanteed to work. Feel free to contribute
//   improvements to its official github. If you do make sure you follow the provided
//   template and naming conventions and document your new methods properly.
//
//   This library doesn't overwrite any of the objects and classes of the official
//   Toonboom API which must remains available.
//
//   This library is made available under the Mozilla Public license 2.0.
//   https://www.mozilla.org/en-US/MPL/2.0/
//
//   The repository for this library is available at the address:
//   https://github.com/cfourney/OpenHarmony/
//
//
//   For any requests feel free to contact m.chaptel@gmail.com
//
//
//
//
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//          $.oDrawing class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $.oDrawing constructor.
 * @constructor
 * @classdesc The $.oDrawing Class represents a single drawing from an element.
 * @param   {int}                    name                       The name of the drawing.
 * @param   {$.oElement}             oElementObject             The element object associated to the element.
 *
 * @property {int}                   name                       The name of the drawing.
 * @property {$.oElement}            element                    The element object associated to the element.
 */
$.oDrawing = function (name, oElementObject) {
  this._type = "drawing";
  this._name = name;
  this.element = oElementObject;

  this._key = Drawing.Key({
    elementId: oElementObject.id,
    exposure: name
  });

  //log(JSON.stringify(this._key))

  this._overlay = new this.$.oArtLayer(3, this);
  this._lineArt = new this.$.oArtLayer(2, this);
  this._colorArt = new this.$.oArtLayer(1, this);
  this._underlay = new this.$.oArtLayer(0, this);
  this._artLayers = [this._underlay, this._colorArt, this._lineArt, this._overlay];
}


/**
 * The different types of lines ends.
 * @name $.oDrawing#LINE_END_TYPE
 * @enum
 */
$.oDrawing.LINE_END_TYPE = {
  ROUND: 1,
  FLAT: 2,
  BEVEL: 3
};


/**
 * The reference to the art layers to use with oDrawing.setAsActiveDrawing()
 * @name $.oDrawing#ART_LAYER
 * @enum
 */
$.oDrawing.ART_LAYER = {
  OVERLAY: 8,
  LINEART: 4,
  COLORART: 2,
  UNDERLAY: 1
};


/**
 * The name of the drawing.
 * @name $.oDrawing#name
 * @type {string}
 */
Object.defineProperty($.oDrawing.prototype, 'name', {
  get: function () {
    return this._name;
  },

  set: function (newName) {
    if (this._name == newName) return;

    var _column = this.element.column.uniqueName;
    // this ripples recursively

    if (Drawing.isExists(this.element.id, newName)) this.element.getDrawingByName(newName).name = newName + "_1";
    column.renameDrawing(_column, this._name, newName);
    this._name = newName;
  }
})


/**
 * The internal Id used to identify drawings.
 * @name $.oDrawing#id
 * @type {int}
 */
Object.defineProperty($.oDrawing.prototype, 'id', {
  get: function () {
    return this._key.drawingId;
  }
})


/**
 * The folder path of the drawing on the filesystem.
 * @name $.oDrawing#path
 * @type {string}
 */
Object.defineProperty($.oDrawing.prototype, 'path', {
  get: function () {
    return fileMapper.toNativePath(Drawing.filename(this.element.id, this.name))
  }
})


/**
 * The drawing pivot of the drawing.
 * @name $.oDrawing#pivot
 * @type {$.oPoint}
 */
Object.defineProperty($.oDrawing.prototype, 'pivot', {
  get: function () {
    if (this.$.batchMode){
      throw new Error("oDrawing.pivot is not available in batch mode.")
    }

    var _pivot = Drawing.getPivot({ "drawing": this._key });
    return new this.$.oPoint(_pivot.x, _pivot.y, 0);
  },

  set: function (newPivot) {
    var _pivot = { x: newPivot.x, y: newPivot.y };
    Drawing.setPivot({ drawing: this._key, pivot: _pivot });
  }
})



/**
 * The bounding box of the drawing, in drawing space coordinates. (null if the drawing is empty.)
 * @name $.oDrawing#boundingBox
 * @type {$.oBox}
 */
Object.defineProperty($.oDrawing.prototype, 'boundingBox', {
  get: function () {
    if (this.$.batchMode){
      throw new Error("oDrawing.boudingBox is not available in batch mode.")
    }

    var _box = new this.$.oBox()
    for (var i in this.artLayers) {
      var _layerBox = this.artLayers[i].boundingBox
      if (_layerBox) _box.include(_layerBox)
    }

    return _box
  }
})


/**
 * Access the underlay art layer's content through this object.
 * @name $.oDrawing#underlay
 * @type {$.oArtLayer}
 */
Object.defineProperty($.oDrawing.prototype, 'underlay', {
  get: function () {
    return this._underlay;
  }
})


/**
 * Access the color art layer's content through this object.
 * @name $.oDrawing#colorArt
 * @type {$.oArtLayer}
 */
Object.defineProperty($.oDrawing.prototype, 'colorArt', {
  get: function () {
    return this._colorArt;
  }
})


/**
 * Access the line art layer's content through this object.
 * @name $.oDrawing#lineArt
 * @type {$.oArtLayer}
 */
Object.defineProperty($.oDrawing.prototype, 'lineArt', {
  get: function () {
    return this._lineArt;
  }
})


/**
 * Access the overlay art layer's content through this object.
 * @name $.oDrawing#overlay
 * @type {$.oArtLayer}
 */
Object.defineProperty($.oDrawing.prototype, 'overlay', {
  get: function () {
    return this._overlay;
  }
})


/**
 * The list of artLayers of this drawing.
 * @name $.oDrawing#artLayers
 * @type {$.oArtLayer[]}
 */
Object.defineProperty($.oDrawing.prototype, 'artLayers', {
  get: function () {
    return this._artLayers;
  }
})


/**
 * the currently active art layer of this drawing.
 * @name $.oDrawing#activeArtLayer
 * @type {$.oArtLayer}
 */
Object.defineProperty($.oDrawing.prototype, 'activeArtLayer', {
  get: function () {
    var settings = Tools.getToolSettings();
    if (!settings.currentDrawing) return null;

    return this.artLayers[settings.activeArt]
  },
  set: function (newArtLayer) {
    this.setAsActiveDrawing(newArtLayer._layerIndex);
  }
})


/**
 * the selected shapes on this drawing
 * @name $.oDrawing#selectedShapes
 * @type {$.oShape}
 */
Object.defineProperty($.oDrawing.prototype, 'selectedShapes', {
  get: function () {
    var _selectedShapes = [];
    for (var i in this.artLayers) {
      _selectedShapes = _selectedShapes.concat(this.artLayers[i].selectedShapes);
    }

    return _selectedShapes;
  }
})


/**
 * the selected shapes on this drawing
 * @name $.oDrawing#selectedStrokes
 * @type {$.oShape}
 */
Object.defineProperty($.oDrawing.prototype, 'selectedStrokes', {
  get: function () {
    var _selectedStrokes = [];
    for (var i in this.artLayers) {
      _selectedStrokes = _selectedStrokes.concat(this.artLayers[i].selectedStrokes);
    }

    return _selectedStrokes;
  }
})


/**
 * all the data from this drawing. For internal use.
 * @name $.oDrawing#drawingData
 * @type {Object}
 */
Object.defineProperty($.oDrawing.prototype, 'drawingData', {
  get: function () {
    var _data = Drawing.query.getData(this._key);
    return _data;
  }
})




// $.oDrawing Class methods

/**
 * Import a given file into an existing drawing.
 * @param   {string}     file              The path to the file
 *
 * @return { $.oDrawing }      The drawing found by the search
 */
$.oDrawing.prototype.importBitmap = function (file) {
  var _path = new this.$.oFile(this.path);
  if (!(file instanceof this.$.oFile)) file = new this.$.oFile(file);

  if (!file.exists) return false;
  file.copy(_path.folder, _path.name, true);
}


/**
 * @returns {int[]}  The frame numbers at which this drawing appears.
 */
$.oDrawing.prototype.getVisibleFrames = function () {
  var _element = this.element;
  var _column = _element.column;

  if (!_column) {
    this.$.log("Column missing: can't get visible frames for  drawing " + this.name + " of element " + _element.name);
    return null;
  }

  var _frames = [];
  var _keys = _column.keyframes;
  for (var i in _keys) {
    if (_keys[i].value == this.name) _frames.push(_keys[i].frameNumber);
  }

  return _frames;
}


/**
 * Remove the drawing from the element.
 */
$.oDrawing.prototype.remove = function () {
  var _element = this.element;
  var _column = _element.column;

  if (!_column) {
    this.$.log("Column missing: impossible to delete drawing " + this.name + " of element " + _element.name);
    return;
  }

  var _frames = _column.frames;
  var _lastFrame = _frames.pop();
  // this.$.log(_lastFrame.frameNumber+": "+_lastFrame.value)

  var _thisDrawing = this;

  // we have to expose the drawing on the column to delete it. Exposing at the last frame...
  this.$.debug("deleting drawing " + _thisDrawing + " from element " + _element.name, this.$.DEBUG_LEVEL.LOG);
  var _lastDrawing = _lastFrame.value;
  var _keyFrame = _lastFrame.isKeyFrame;
  _lastFrame.value = _thisDrawing;

  column.deleteDrawingAt(_column.uniqueName, _lastFrame.frameNumber);

  // resetting the last frame
  _lastFrame.value = _lastDrawing;
  _lastFrame.isKeyFrame = _keyFrame;
}



/**
 * refresh the preview of the drawing.
 */
$.oDrawing.prototype.refreshPreview = function () {
  if (this.element.format == "TVG") return;

  var _path = new this.$.oFile(this.path);
  var _elementFolder = _path.folder;
  var _previewFiles = _elementFolder.getFiles(_path.name + "-*.tga");

  for (var i in _previewFiles) {
    _previewFiles[i].remove();
  }
}


/**
* Change the currently active drawing. Can specify an art Layer
* Doesn't work in batch mode.
* @param {oDrawing.ART_LAYER}   [artLayer]      activate the given art layer
* @return {bool}   success of setting the drawing as current
*/
$.oDrawing.prototype.setAsActiveDrawing = function (artLayer) {
  if (this.$.batchMode) {
    this.$.debug("Setting as active drawing not available in batch mode", this.$.DEBUG_LEVEL.ERROR);
    return false;
  }

  var _column = this.element.column;
  if (!_column) {
    this.$.debug("Column missing: impossible to set as active drawing " + this.name + " of element " + _element.name, this.$.DEBUG_LEVEL.ERROR);
    return false;
  }

  var _frame = this.getVisibleFrames();
  if (_frame.length == 0) {
    this.$.debug("Drawing not exposed: impossible to set as active drawing " + this.name + " of element " + _element.name, this.$.DEBUG_LEVEL.ERROR);
    return false;
  }

  DrawingTools.setCurrentDrawingFromColumnName(_column.uniqueName, _frame[0]);

  if (artLayer) DrawingTools.setCurrentArt(artLayer);

  return true;
}


/**
 * Duplicates the drawing to the given frame, and renames the drawing with the given name.
 * @param {int}      [frame]     the frame at which to create the drawing. By default, the current frame.
 * @param {string}   [newName]   A new name for the drawing. By default, the name will be the number of the frame.
 * @returns {$.oDrawing}   the newly created drawing
 */
$.oDrawing.prototype.duplicate = function(frame, newName){
  var _element = this.element
  if (typeof frame ==='undefined') var frame = this.$.scn.currentFrame;
  if (typeof newName === 'undefined') var newName = frame;
  var newDrawing = _element.addDrawing(frame, newName, this.path)
  return newDrawing;
}


/**
 * Copies the contents of the Drawing into the clipboard
 * @param {oDrawing.ART_LAYER} [artLayer]    Specify to only copy the contents of the specified artLayer
 */
$.oDrawing.prototype.copyContents = function (artLayer) {

  var _current = this.setAsActiveDrawing(artLayer);
  if (!_current) {
    this.$.debug("Impossible to copy contents of drawing " + this.name + " of element " + _element.name + ", the drawing cannot be set as active.", this.DEBUG_LEVEL.ERROR);
    return;
  }
  ToolProperties.setApplyAllArts(!artLayer);
  Action.perform("deselect()", "cameraView");
  Action.perform("onActionChooseSelectTool()");
  Action.perform("selectAll()", "cameraView");

  if (Action.validate("copy()", "cameraView").enabled) Action.perform("copy()", "cameraView");
}


/**
 * Pastes the contents of the clipboard into the Drawing
 * @param {oDrawing.ART_LAYER} [artLayer]    Specify to only paste the contents onto the specified artLayer
 */
$.oDrawing.prototype.pasteContents = function (artLayer) {

  var _current = this.setAsActiveDrawing(artLayer);
  if (!_current) {
    this.$.debug("Impossible to copy contents of drawing " + this.name + " of element " + _element.name + ", the drawing cannot be set as active.", this.DEBUG_LEVEL.ERROR);
    return;
  }
  ToolProperties.setApplyAllArts(!artLayer);
  Action.perform("deselect()", "cameraView");
  Action.perform("onActionChooseSelectTool()");
  if (Action.validate("paste()", "cameraView").enabled) Action.perform("paste()", "cameraView");
}


/**
* Converts the line ends of the Drawing object to the defined type.
* Doesn't work in batch mode. This function modifies the selection.
*
* @param {oDrawing.LINE_END_TYPE}     endType        the type of line ends to set.
* @param {oDrawing.ART_LAYER}        [artLayer]      only apply to provided art Layer.
*/
$.oDrawing.prototype.setLineEnds = function (endType, artLayer) {
  if (this.$.batchMode) {
    this.$.debug("setting line ends not available in batch mode", this.DEBUG_LEVEL.ERROR);
    return;
  }

  var _current = this.setAsActiveDrawing(artLayer);
  if (!_current) {
    this.$.debug("Impossible to change line ends on drawing " + this.name + " of element " + _element.name + ", the drawing cannot be set as active.", this.DEBUG_LEVEL.ERROR);
    return;
  }

  // apply to all arts only if art layer not specified
  ToolProperties.setApplyAllArts(!artLayer);
  Action.perform("deselect()", "cameraView");
  Action.perform("onActionChooseSelectTool()");
  Action.perform("selectAll()", "cameraView");

  var widget = $.getHarmonyUIWidget("pencilShape", "frameBrushParameters");
  if (widget) {
    widget.onChangeTipStart(endType);
    widget.onChangeTipEnd(endType);
    widget.onChangeJoin(endType);
  }
  Action.perform("deselect()", "cameraView");
}


/**
* Converts the Drawing object to a string of the drawing name.
* @return: { string }                 The name of the drawing.
*/
$.oDrawing.prototype.toString = function () {
  return this.name;
}



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oArtLayer class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oArtLayer class.
 * @constructor
 * @classdesc  $.oArtLayer represents art layers, as described by the artlayer toolbar. Access the drawing contents of the layers through this class.
 * @param   {int}                    index                      The artLayerIndex (0: underlay, 1: line art, 2: color art, 3:overlay).
 * @param   {$.oDrawing}             oDrawingObject             The oDrawing this layer belongs to.
 */
$.oArtLayer = function (index, oDrawingObject) {
  this._layerIndex = index;
  this._drawing = oDrawingObject;
  //log(this._drawing._key)
  this._key = { "drawing": this._drawing._key, "art": index }
}


/**
 * The name of the artLayer (lineArt, colorArt, etc)
 * @name $.oArtLayer#name
 * @type {string}
 */
Object.defineProperty($.oArtLayer.prototype, 'name', {
  get: function(){
    var names = ["underlay", "colorArt", "lineArt", "overlay"];
    return names[this._layerIndex];
  }
})



/**
 * The shapes contained on the drawing.
 * @name $.oArtLayer#shapes
 * @type {$.oShape[]}
 */
Object.defineProperty($.oArtLayer.prototype, 'shapes', {
  get: function () {
    var _shapesNum = Drawing.query.getNumberOfLayers(this._key);
    var _shapes = [];
    for (var i = 0; i < _shapesNum; i++) {
      _shapes.push(this.getShapeByIndex(i));
    }
    return _shapes;
  }
})


/**
 * The shapes contained on the drawing.
 * @name $.oArtLayer#strokes
 * @type {$.oStroke[]}
 */
Object.defineProperty($.oArtLayer.prototype, 'strokes', {
  get: function () {
    var _strokes = []

    var _shapes = this.shapes
    for (var i in _shapes) {
      _strokes = _strokes.concat(_shapes[i].strokes)
    }

    return _strokes
  }
})



/**
 * The bounds of the layer, in drawing space coordinates. (null if the drawing is empty.)
 * @name $.oArtLayer#boundingBox
 * @type {$.oBox}
 */
Object.defineProperty($.oArtLayer.prototype, 'boundingBox', {
  get: function () {
    var _box = Drawing.query.getBox(this._key);

    log(JSON.stringify(this._key) + ': ' + JSON.stringify(_box))

    if (_box.empty) return null;

    var _boundingBox = new $.oBox(_box.x0, _box.y0, _box.x1, _box.y1);
    return _boundingBox;
  }
})


/**
 * the currently selected shapes on the ArtLayer.
 * @name $.oArtLayer#selectedShapes
 * @type {$.oShape[]}
 */
Object.defineProperty($.oArtLayer.prototype, 'selectedShapes', {
  get: function () {
    var _shapes = Drawing.selection.get(this._key).selectedLayers;
    var _artLayer = this;
    return _shapes.map(function (x) { return _artLayer.getShapeByIndex(x) });
  }
})



/**
 * the currently selected strokes on the ArtLayer.
 * @name $.oArtLayer#selectedStrokes
 * @type {$.oStroke[]}
 */
Object.defineProperty($.oArtLayer.prototype, 'selectedStrokes', {
  get: function () {
    var _shapes = this.selectedShapes;
    var _strokes = [];

    for (var i in _shapes) {
      _strokes = _strokes.concat(_shapes[i].strokes);
    }

    return _strokes;
  }
})


/**
 * Draws a circle on the artLayer.
 * @param {$.oPoint}       center         The center of the circle
 * @param {float}          radius         The radius of the circle
 * @param {$.oLineStyle}   [lineStyle]    Provide a $.oLineStyle object to specify how the line will look
 * @param {object}         [fillStyle]    The fill information to fill the circle with. currently WIP
 */
$.oArtLayer.prototype.drawCircle = function(center, radius, lineStyle, fillStyle){
  var arg = {
    x: center.x,
    y: center.y,
    radius: radius
  };
  var _path = Drawing.geometry.createCircle(arg);

  this.drawStroke(_path, lineStyle, fillStyle);
}


/**
 * Draws the given path on the artLayer.
 * @param {$.oVertex[]}    path          an array of $.oVertex objects that describe a path.
 * @param {$.oLineStyle}   lineStyle     the line style to draw with.
 * @param {object}         fillStyle     the fill information for the path.
 */
$.oArtLayer.prototype.drawStroke = function(path, lineStyle, fillStyle){
  if (typeof fillStyle === 'undefined') var fillStyle = []
  if (typeof lineStyle === 'undefined') var lineStyle = new this.$.oLineStyle();

  var _lineStyle = {
    shaderLeft: 0,
    stroke: true,
    pencilColorId: lineStyle.colorId,
    thickness: {
      "minThickness": lineStyle.minThickness,
      "maxThickness": lineStyle.maxThickness,
      "thicknessPath": lineStyle.stencil
    }
  }

  log(JSON.stringify(_lineStyle))

  var strokeDesciption = _lineStyle;
  strokeDesciption.path = path;

  DrawingTools.createLayers({
    label: "draw stroke",
    drawing: this._key.drawing,
    art: this._key.art,
    layers: [
      {
        shaders: fillStyle,
        strokes: [strokeDesciption]
      }
    ]
  });
};


/**
 * Draws a line on the artLayer
 * @param {$.oPoint}     startPoint
 * @param {$.oPoint}     endPoint
 * @param {$.oLineStyle} lineStyle
 */
$.oArtLayer.prototype.drawLine = function(startPoint, endPoint, lineStyle){
  var path = [{x:startPoint.x,y:startPoint.y,onCurve:true},{x:endPoint.x,y:endPoint.y,onCurve:true}];

  this.drawStroke(path, lineStyle);
}


/**
 * Removes the contents of the art layer.
 */
$.oArtLayer.prototype.clear = function(){
  var _shapes = this.shapes;
  this.$.debug(_shapes, this.$.DEBUG_LEVEL.DEBUG)
  for (var i=_shapes.length - 1; i>=0; i--){
    print(i)
    _shapes[i].deleteShape();
  }
}


/**
 * get a shape from the artLayer by its index
 * @param {int} index
 *
 * @return {$.oShape}
 */
$.oArtLayer.prototype.getShapeByIndex = function (index) {
  return new this.$.oShape(index, this);
}


/**
 * @private
 */
$.oArtLayer.prototype.toString = function(){
  return "Object $.oArtLayer ["+this.name+"]";
}



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
 * @param {float}      minThickness        the minimum thickness of the line.
 * @param {float}      maxThickness        the maximum thickness of the line.
 * @param {$.oStencil} stencil             not supported yet.
 */
$.oLineStyle = function (colorId, minThickness, maxThickness, stencil) {
  if (typeof stencil === 'undefined') var stencil = 0;
  if (typeof minThickness === 'undefined') var minThickness = PenstyleManager.getCurrentPenstyleMinimumSize();
  if (typeof maxThickness === 'undefined') {
    var maxThickness = PenstyleManager.getCurrentPenstyleMaximumSize();
    if (!maxThickness && !minThickness) maxThickness = 1;
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

  this.minThickness = minThickness;
  this.maxThickness = maxThickness;
  this.colorId = colorId;
  this.stencil = stencil;

  this.$.log(colorId+" "+minThickness+" "+maxThickness+" "+stencil)
}



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
$.oShape = function (index, oArtLayerObject) {
  this.index = index;
  this.artLayer = oArtLayerObject;
}


/**
 * @private
 * @name $.oShape#_key
 * @type {object}
 * @readonly
 * the toonboom key object identifying this shape.
 */
Object.defineProperty($.oShape.prototype, '_key', {
  get: function () {
    var _key = this.artLayer._key;
    return { drawing: _key.drawing, art: _key.art, layers: [this.index] };
  }
})

/**
 * The strokes making up the shape.
 * @name $.oShape#strokes
 * @type {$.oShape[]}
 * @readonly
 */
Object.defineProperty($.oShape.prototype, 'strokes', {
  get: function () {
    if (!this.hasOwnProperty("_strokes")) {
      var _strokeQuery = Drawing.query.getLayerStrokes(this._key).layers[0];
      var _shape = this;
      var _strokes = _strokeQuery.strokes.map(function (x, idx) { return new this.$.oStroke(idx, x, _shape) })
      this._strokes = _strokes;
    }
    return this._strokes;
  }
})


/**
 * Retrieve the selected status of each shape.
 * @name $.oShape#selected
 * @type {bool}
 */
Object.defineProperty($.oShape.prototype, 'selected', {
  get: function () {
    var _selection = this._drawingLayer._selectedShapes;
    var _indices = _selection.map(function (x) { return x.index });
    return (_indices.indexOf(this.index) != -1)
  },
  set: function () {
  }
})


/**
 * Deletes the shape from its artlayer.
 * Warning : Because shapes are referenced by index, deleting a shape
 * that isn't at the end of the list of shapes from this layer
 * might render other shape objects from this layer obsolete.
 * Get them again with artlayer.shapes.
 */
$.oShape.prototype.deleteShape = function(){
  DrawingTools.deleteLayers(this._key);
}

/**
 * Gets a stroke from this shape by its index
 * @param {int} index
 *
 * @returns {$.oStroke}
 */
$.oShape.prototype.getStrokeByIndex = function (index) {
  return this.strokes[index];
}



//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oStroke class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oStroke class. These types of objects are not supported for harmony versions < 16
 * @constructor
 * @classdesc  The $.oStroke class models the strokes that make up the shapes visible on the Drawings.
 * @param {int}       index             The index of the stroke in the shape.
 * @param {object}    strokeObject      The stroke object descriptor that contains the info for the stroke
 * @param {oShape}    oShapeObject      The parent oShape
 *
 * @property {int}          index       the index of the stroke in the parent shape
 * @property {$.oShape}     shape       the shape that contains this stroke
 * @property {$.oArtLayer}  artLayer    the art layer that contains this stroke
 */
$.oStroke = function (index, strokeObject, oShapeObject) {
  this.index = index
  this.shape = oShapeObject
  this.artLayer = oShapeObject.artLayer;
  this._stroke = strokeObject;
}


/**
 * The points that make up the stroke
 * @name $.oStroke#path
 * @type {$.oPoint[]}
 */
Object.defineProperty($.oStroke.prototype, "path", {
  get: function () {
    // path vertices get cached
    if (!this.hasOwnProperty("_path")){
      var _stroke = this;
      var _path = this._stroke.path.map(function(point, index){
        return new _stroke.$.oVertex(_stroke, point.x, point.y, point.onCurve, index);
      })

      this._path = _path
    }
    return this._path;
  }
})


/**
 * The index of the stroke in the shape
 * @name $.oStroke#index
 * @type {$.oPoint[]}
 */
Object.defineProperty($.oStroke.prototype, "index", {
  get: function () {
    log("stroke object : "+JSON.stringify(this._stroke, null, "  "))
    return this._stroke.strokeIndex
  }
})


/**
 * The style of the stroke. null if the stroke is invisible
 * @name $.oStroke#style
 * @type {$.oLineStyle}
 */
Object.defineProperty($.oStroke.prototype, "style", {
  get: function () {
    if (this._stroke.invisible){
      return null;
    }
    var _thickness = this._stroke.thickness;
    var _colorId = this._stroke.pencilColorId;

    return new this.$.oLineStyle(_colorId, _thickness.minThickness, _thickness.maxThickness, _thickness.thicknessPath);
  }
})


/**
 * The intersections on this stroke. Each intersection is an object with stroke ($.oStroke), point($.oPoint), strokePoint(float) and ownPoint(float)
 * One of these objects describes an intersection by giving the stroke it intersects with, the coordinates of the intersection and two values which represent the place on the stroke at which the point is placed, with a value between 0 (start) and 1(end)
 * @param  {$.oStroke}   [stroke]       Specify a stroke to find intersections specific to it. If no stroke is specified,
 * @return {Object[]}
 * @example
// get the selected strokes on the active drawing
var sel = $.scn.activeDrawing.selectedStrokes;

for (var i in sel){
  // get intersections with all other elements of the drawing
	var intersections = sel[i].getIntersections();

  for (var j in intersections){
    log("intersection : " + j);
    log("point : " + intersections[j].point);                    // the point coordinates
    log("strokes index : " + intersections[j].stroke.index);     // the index of the intersecting strokes in their own shape
    log("own point : " + intersections[j].ownPoint);             // how far the intersection is on the stroke itself
    log("stroke point : " + intersections[j].strokePoint);       // how far the intersection is on the intersecting stroke
  }
}
 */
$.oStroke.prototype.getIntersections = function (stroke){
  if (typeof stroke !== 'undefined'){
    // get intersection with provided stroke only
    var _key = { "path0": [{ path: this.path }], "path0": [{ path: stroke.path }] };
    var intersections = Drawing.query.getIntersections(_key)[0]
  }else{
    // get all intersections on the stroke
    var _drawingKey = this.artLayer._key;
    var _key = { "drawing": _drawingKey.drawing, "art": _drawingKey.art, "paths": [{ path: this.path }] };
    var intersections = Drawing.query.getIntersections(_key)[0]
  }

  var result = [];
  for (var i in intersections) {
    var _shape = this.artLayer.getShapeByIndex(intersections[i].layer);
    var _stroke = _shape.getStrokeByIndex(intersections[i].strokeIndex);

    for (var j in intersections[i].intersections){
      var points = intersections[i].intersections[j]

      var point = new this.$.oVertex(this, points.x0, points.y0, true);
      var intersection = { stroke: _stroke, point: point, ownPoint: points.t0, strokePoint: points.t1 };

      result.push(intersection)
    }
  }

  return result;
}



/**
 * Adds points on the stroke without moving them, at the distance specified (0=start vertice, 1=end vertice)
 * @param   {float[]}       pointsToAdd     an array of float value between 0 and 1 for each point to create
 * @returns {$.oVertex[]}   the points that were created
 * @example
// get the selected stroke and create points where it intersects with the other two strokes
var sel = $.scn.activeDrawing.selectedStrokes[0];

var intersections = sel.getIntersections();

// get the two intersections
var intersection1 = intersections[0];
var intersection2 = intersections[1];

// add the points at the intersections on the intersecting strokes
intersection1.stroke.addPoints([intersection1.strokePoint]);
intersection2.stroke.addPoints([intersection2.strokePoint]);

// add the points on the stroke
sel.addPoints([intersection1.ownPoint, intersection2.ownPoint]);
*/
$.oStroke.prototype.addPoints = function (pointsToAdd) {
  var config = this.artLayer._key;
  config.label = "addPoint";
  config.strokes = [{layer:this.shape.index, strokeIndex:this.index, insertPoints: pointsToAdd }];

  // get the list of the current fixed points
  var fixedPoints = this.path.filter(function(x){return x.onCurve});

  DrawingTools.modifyStrokes(config);

  // update the path
  this.updateDefinition();

  // get the list of the current fixed points
  var newFixedPoints = this.path.filter(function(x){return x.onCurve});

  // get the fixed points that didn't exist before
  for (var i=newFixedPoints.length-1; i>=0; i--){
    var newPoint = newFixedPoints[i];
    for (var j in fixedPoints){
      if (fixedPoints[j].x == newPoint.x && fixedPoints[j].y == newPoint.y) newFixedPoints.splice(i, 1);
    }
  }

  return newFixedPoints;
}


/**
 * fetch the stroke information again to update it after modifications
 */
$.oStroke.prototype.updateDefinition = function(){
  var _key = this.artLayer._key;
  var strokes = Drawing.query.getStrokes(_key);
  this._stroke = strokes.layers[this.shape.index].strokes[this.index];

  // remove cache for path
  delete this._path;

  return this._stroke;
}


/**
 * Gets the closest position of the point on the stroke (float value from 0 to 1) from a point with coordinates
 * @param {int}  x
 * @return {float}   the position of the point on the stroke, between 0 and 1
 */
$.oStroke.prototype.getPointPosition = function(point){
  var arg = {
    path : this.path,
    points: [point]
  }
  var strokePoint = Drawing.geometry.getClosestPoint(arg)[0].closestPoint;
  if (!strokePoint) return 0

  return strokePoint.t;
}


/**
 * Get the coordinates of the point on the stroke from its position (from 0 to 1)
 * @param {float}  position
 * @return {$.oVertex}
 */
$.oStroke.prototype.getPointCoordinates = function(position){
  var arg = {
    path : this.path,
    params : [ position ]
 };
 var point = Drawing.geometry.evaluate(arg)[0];

  return new $.oVertex(this, point.x, point.y, true);
}


/**
 *
 * @param {*} point
 */
$.oStroke.prototype.getClosestPoint = function (point){
  var arg = {
    path : this.path,
    points: [ point ]
  };

  var _result = Drawing.geometry.getClosestPoint(arg)[0].closestPoint;


}

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oVertex class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oVertex class
 * @constructor
 * @classdesc
 * The $.oVertex class represents a single control point on a stroke. This class is used to get the index of the point in the stroke path sequence, as well as its position as a float along the stroke's length.
 * The onCurve property describes wether this control point is a bezier handle or a point on the curve.
 *
 * @param {$.oStroke} stroke   the stroke that this vertex belongs to
 * @param {float}     x        the x coordinate of the vertex, in drawing space
 * @param {float}     y        the y coordinate of the vertex, in drawing space
 * @param {bool}      onCurve  whether the point is a bezier handle or situated on the curve
 * @param {int}       index    the index of the point on the stroke
 *
 * @property {$.oStroke} stroke    the stroke that this vertex belongs to
 * @property {float}     x         the x coordinate of the vertex, in drawing space
 * @property {float}     y         the y coordinate of the vertex, in drawing space
 * @property {bool}      onCurve   whether the point is a bezier handle or situated on the curve
 * @property {int}       index     the index of the point on the stroke
 */
$.oVertex = function(stroke, x, y, onCurve, index){
  if (typeof onCurve === 'undefined') var onCurve = false;
  if (typeof index === 'undefined') var index = -1;

  this.x = x;
  this.y = y;
  this.onCurve = onCurve;
  this.stroke = stroke;
  this.index = index
}


/**
 * The position of the point on the curve, from
 * @name $.oVertex#strokePosition
 * @type {float}
 */
Object.defineProperty($.oVertex.prototype, 'strokePosition', {
  get: function(){
    var _position = this.stroke.getPointPosition(this);
    return _position;
  }
})


/**
 * @private
 */
$.oVertex.prototype.toString = function(){
 return "oVertex : { index:"+this.index+", x: "+this.x+", y: "+this.y+", onCurve: "+this.onCurve+", position: "+this.strokePosition+" }"
}



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
 * @property {Object}  mainBrushShape        the description of the shape of the stencil
 */
$.oStencil = function (xmlDescription) {
  _settings = this.$.oStencil.getSettingsFromXml(xmlDescription);
  this.type = _settings.style;
  for (var i in _settings) {
    this[i] = _settings[i];
  }
}


/**
 * Parses the xml string of the stencil xml description to create an object with all the information from it.
 * @private
 */
$.oStencil.getSettingsFromXml = function (xmlString) {
  var object = {};
  var objectRE = /<(\w+)>([\S\s]*?)<\/\1>/igm
  var match;
  var string = xmlString + "";
  while (match = objectRE.exec(xmlString)) {
    object[match[1]] = this.prototype.$.oStencil.getSettingsFromXml(match[2]);
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

$.oStencil.prototype.toString = function (){
  return "$.oStencil: '" + this.name + "'"
}