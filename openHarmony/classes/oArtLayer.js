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
function oArtLayer (index, oDrawingObject) {
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
Object.defineProperty(oArtLayer.prototype, 'name', {
  get: function(){
    var names = ["underlay", "colorArt", "lineArt", "overlay"];
    return names[this._layerIndex];
  }
})


/**
 * The shapes contained on the artLayer.
 * @name $.oArtLayer#shapes
 * @type {$.oShape[]}
 */
Object.defineProperty(oArtLayer.prototype, 'shapes', {
  get: function () {
    if (!this.hasOwnProperty("_shapes")){
      var _shapesNum = Drawing.query.getNumberOfLayers(this._key);
      var _shapes = [];
      for (var i = 0; i < _shapesNum; i++) {
        _shapes.push(this.getShapeByIndex(i));
      }
      this._shapes = _shapes;
    }
    return this._shapes;
  }
})


/**
 * The strokes contained amongst all the shapes of the artLayer.
 * @name $.oArtLayer#strokes
 * @type {$.oStroke[]}
 */
Object.defineProperty(oArtLayer.prototype, 'strokes', {
  get: function () {
    var _strokes = [];

    var _shapes = this.shapes;
    for (var i in _shapes) {
      _strokes = _strokes.concat(_shapes[i].strokes);
    }

    return _strokes;
  }
})


/**
 * The contours contained amongst all the shapes of the artLayer.
 * @name $.oArtLayer#contours
 * @type {$.oContour[]}
 */
Object.defineProperty(oArtLayer.prototype, 'contours', {
  get: function () {
    var _contours = [];

    var _shapes = this.shapes;
    for (var i in _shapes) {
      _contours = _contours.concat(_shapes[i].contours);
    }

    return _contours;
  }
})


/**
 * The bounds of the layer, in drawing space coordinates. (null if the drawing is empty.)
 * @name $.oArtLayer#boundingBox
 * @type {$.oBox}
 */
Object.defineProperty(oArtLayer.prototype, 'boundingBox', {
  get: function () {
    var _box = Drawing.query.getBox(this._key);
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
Object.defineProperty(oArtLayer.prototype, 'selectedShapes', {
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
Object.defineProperty(oArtLayer.prototype, 'selectedStrokes', {
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
 * the currently selected contours on the ArtLayer.
 * @name $.oArtLayer#selectedContours
 * @type {$.oContour[]}
 */
Object.defineProperty(oArtLayer.prototype, 'selectedContours', {
  get: function () {
    var _shapes = this.selectedShapes;
    var _contours = [];

    for (var i in _shapes) {
      _contours = _contours.concat(_shapes[i].contours);
    }

    return _contours;
  }
})



/**
 * all the data from this artLayer. For internal use.
 * @name $.oArtLayer#drawingData
 * @type {$.oStroke[]}
 * @readonly
 * @private
 */
Object.defineProperty(oArtLayer.prototype, 'drawingData', {
  get: function () {
    var _data = this._drawing.drawingData
    for (var i in _data.arts){
      if (_data.arts[i].art == this._layerIndex) {
        return _data.arts[i];
      }
    }

    // in case of empty layerArt, return a default object
    return {art:this._layerIndex, artName:this.name, layers:[]};
  }
})


/**
 * Draws a circle on the artLayer.
 * @param {$.oPoint}       center         The center of the circle
 * @param {float}          radius         The radius of the circle
 * @param {$.oLineStyle}   [lineStyle]    Provide a $.oLineStyle object to specify how the line will look
 * @param {object}         [fillStyle=null]    The fill information to fill the circle with.
 * @returns {$.oShape}  the created shape containing the circle.
*/
oArtLayer.prototype.drawCircle = function(center, radius, lineStyle, fillStyle){
  if (typeof fillStyle === 'undefined') var fillStyle = null;

  var arg = {
    x: center.x,
    y: center.y,
    radius: radius
  };
  var _path = Drawing.geometry.createCircle(arg);

  return this.drawShape(_path, lineStyle, fillStyle);
}

/**
 * Draws the given path on the artLayer.
 * @param {$.oVertex[]}    path         an array of $.oVertex objects that describe a path.
 * @param {$.oLineStyle}   [lineStyle]  the line style to draw with. (By default, will use the current stencil selection)
 * @param {$.oFillStyle}   [fillStyle]  the fill information for the path. (By default, will use the current palette selection)
 * @param {bool}   [polygon]            Wether bezier handles should be created for the points in the path (ignores "onCurve" properties of oVertex from path)
 * @param {bool}   [createUnderneath]   Wether the new shape will appear on top or underneath the contents of the layer. (not working yet)
 */
oArtLayer.prototype.drawShape = function(path, lineStyle, fillStyle, polygon, createUnderneath){
  if (typeof fillStyle === 'undefined') var fillStyle = new this.$.oFillStyle();
  if (typeof lineStyle === 'undefined') var lineStyle = new this.$.oLineStyle();
  if (typeof polygon === 'undefined') var polygon = false;
  if (typeof createUnderneath === 'undefined') var createUnderneath = false;

  var index = this.shapes.length;

  var _lineStyle = {};

  if (lineStyle){
    _lineStyle.pencilColorId = lineStyle.colorId;
    _lineStyle.thickness = {
      "minThickness": lineStyle.minThickness,
      "maxThickness": lineStyle.maxThickness,
      "thicknessPath": 0
    };
  }

  if (fillStyle) _lineStyle.shaderLeft = 0;
  if (polygon) _lineStyle.polygon = true;
  _lineStyle.under = createUnderneath;
  _lineStyle.stroke = !!lineStyle;

  var strokeDesciption = _lineStyle;
  strokeDesciption.path = path;
  strokeDesciption.closed = !!fillStyle;

  var shapeDescription = {}
  if (fillStyle) shapeDescription.shaders = [{ colorId : fillStyle.colorId }]
  shapeDescription.strokes = [strokeDesciption]
  if (lineStyle) shapeDescription.thicknessPaths = [lineStyle.stencil.thicknessPath]

  var config = {
    label: "draw shape",
    drawing: this._key.drawing,
    art: this._key.art,
    layers: [shapeDescription]
  };


  var layers = DrawingTools.createLayers(config);

  var newShape = this.getShapeByIndex(index);
  this._shapes.push(newShape);
  return newShape;
};


/**
 * Draws the given path on the artLayer.
 * @param {$.oVertex[]}    path          an array of $.oVertex objects that describe a path.
 * @param {$.oLineStyle}   lineStyle     the line style to draw with.
 * @returns {$.oShape} the shape containing the added stroke.
 */
oArtLayer.prototype.drawStroke = function(path, lineStyle){
  return this.drawShape(path, lineStyle, null);
};


/**
 * Draws the given path on the artLayer as a contour.
 * @param {$.oVertex[]}    path          an array of $.oVertex objects that describe a path.
 * @param {$.oFillStyle}   fillStyle     the fill style to draw with.
 * @returns {$.oShape} the shape newly created from the path.
 */
oArtLayer.prototype.drawContour = function(path, fillStyle){
  return this.drawShape(path, null, fillStyle);
};


/**
 * Draws a rectangle on the artLayer.
 * @param {float}        x          the x coordinate of the top left corner.
 * @param {float}        y          the y coordinate of the top left corner.
 * @param {float}        width      the width of the rectangle.
 * @param {float}        height     the height of the rectangle.
 * @param {$.oLineStyle} lineStyle  a line style to use for the rectangle stroke.
 * @param {$.oFillStyle} fillStyle  a fill style to use for the rectange fill.
 * @returns {$.oShape} the shape containing the added stroke.
 */
oArtLayer.prototype.drawRectangle = function(x, y, width, height, lineStyle, fillStyle){
  if (typeof fillStyle === 'undefined') var fillStyle = null;

  var path = [
    {x:x,y:y,onCurve:true},
    {x:x+width,y:y,onCurve:true},
    {x:x+width,y:y-height,onCurve:true},
    {x:x,y:y-height,onCurve:true},
    {x:x,y:y,onCurve:true}
  ];

  return this.drawShape(path, lineStyle, fillStyle);
}



/**
 * Draws a line on the artLayer
 * @param {$.oPoint}     startPoint
 * @param {$.oPoint}     endPoint
 * @param {$.oLineStyle} lineStyle
 * @returns {$.oShape} the shape containing the added line.
 */
oArtLayer.prototype.drawLine = function(startPoint, endPoint, lineStyle){
  var path = [{x:startPoint.x,y:startPoint.y,onCurve:true},{x:endPoint.x,y:endPoint.y,onCurve:true}];

  return this.drawShape(path, lineStyle, null);
}


/**
 * Removes the contents of the art layer.
 */
oArtLayer.prototype.clear = function(){
  var _shapes = this.shapes;
  this.$.debug(_shapes, this.$.DEBUG_LEVEL.DEBUG);
  for (var i=_shapes.length - 1; i>=0; i--){
    _shapes[i].remove();
  }
}


/**
 * get a shape from the artLayer by its index
 * @param {int} index
 *
 * @return {$.oShape}
 */
oArtLayer.prototype.getShapeByIndex = function (index) {
  return new this.$.oShape(index, this);
}


/**
 * @private
 */
oArtLayer.prototype.toString = function(){
  return "Object $.oArtLayer ["+this.name+"]";
}

exports.oArtLayer = oArtLayer;