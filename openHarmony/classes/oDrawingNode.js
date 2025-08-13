//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oDrawingNode class      //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oNode = require("./oNode.js");

/**
 * Constructor for the $.oDrawingNode class
 * @classdesc
 * $.oDrawingNode is a subclass of $.oNode and implements the same methods and properties as $.oNode. <br>
 * It represents 'read' nodes or Drawing nodes in the scene.
 * @constructor
 * @augments   $.oNode
 * @param   {string}           path                          Path to the node in the network.
 * @param   {$.oScene}         oSceneObject                  Access to the oScene object of the DOM.
 * @example
 * // Drawing Nodes are more than a node, as they do not work without an associated Drawing column and element.
 * // adding a drawing node will automatically create a column and an element, unless they are provided as arguments.
 * // Creating an element makes importing a drawing file possible.
 *
 * var doc = $.scn;
 *
 * var drawingName = "myDrawing";
 * var myElement = doc.addElement(drawingName, "TVG");                      // add an element that holds TVG(Toonboom Vector Drawing) files
 * var myDrawingColumn = doc.addColumn("DRAWING", drawingName, myElement);  // create a column and link the element created to it
 *
 * var sceneRoot = doc.root;                                                // grab the scene root group
 *
 * // Creating the Drawing node and linking the previously created element and column
 * var myDrawingNode = sceneRoot.addDrawingNode(drawingName, new $.oPoint(), myDrawingColumn, myElement);
 *
 * // This also works:
 *
 * var myOtherNode = sceneRoot.addDrawingNode("Drawing2");
 */
function oDrawingNode(path, oSceneObject) {
    // $.oDrawingNode can only represent a node of type 'READ'
    if (node.type(path) != 'READ') throw "'path' parameter must point to a 'READ' type node";
    var instance = this.$.oNode.call(this, path, oSceneObject);
    if (instance) return instance;

    this._type = 'drawingNode';
}
oDrawingNode.prototype = Object.create(oNode.prototype);


/**
 * The element that holds the drawings displayed by the node.
 * @name $.oDrawingNode#element
 * @type {$.oElement}
 */
Object.defineProperty(oDrawingNode.prototype, "element", {
  get : function(){
    return this.timingColumn.element;
  },

  set : function( oElementObject ){
    var _column = this.attributes.drawing.element.column;
    column.setElementIdOfDrawing( _column.uniqueName, oElementObject.id );
  }
});


/**
 * The column that holds the drawings displayed by the node.
 * @name $.oDrawingNode.timingColumn
 * @type {$.oDrawingColumn}
 */
Object.defineProperty(oDrawingNode.prototype, "timingColumn", {
  get : function(){
    return this.attributes.drawing.element.column;
  },

  set : function (oColumnObject){
    var _attribute = this.attributes.drawing.element;
    _attribute.column = oColumnObject;
  }
});


/**
 * An array of the colorIds contained within the drawings displayed by the node.
 * @name $.oDrawingNode#usedColorIds
 * @type {int[]}
 */
Object.defineProperty(oDrawingNode.prototype, "usedColorIds", {
  get : function(){
    // this.$.log("used colors in node : "+this.name)
    var _drawings = this.element.drawings;
    var _colors = [];

    for (var i in _drawings){
      var _drawingColors = _drawings[i].usedColorIds;
      for (var c in _drawingColors){
        if (_colors.indexOf(_drawingColors[c]) == -1) _colors.push(_drawingColors[c]);
      }
    }

    return _colors;
  }
});


/**
 * An array of the colors contained within the drawings displayed by the node, found in the palettes.
 * @name $.oDrawingNode#usedColors
 * @type {$.oColor[]}
 */
Object.defineProperty(oDrawingNode.prototype, "usedColors", {
  get : function(){
    // get unique Color Ids
    var _ids = this.usedColorIds;

    // look in both element and scene palettes
    var _palettes = this.palettes.concat(this.$.scn.palettes);

    // build a palette/id list to speedup massive palettes/palette lists
    var _colorIds = {}
    for (var i in _palettes){
      var _palette = _palettes[i];
      var _colors = _palette.colors;
      _colorIds[_palette.name] = {};
      for (var j in _colors){
        _colorIds[_palette.name][_colors[j].id] = _colors[j];
      }
    }

    // for each id on the drawing, identify the corresponding color
    var _usedColors = _ids.map(function(id){
      for (var paletteName in _colorIds){
        if (_colorIds[paletteName][id]) return _colorIds[paletteName][id];
      }
      throw new Error("Missing color found for id: "+id+". Color doesn't belong to any palette in the scene or element.");
    })

    return _usedColors;
  }
})


