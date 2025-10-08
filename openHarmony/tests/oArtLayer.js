var assert = require("helpers.js").assert

// ----------------------- oArtLayer tests --------------------//
exports.testArtLayerShapes = {
  message: "oArtLayer.shapes",
  disableUndo: true, //required because Undo crashes with this test for some reason
  prepare: function () {
    this.testNode = $.scn.root.addDrawingNode('TestNode');
    assert(!!this.testNode, true, 'test drawing node created');
    this.testNode.addDrawing(1, 'test');
    assert(this.testNode.element.drawings.length, 1, 'drawing was not created');
    this.testPalette = $.scn.addPalette("test");
    assert(!!this.testPalette, true, 'test palette created');
    assert(this.testPalette.colors.length, 1, 'test palette has one color');
  },
  run: function () {
    assert(!!this.testNode, true, 'test drawing node was not accessed');
    assert(!!this.testNode.element, true, "node doesn't have an element");
    assert(this.testNode.element.drawings.length, 1, 'element has no drawings');
    var drawing = this.testNode.element.getDrawingByName('test');
    assert(!!drawing, true, 'drawing was not accessed');
    assert(drawing.artLayers.length, 4, 'artlayers not found');
    assert(drawing.artLayers[0].name, 'underlay', 'artlayer 0 is not underlay');
    assert(drawing.artLayers[1].name, 'colorArt', 'artlayer 1 is not colorArt');
    assert(drawing.artLayers[2].name, 'lineArt', 'artlayer 2 is not lineArt');
    assert(drawing.artLayers[3].name, 'overlay', 'artlayer 3 is not overlay');

    var stencil = new $.oStencil("line", "pencil", {minThickness: 5, maxThickness: 5});
    assert(!!this.testPalette, true, 'palette was not accessed');
    assert(this.testPalette.colors.length, 1, 'color was not accessed');
    var color = this.testPalette.colors[0];
    assert(!!color, true, 'color was not accessed');

    var lineStyle = new $.oLineStyle(color.id, stencil);
    var fillStyle = new $.oFillStyle(color.id);

    var shapePath = [
      {x:200,y:-150, onCurve:true},
      {x:135,y:100, onCurve:false},
      {x:-250,y:100, onCurve:false},
      {x:-300,y:-150, onCurve:true},
      {x:200,y:-150, onCurve:true},
    ]

    var holesPath = [
      [
        {x:10,y:-20, onCurve:true},
        {x:20,y:-20, onCurve:true},
        {x:20,y:-10, onCurve:true},
        {x:10,y:-10, onCurve:true},
        {x:10,y:-20, onCurve:true},
      ],
      [
        {x:10,y:20, onCurve:true},
        {x:20,y:20, onCurve:true},
        {x:20,y:10, onCurve:true},
        {x:10,y:10, onCurve:true},
        {x:10,y:20, onCurve:true},
      ]
    ]

    $.scn.activeDrawing = drawing; // required for drawing
    drawing.lineArt.drawStroke(shapePath, lineStyle, null);
    drawing.colorArt.drawShape(shapePath, null, fillStyle, false, false, holesPath);
    assert(drawing.lineArt.shapes.length, 1, 'shape was not created on lineArt');
    assert(drawing.lineArt.strokes.length, 1, 'stroke was not found on lineArt');
    assert(drawing.lineArt.contours.length, 0, 'fill was not found on lineArt');
    assert(drawing.colorArt.shapes.length, 1, 'shape was not created on lineArt');
    assert(drawing.colorArt.strokes.length, 0, 'stroke was not found on lineArt');
    assert(drawing.colorArt.contours.length, 1, 'fill was not found on lineArt');
    assert(drawing.colorArt.contours[0].holes.length, 2, 'fill holes not created');
  },
  check: function () {
    // undo is handled manually to avoid Harmony crash
    this.testNode.remove()
    this.testPalette.remove()
  },
}
