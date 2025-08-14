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
function oDrawing (name, synchedLayer, oElementObject) {
  this._type = "drawing";
  this._name = name;
  this.element = oElementObject;

  if (synchedLayer){
    this._key = Drawing.Key({
      elementId: oElementObject.id,
      exposure: name,
      layer: synchedLayer
    });
  }else{
    this._key = Drawing.Key({
      elementId: oElementObject.id,
      exposure: name
    });
  }

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
oDrawing.LINE_END_TYPE = {
  ROUND: 1,
  FLAT: 2,
  BEVEL: 3
};


/**
 * The reference to the art layers to use with oDrawing.setAsActiveDrawing()
 * @name $.oDrawing#ART_LAYER
 * @enum
 */
oDrawing.ART_LAYER = {
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
Object.defineProperty(oDrawing.prototype, 'name', {
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
 * @readonly
 * @type {int}
 */
Object.defineProperty(oDrawing.prototype, 'id', {
  get: function () {
    return this._key.drawingId;
  }
})


/**
 * The folder path of the drawing on the filesystem.
 * @name $.oDrawing#path
 * @readonly
 * @type {string}
 */
Object.defineProperty(oDrawing.prototype, 'path', {
  get: function () {
    var _file = new this.$.oFile(Drawing.filename(this.element.id, this.name));
    if (this._key.layer){
      var _fileName = _file.name.replace(this.element.name, this._key.layer);
      var _file = new this.$.oFile(_file.folder.path + "/" + _fileName +"."+_file.extension);
    }
    return _file.path;
  }
})


/**
 * The drawing pivot of the drawing.
 * @name $.oDrawing#pivot
 * @type {$.oPoint}
 */
Object.defineProperty(oDrawing.prototype, 'pivot', {
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
 * The color Ids present on the drawing.
 * @name $.oDrawing#usedColorIds
 * @type {string[]}
 */
Object.defineProperty(oDrawing.prototype, 'usedColorIds', {
  get: function () {
    var _colorIds = DrawingTools.getDrawingUsedColors(this._key);
    return _colorIds;
  }
})


/**
 * The bounding box of the drawing, in drawing space coordinates. (null if the drawing is empty.)
 * @name $.oDrawing#boundingBox
 * @readonly
 * @type {$.oBox}
 */
Object.defineProperty(oDrawing.prototype, 'boundingBox', {
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
 * @readonly
 * @type {$.oArtLayer}
 */
Object.defineProperty(oDrawing.prototype, 'underlay', {
  get: function () {
    return this._underlay;
  }
})


/**
 * Access the color art layer's content through this object.
 * @name $.oDrawing#colorArt
 * @readonly
 * @type {$.oArtLayer}
 */
Object.defineProperty(oDrawing.prototype, 'colorArt', {
  get: function () {
    return this._colorArt;
  }
})


/**
 * Access the line art layer's content through this object.
 * @name $.oDrawing#lineArt
 * @readonly
 * @type {$.oArtLayer}
 */
Object.defineProperty(oDrawing.prototype, 'lineArt', {
  get: function () {
    return this._lineArt;
  }
})


/**
 * Access the overlay art layer's content through this object.
 * @name $.oDrawing#overlay
 * @readonly
 * @type {$.oArtLayer}
 */
Object.defineProperty(oDrawing.prototype, 'overlay', {
  get: function () {
    return this._overlay;
  }
})


/**
 * The list of artLayers of this drawing.
 * @name $.oDrawing#artLayers
 * @readonly
 * @type {$.oArtLayer[]}
 */
Object.defineProperty(oDrawing.prototype, 'artLayers', {
  get: function () {
    return this._artLayers;
  }
})



/**
 * the shapes contained amongst all artLayers of this drawing.
 * @name $.oDrawing#shapes
 * @readonly
 * @type {$.oShape[]}
 */
Object.defineProperty(oDrawing.prototype, 'shapes', {
  get: function () {
    var _shapes = [];
    for (var i in this.artLayers) {
      _shapes = _shapes.concat(this.artLayers[i].shapes);
    }

    return _shapes;
  }
})


/**
 * the strokes contained amongst all artLayers of this drawing.
 * @name $.oDrawing#strokes
 * @readonly
 * @type {$.oStroke[]}
 */
Object.defineProperty(oDrawing.prototype, 'strokes', {
  get: function () {
    var _strokes = [];
    for (var i in this.artLayers) {
      _strokes = _strokes.concat(this.artLayers[i].strokes);
    }

    return _strokes;
  }
})


/**
 * The contours contained amongst all the shapes of the artLayer.
 * @name $.oDrawing#contours
 * @type {$.oContour[]}
 */
 Object.defineProperty(oDrawing.prototype, 'contours', {
  get: function () {
    var _contours = []

    for (var i in this.artLayers) {
      _contours = _contours.concat(this.artLayers[i].contours)
    }

    return _contours
  }
})



/**
 * the currently active art layer of this drawing.
 * @name $.oDrawing#activeArtLayer
 * @type {$.oArtLayer}
 */
Object.defineProperty(oDrawing.prototype, 'activeArtLayer', {
  get: function () {
    var settings = Tools.getToolSettings();
    if (!settings.currentDrawing) return null;

    return this.artLayers[settings.activeArt]
  },
  set: function (newArtLayer) {
    var layers = this.ART_LAYER
    var index = layers[newArtLayer.name.toUpperCase()]
    this.setAsActiveDrawing(index);
  }
})


/**
 * the selected shapes on this drawing
 * @name $.oDrawing#selectedShapes
 * @type {$.oShape}
 */
Object.defineProperty(oDrawing.prototype, 'selectedShapes', {
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
Object.defineProperty(oDrawing.prototype, 'selectedStrokes', {
  get: function () {
    var _selectedStrokes = [];
    for (var i in this.artLayers) {
      _selectedStrokes = _selectedStrokes.concat(this.artLayers[i].selectedStrokes);
    }

    return _selectedStrokes;
  }
})


/**
 * the selected shapes on this drawing
 * @name $.oDrawing#selectedContours
 * @type {$.oShape}
 */
Object.defineProperty(oDrawing.prototype, 'selectedContours', {
  get: function () {
    var _selectedContours = [];
    for (var i in this.artLayers) {
      _selectedContours = _selectedContours.concat(this.artLayers[i].selectedContours);
    }

    return _selectedContours;
  }
})


/**
 * all the data from this drawing. For internal use.
 * @name $.oDrawing#drawingData
 * @type {Object}
 * @readonly
 * @private
 */
Object.defineProperty(oDrawing.prototype, 'drawingData', {
  get: function () {
    var _data = Drawing.query.getData({drawing: this._key});
    if (!_data) throw new Error("Data unavailable for drawing "+this.name)
    return _data;
  }
})


/**
 * The drawings of the same name in other elements synched with this one.
 * @name $.oDrawing#synchedDrawing
 * @type {$.oDrawing[]}
 * @readonly
 * @private
 */
Object.defineProperty(oDrawing.prototype, 'synchedDrawings', {
  get: function () {
    var _syncedElements = this.element.synchedElements;
    var _syncedDrawings = []
    for (e in _syncedElements){
      // skip this element
      if (_syncedElements[e]._synchedLayer == this.element._synchedLayer) continue;
      _syncedDrawings.push(_syncedElements[e].getDrawingByName(this.name));
    }
    return _syncedDrawings;
  }
})



// $.oDrawing Class methods

/**
 * Import a given file into an existing drawing.
 * @param   {$.oFile} file                  The path to the file
 * @param   {bool}    [convertToTvg=false]  Wether to convert the bitmap to the tvg format (this doesn't vectorise the drawing)
 *
 * @return { $.oFile }   the oFile object pointing to the drawing file after being it has been imported into the element folder.
 */
oDrawing.prototype.importBitmap = function (file, convertToTvg) {
  var _path = new this.$.oFile(this.path);
  if (!(file instanceof this.$.oFile)) file = new this.$.oFile(file);
  if (!file.exists) throw new Error ("Can't import bitmap "+file.path+", file doesn't exist");

  if (convertToTvg && file.extension.toLowerCase() != "tvg"){
    // use utransform binary to perform conversion
    var _bin = specialFolders.bin + "/utransform";

    var tempFolder = this.$.scn.tempFolder;
    var res_x = this.$.scn.resolutionX
    var res_y = this.$.scn.resolutionY

    var _convertedFilePath = tempFolder.path + "/" + file.name + ".tvg";
    var _convertProcess = new this.$.oProcess(_bin, ["-outformat", "TVG", "-debug", "-resolution", res_x, res_y, "-outfile", _convertedFilePath, file.path]);
    this.$.log(_convertProcess.execute())

    var convertedFile = new this.$.oFile(_convertedFilePath);
    if (!convertedFile.exists) throw new Error ("Converting " + file.path + " to TVG has failed.");

    file = convertedFile;
  }

  return file.copy(_path.folder, _path.name, true);
}


/**
 * @returns {int[]}  The frame numbers at which this drawing appears.
 */
oDrawing.prototype.getVisibleFrames = function () {
  var _element = this.element;
  var _column = _element.column;

  if (!_column) {
    this.$.debug("Column missing: can't get visible frames for  drawing " + this.name + " of element " + _element.name, this.$.DEBUG_LEVEL.ERROR);
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
oDrawing.prototype.remove = function () {
  var _element = this.element;
  var _column = _element.column;

  if (!_column) {
    throw new Error ("Column missing: impossible to delete drawing " + this.name + " of element " + _element.name);
  }

  var _frames = _column.frames;
  var _lastFrame = _frames.pop();

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
oDrawing.prototype.refreshPreview = function () {
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

oDrawing.prototype.setAsActiveDrawing = function (artLayer) {
  // this.$.log("setting active drawing to "+ this.name + " " + this.element+' '+this.element.column)
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
oDrawing.prototype.duplicate = function(frame, newName, duplicateSynchedDrawings){
  var _element = this.element
  if (typeof duplicateSynchedDrawings === 'undefined') duplicateSynchedDrawings = true; // hidden parameter used to avoid recursion bomb
  if (typeof frame ==='undefined') var frame = this.$.scn.currentFrame;
  if (typeof newName === 'undefined') var newName = frame;
  var newDrawing = _element.addDrawing(frame, newName, this.path);

  // also duplicate synched drawings
  if (duplicateSynchedDrawings){
    var _syncedDrawings = newDrawing.synchedDrawings;
    for (var i in _syncedDrawings){
      var _originalDrawing = _syncedDrawings[i].element.getDrawingByName(this.name);
      var _file = new this.$.oFile(_originalDrawing.path);
      var _path = new this.$.oFile(_syncedDrawings[i].path);
      return _file.copy(_path.folder, _path.name, true);
    }
  }

  return newDrawing;
}

/**
 * Replaces a color Id present on the drawing by another.
 * @param {string} currentId
 * @param {string} newId
 */
oDrawing.prototype.replaceColorId = function (currentId, newId){
  DrawingTools.recolorDrawing( this._key, [{from:currentId, to:newId}]);
}


/**
 * Copies the contents of the Drawing into the clipboard
 * @param {oDrawing.ART_LAYER} [artLayer]    Specify to only copy the contents of the specified artLayer
 */
oDrawing.prototype.copyContents = function (artLayer) {

  var _current = this.setAsActiveDrawing(artLayer);
  if (!_current) {
    this.$.debug("Impossible to copy contents of drawing " + this.name + " of element " + _element.name + ", the drawing cannot be set as active.", this.$.DEBUG_LEVEL.ERROR);
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
oDrawing.prototype.pasteContents = function (artLayer) {

  var _current = this.setAsActiveDrawing(artLayer);
  if (!_current) {
    this.$.debug("Impossible to copy contents of drawing " + this.name + " of element " + _element.name + ", the drawing cannot be set as active.", this.$.DEBUG_LEVEL.ERROR);
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
oDrawing.prototype.setLineEnds = function (endType, artLayer) {
  if (this.$.batchMode) {
    this.$.debug("setting line ends not available in batch mode", this.$.DEBUG_LEVEL.ERROR);
    return;
  }

  var _current = this.setAsActiveDrawing(artLayer);
  if (!_current) {
    this.$.debug("Impossible to change line ends on drawing " + this.name + " of element " + _element.name + ", the drawing cannot be set as active.", this.$.DEBUG_LEVEL.ERROR);
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
oDrawing.prototype.toString = function () {
  return this.name;
}


exports.oDrawing = oDrawing;