/**
 * The drawing.element keyframes.
 * @name $.oDrawingNode#timings
 * @type {$.oFrames[]}
 * @example
 * // The timings hold the keyframes that display the drawings across time.
 *
 * var timings = $.scn.$node("Top/Drawing").timings;
 * for (var i in timings){
 *   $.log( timings.frameNumber+" : "+timings.value);      // outputs the frame and the value of each keyframe
 * }
 *
 * // timings are keyframe objects, so they are dynamic.
 * timings[2].value = "5";                                 // sets the displayed image of the second key to the drawing named "5"
 *
 * // to set a new value to a frame that wasn't a keyframe before, it's possible to use the attribute keyword like so:
 *
 * var myNode = $.scn.$node("Top/Drawing");
 * myNode.drawing.element = {frameNumber: 5, value: "10"}             // setting the value of the frame 5
 * myNode.drawing.element = {frameNumber: 6, value: timings[1].value} // setting the value to the same as one of the timings
 */
Object.defineProperty(oDrawingNode.prototype, "timings", {
    get : function(){
        return this.attributes.drawing.element.getKeyframes();
    }
})


/**
 * The element palettes linked to the node.
 * @name $.oDrawingNode#palettes
 * @type {$.oPalette[]}
 */
Object.defineProperty(oDrawingNode.prototype, "palettes", {
  get : function(){
    var _element = this.element;
    return _element.palettes;
  }
})


// Class Methods

/**
 * Gets the drawing name at the given frame.
 * @param {int} frameNumber
 * @return {$.oDrawing}
 */
oDrawingNode.prototype.getDrawingAtFrame = function(frameNumber){
  if (typeof frame === "undefined") var frame = this.$.scene.currentFrame;

  var _attribute = this.attributes.drawing.element
  return _attribute.getValue(frameNumber);
}


 /**
 * Gets the list of palettes containing colors used by a drawing node. This only gets palettes with the first occurence of the colors.
 * @return  {$.oPalette[]}   The palettes that contain the color IDs used by the drawings of the node.
 */
oDrawingNode.prototype.getUsedPalettes = function(){
  var _palettes = {};
  var _usedPalettes = [];

  var _usedColors = this.usedColors;
  // build an object of palettes under ids as keys to remove duplicates
  for (var i in _usedColors){
    var _palette = _usedColors[i].palette;
    _palettes[_palette.id] = _palette;
  }
  for (var i in _palettes){
    _usedPalettes.push(_palettes[i]);
  }

  return _usedPalettes;
}


/**
 * Displays all the drawings from the node's element onto the timeline
 * @param {int} [framesPerDrawing=1]   The number of frames each drawing will be shown for
 */
oDrawingNode.prototype.exposeAllDrawings = function(framesPerDrawing){
  if (typeof framesPerDrawing === 'undefined') var framesPerDrawing = 1;

  var _drawings = this.element.drawings;
  var frameNumber = 1;
  for (var i=0; i < _drawings.length; i++){
    //log("showing drawing "+_drawings[i].name+" at frame "+i)
    this.showDrawingAtFrame(_drawings[i], frameNumber);
    frameNumber+=framesPerDrawing;
  }

  var _column = this.timingColumn;
  var _exposures = _column.getKeyframes();
  _column.extendExposures(_exposures, framesPerDrawing-1);
}


/**
 * Adds a new empty drawing to the drawingNode at the given frame. Can specify a file for the drawing (to import it)
 * @see $#oElement.addDrawing
 * @param {int} [atFrame=1] The frame at which to add the drawing on the $.oDrawingColumn. Values < 1 create no exposure
 * @param {string} [name] The name of the drawing to add.
 * @param {string} [filename] Optionally, a path for a drawing file to use for this drawing. Can pass an oFile object as well.
 * @param {bool} [convertToTvg=false] If the filename isn't a tvg file, specify if you want it converted (this doesn't vectorize the drawing).
 * @return {$.oDrawing} the created drawing
 */
oDrawingNode.prototype.addDrawing = function(atFrame, name, filename, convertToTvg){
  return this.element.addDrawing(atFrame, name, filename, convertToTvg);
}


/**
 * Displays the given drawing at the given frame
 * @param {$.oDrawing} drawing
 * @param {int} frameNum
 */
oDrawingNode.prototype.showDrawingAtFrame = function(drawing, frameNum){
  var _column = this.timingColumn;
  _column.setValue(drawing.name, frameNum);
}


 /**
 * Links a palette to a drawing node as Element Palette.
 * @param {$.oPalette}     oPaletteObject      the palette to link to the node
 * @param {int}            [index]             The index of the list at which the palette should appear once linked
 *
 * @return  {$.oPalette}   The linked element Palette.
 */
oDrawingNode.prototype.linkPalette = function(oPaletteObject, index){
  return this.element.linkPalette(oPaletteObject, index);
}


 /**
 * Unlinks an Element Palette from a drawing node.
 * @param {$.oPalette}     oPaletteObject      the palette to unlink from the node
 *
 * @return {bool}          The success of the unlink operation.
 */
