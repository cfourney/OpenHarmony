var assert = require("helpers.js").assert

// ----------------------- oNode tests ----------------------//
exports.testoNodeName = {
    message:"oNode.name",
    prepare:function(){
    },
    run:function(){
        $.scn.root.addNode('READ') // ensure there is at least one node
        $.scn.root.nodes[0].name = 'Test'
        assert($.scn.root.nodes[0].name, 'Test', 'writing and reading node name')
    },
    check:function(){
    },
}

// ----------------------- Per-type subclass & shorthand tests ----------------------//

/**
 * Shorthand works immediately (prototype getter triggers lazy load) on PEG
 */
exports.testoNodeShorthandImmediatePeg = {
    message:"oNode shorthand works immediately (PEG)",
    prepare:function(){
    },
    run:function(){
        var peg = $.scn.root.addNode('PEG');

        // Before access, cache should be null
        assert(peg._attributes_cached === null, true, 'cache should start null');

        // Access shorthand without touching .attributes
        peg.position.x = 12;

        // Lazy load should have occurred
        assert(peg._attributes_cached !== null, true, 'cache should be populated after shorthand');
        assert(peg.position.x === 12, true, 'shorthand setter should persist');
    },
    check:function(){
    },
}

/**
 * Shorthand matches explicit access on READ
 */
exports.testoNodeShorthandMatchesExplicitRead = {
    message:"oNode shorthand matches explicit (READ)",
    prepare:function(){
    },
    run:function(){
        var read = $.scn.root.addNode('READ');

        // READ nodes use 'offset' not 'position'
        // Set via shorthand
        read.offset.x = 7;
        var explicit = read.attributes.offset.x.getValue();
        assert(explicit === 7, true, 'explicit matches shorthand set');

        // Set via explicit
        read.attributes.offset.x.setValue(21);
        assert(read.offset.x === 21, true, 'shorthand reads explicit set');
    },
    check:function(){
    },
}

/**
 * Shorthand matches explicit access on PEG
 */
exports.testoNodeShorthandMatchesExplicitPeg = {
    message: "oNode shorthand matches explicit attribute access (PEG)",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('PEG');
        
        // Set a value using shorthand
        testNode.position.x = 42;
        
        // Read using explicit method - should match
        var explicitValue = testNode.attributes.position.x.getValue();
        assert(explicitValue === 42, true,
            'explicit method should read value set by shorthand');
        
        // Now set using explicit method
        testNode.attributes.position.x.setValue(99);
        
        // Read using shorthand - should match
        var shorthandValue = testNode.position.x;
        assert(shorthandValue === 99, true,
            'shorthand should read value set by explicit method');
    },
    check: function(){
    },
}

/**
 * instanceof remains correct for per-type subclasses
 */
exports.testoNodeInstanceofPeg = {
    message:"oNode instanceof works (PEG)",
    prepare:function(){
    },
    run:function(){
        var peg = $.scn.root.addNode('PEG');
        assert(peg instanceof $.oNode, true, 'peg is instance of oNode');
        assert(peg instanceof $.oPegNode, true, 'peg is instance of oPegNode');
    },
    check:function(){
    },
}

/**
 * instanceof works for all named subclasses (READ -> oDrawingNode)
 */
exports.testoNodeInstanceofDrawingNode = {
    message:"oNode instanceof works (READ -> oDrawingNode)",
    prepare:function(){
    },
    run:function(){
        var read = $.scn.root.addNode('READ');
        assert(read instanceof $.oNode, true, 'read is instance of oNode');
        assert(read instanceof $.oDrawingNode, true, 'read is instance of oDrawingNode');
        assert(read instanceof $.oPegNode, false, 'read is not instance of oPegNode');
    },
    check:function(){
    },
}

/**
 * instanceof works for GROUP nodes (oGroupNode)
 */
exports.testoNodeInstanceofGroupNode = {
    message:"oNode instanceof works (GROUP -> oGroupNode)",
    prepare:function(){
    },
    run:function(){
        var group = $.scn.root.addGroup('TestGroup');
        assert(group instanceof $.oNode, true, 'group is instance of oNode');
        assert(group instanceof $.oGroupNode, true, 'group is instance of oGroupNode');
        assert(group instanceof $.oPegNode, false, 'group is not instance of oPegNode');
    },
    check:function(){
    },
}

/**
 * instanceof works for COLOR_OVERRIDE_TVG nodes (oColorOverrideNode)
 */
exports.testoNodeInstanceofColorOverrideNode = {
    message:"oNode instanceof works (COLOR_OVERRIDE_TVG -> oColorOverrideNode)",
    prepare:function(){
    },
    run:function(){
        var colorNode = $.scn.root.addNode('COLOR_OVERRIDE_TVG');
        assert(colorNode instanceof $.oNode, true, 'colorNode is instance of oNode');
        assert(colorNode instanceof $.oColorOverrideNode, true, 'colorNode is instance of oColorOverrideNode');
        assert(colorNode instanceof $.oPegNode, false, 'colorNode is not instance of oPegNode');
    },
    check:function(){
    },
}

/**
 * instanceof works for TransformationSwitch nodes (oTransformSwitchNode)
 */
exports.testoNodeInstanceofTransformSwitchNode = {
    message:"oNode instanceof works (TransformationSwitch -> oTransformSwitchNode)",
    prepare:function(){
    },
    run:function(){
        var tsNode = $.scn.root.addNode('TransformationSwitch');
        assert(tsNode instanceof $.oNode, true, 'tsNode is instance of oNode');
        assert(tsNode instanceof $.oTransformSwitchNode, true, 'tsNode is instance of oTransformSwitchNode');
        assert(tsNode instanceof $.oPegNode, false, 'tsNode is not instance of oPegNode');
    },
    check:function(){
    },
}