oDrawingNode.prototype.unlinkPalette = function(oPaletteObject){
  return this.element.unlinkPalette(oPaletteObject);
}




 /**
 * Duplicates a node by creating an independent copy.
 * @param   {string}    [newName]              The new name for the duplicated node.
 * @param   {oPoint}    [newPosition]          The new position for the duplicated node.
 * @param   {bool}      [duplicateElement]     Wether to also duplicate the element.
 */
oDrawingNode.prototype.duplicate = function(newName, newPosition, duplicateElement){
  if (typeof newPosition === 'undefined') var newPosition = this.nodePosition;
  if (typeof newName === 'undefined') var newName = this.name+"_1";
  if (typeof duplicateElement === 'undefined') var duplicateElement = true;

  var _duplicateElement = duplicateElement?this.element.duplicate(this.name):this.element;

  var _duplicateNode = this.group.addDrawingNode(newName, newPosition, _duplicateElement);
  var _attributes = this.attributes;

  for (var i in _attributes){
    var _duplicateAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
    _duplicateAttribute.setToAttributeValue(_attributes[i], true);
  }

  var _duplicateAttribute = _duplicateNode.getAttributeByName(_attributes[i].keyword);
  _duplicateAttribute.setToAttributeValue(_attributes[i], true);

  return _duplicateNode;
};


 /**
 * Updates the imported drawings in the node.
 * @param {$.oFile}   sourcePath        the oFile object pointing to the source to update from
 * @param {string}    [drawingName]       the drawing to import the updated bitmap into
 * @todo implement a memory of the source through metadata
 */
oDrawingNode.prototype.update = function(sourcePath, drawingName){
  if (!this.element) return; // no element means nothing to update, import instead.
  if (typeof drawingName === 'undefined') var drawingName = this.element.drawings[0].name;

  var _drawing = this.element.getDrawingByName(drawingName);

  _drawing.importBitmap(sourcePath);
  _drawing.refreshPreview();
}


 /**
 * Extracts the position information on a drawing node, and applies it to a new peg instead.
 * @return  {$.oPegNode}   The created peg.
 */
oDrawingNode.prototype.extractPeg = function(){
    var _drawingNode = this;
    var _peg = this.group.addNode("PEG", this.name+"-P");
    var _columns = _drawingNode.linkedColumns;

    _peg.position.separate = _drawingNode.offset.separate;
    _peg.scale.separate = _drawingNode.scale.separate;

    // link each column that can be to the peg instead and reset the drawing node
    for (var i in _columns){
        var _attribute = _columns[i].attributeObject;
        var _keyword = _attribute._keyword;

        var _nodeAttribute = _drawingNode.getAttributeByName(_keyword);

        if (_keyword.indexOf("OFFSET") != -1) _keyword = _keyword.replace("OFFSET", "POSITION");

        var _pegAttribute = _peg.getAttributeByName(_keyword);

        if (_pegAttribute !== null){
            _pegAttribute.column = _columns[i];
            _nodeAttribute.column = null;
            _drawingNode[_keyword] = _attribute.defaultValue;
        }
    }

    _drawingNode.offset.separate = false; // doesn't work?
    _drawingNode.can_animate = false;

    _peg.centerAbove(_drawingNode, -1, -30)
    _drawingNode.linkInNode(_peg)

    return _peg;
}


 /**
 * Gets the contour curves of the drawing, as a concave hull.
 * @param   {int}          [count]                          The number of points on the contour curve to derive.
 * @param   {int}          [frame]                          The frame to derive the contours.
 *
 * @return  {oPoint[][]}   The contour curves.
 */
oDrawingNode.prototype.getContourCurves = function( count, frame ){

  if (typeof frame === 'undefined') var frame = this.scene.currentFrame;
  if (typeof count === 'undefined') var count = 3;

  var res = EnvelopeCreator().getDrawingBezierPath( this.path,
                           frame,      //FRAME
                           2.5,        //DISCRETIZER
                           0,          //K
                           count,      //DESIRED POINT COUNT
                           0,          //BLUR
                           0,          //EXPAND
                           false,      //SINGLELINE
                           true,       //USE MIN POINTS,
                           0,          //ADDITIONAL BISSECTING

                           false
                        );
  if( res.success ){
    var _curves = res.results.map(function(x){return [
                                                      new this.$.oPoint( x[0][0], x[0][1], 0.0 ),
                                                      new this.$.oPoint( x[1][0], x[1][1], 0.0 ),
                                                      new this.$.oPoint( x[2][0], x[2][1], 0.0 ),
                                                      new this.$.oPoint( x[3][0], x[3][1], 0.0 )
                                                    ]; } );
    return _curves;
  }

  return [];
}

exports = oDrawingNode;