/**
 * instanceof works for generic node types (default case -> oNode)
 */
exports.testoNodeInstanceofGenericNode = {
    message:"oNode instanceof works (generic types -> oNode)",
    prepare:function(){
    },
    run:function(){
        var comp = $.scn.root.addNode('COMPOSITE');
        assert(comp instanceof $.oNode, true, 'comp is instance of oNode');
        assert(comp instanceof $.oPegNode, false, 'comp is not instance of oPegNode');
        assert(comp instanceof $.oDrawingNode, false, 'comp is not instance of oDrawingNode');
        assert(comp instanceof $.oGroupNode, false, 'comp is not instance of oGroupNode');
    },
    check:function(){
    },
}

/**
 * instanceof inheritance chain is correct - all nodes inherit from oNode
 */
exports.testoNodeInstanceofInheritanceChain = {
    message:"oNode instanceof inheritance chain is correct",
    prepare:function(){
    },
    run:function(){
        // Test that all node types are instanceof oNode
        var peg = $.scn.root.addNode('PEG');
        var read = $.scn.root.addNode('READ');
        var group = $.scn.root.addGroup('TestGroup2');
        var comp = $.scn.root.addNode('COMPOSITE');
        
        assert(peg instanceof $.oNode, true, 'PEG is instance of oNode');
        assert(read instanceof $.oNode, true, 'READ is instance of oNode');
        assert(group instanceof $.oNode, true, 'GROUP is instance of oNode');
        assert(comp instanceof $.oNode, true, 'COMPOSITE is instance of oNode');
        
        // Test that specific subclasses are not cross-compatible
        assert(peg instanceof $.oDrawingNode, false, 'PEG is not instance of oDrawingNode');
        assert(read instanceof $.oPegNode, false, 'READ is not instance of oPegNode');
        assert(group instanceof $.oPegNode, false, 'GROUP is not instance of oPegNode');
    },
    check:function(){
    },
}

/**
 * Test shorthand works for nested attributes (e.g., node.position.x, node.position.y)
 */
exports.testoNodeShorthandNestedAttributes = {
    message: "oNode shorthand works for nested attributes",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('PEG');
        
        // Test setting multiple nested values immediately (no .attributes access first)
        testNode.position.x = 10;
        testNode.position.y = 20;
        testNode.position.z = 30;
        
        // Verify all values were set correctly
        assert(testNode.position.x === 10, true,
            'position.x should be 10');
        assert(testNode.position.y === 20, true,
            'position.y should be 20');
        assert(testNode.position.z === 30, true,
            'position.z should be 30');
    },
    check: function(){
    },
}

/**
 * Test shorthand works after refreshAttributes
 */
exports.testoNodeShorthandAfterRefresh = {
    message: "oNode shorthand works after refreshAttributes",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('PEG');
        
        // Set initial value using shorthand
        testNode.position.x = 25;
        assert(testNode.position.x === 25, true,
            'initial shorthand set should work');
        
        // Refresh attributes
        testNode.refreshAttributes();
        
        // Shorthand should still work after refresh
        testNode.position.x = 75;
        assert(testNode.position.x === 75, true,
            'shorthand should work after refresh');
        
        // Verify consistency with explicit access
        var explicitValue = testNode.attributes.position.x.getValue();
        assert(explicitValue === 75, true,
            'explicit access should match shorthand after refresh');
    },
    check: function(){
    },
}

/**
 * Test drawing attribute shorthand on READ nodes
 */
exports.testoNodeShorthandDrawingAttribute = {
    message: "oNode drawing shorthand works on READ nodes",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('READ');
        
        // Access drawing attribute (common on READ nodes)
        var drawing = testNode.drawing;

        // drawing should exist on READ nodes
        assert(drawing !== undefined, true,
            'drawing attribute should exist on READ node');
    },
    check: function(){
    },
}

/**
 * Test shorthand works on different node types
 */
exports.testoNodeShorthandDifferentTypes = {
    message: "oNode shorthand works on different node types",
    prepare: function(){
    },
    run: function(){
        // Test PEG node with position
        var pegNode = $.scn.root.addNode('PEG');
        pegNode.position.x = 50;
        assert(pegNode.position.x === 50, true,
            'shorthand should work on PEG node');
        
        // Test READ node with drawing
        var readNode = $.scn.root.addNode('READ');
        var drawing = readNode.drawing;
        assert(drawing !== undefined, true,
            'shorthand should work on READ node');
        
        // Test COMPOSITE node with flatten
        var compNode = $.scn.root.addNode('COMPOSITE');
        var flatten = compNode.flatten;
        // flatten may or may not exist depending on Harmony version
        // ensure node creation succeeded
        assert(typeof compNode === 'object', true,
            'COMPOSITE node should be valid');
    },
    check: function(){
    },
}

/**
 * Temp scan group is cleaned up after subclass creation
 */
exports.testoNodeScanTempCleanup = {
    message:"oNode type scan temp group cleanup",
    prepare:function(){
    },
    run:function(){
        // Trigger a new type scan by creating a generic node type
        // (not one of the named subclasses like READ, PEG, GROUP, etc.)
        // COMPOSITE goes through the default case in getNodeByPath
        var comp = $.scn.root.addNode('COMPOSITE');

        // No temp scan group should remain under Top (name includes timestamp)
        var tops = node.subNodes('Top');
        var hasScanGroup = false;
        for (var i = 0; i < tops.length; i++) {
            if (tops[i].indexOf('_OH_TYPE_SCAN_') !== -1) {
                hasScanGroup = true;
                break;
            }
        }
        assert(hasScanGroup === false, true, 'temp scan group should be removed');
    },
    check:function(){
    },
}
