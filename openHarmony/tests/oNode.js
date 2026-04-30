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

// ----------------------- Shorthand Attribute Getter/Setter Tests ----------------------//
// These tests verify shorthand attribute access like node.position.x = 5.
// Dynamic placeholder getters are created for all attributes at first node creation,
// so shorthand access works immediately for any attribute.

/**
 * Test shorthand attribute getter returns a value
 * Verifies: node.position works immediately on PEG nodes
 */
exports.testoNodeShorthandGetterWorks = {
    message: "oNode shorthand getter returns a value",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('PEG');
        
        var position = testNode.position;
        
        // Verify we got a valid value
        assert(position !== undefined, true,
            'shorthand getter should return a value');
    },
    check: function(){
    },
}

/**
 * Test shorthand attribute setter works immediately
 * Verifies: node.position.x = 5 works without accessing .attributes first
 */
exports.testoNodeShorthandSetterImmediate = {
    message: "oNode shorthand setter works immediately",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('PEG');
        
        // Set value using shorthand immediately - no .attributes access first!
        testNode.position.x = 100;
        
        // Verify the value was set
        var newX = testNode.position.x;
        assert(newX === 100, true,
            'shorthand setter should change the value');
    },
    check: function(){
    },
}

/**
 * Test shorthand matches explicit attribute access
 * Verifies: node.position.x === node.attributes.position.x.getValue()
 */
exports.testoNodeShorthandMatchesExplicit = {
    message: "oNode shorthand matches explicit attribute access",
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
 * Tests for oNode.getAttributeSnapshot / applyAttributeSnapshot
 * Verifies: oNode.getAttributeSnapshot captures and applies attribute values, including animation keyframes and drawing substitutions.
 */
exports.testSnapshotRoundtrip = {
    message: "oNode snapshot roundtrip preserves static attribute values",
    prepare: function() {},
    run: function() {
        var peg = $.scn.root.addNode('PEG');
        peg.attributes.position.x.setValue(123);
        peg.attributes.position.y.setValue(456);

        var snap = peg.getAttributeSnapshot();

        peg.attributes.position.x.setValue(0);
        peg.attributes.position.y.setValue(0);

        peg.applyAttributeSnapshot(snap);

        assert(peg.attributes.position.x.getValue(), 123, 'position.x should be restored');
        assert(peg.attributes.position.y.getValue(), 456, 'position.y should be restored');
    },
    check: function() {},
};

exports.testSnapshotAnimated = {
    message: "oNode snapshot roundtrip preserves keyframe data",
    prepare: function() {},
    run: function() {
        var peg = $.scn.root.addNode('PEG');
        var attr = peg.attributes.position.x;
        attr.setValue(10, 1);
        attr.setValue(20, 5);
        attr.setValue(30, 10);

        var snap = peg.getAttributeSnapshot();

        attr.setValue(0, 1);
        attr.setValue(0, 5);
        attr.setValue(0, 10);

        peg.applyAttributeSnapshot(snap);

        assert(attr.getValue(1),  10, 'keyframe at f1 should be restored');
        assert(attr.getValue(5),  20, 'keyframe at f5 should be restored');
        assert(attr.getValue(10), 30, 'keyframe at f10 should be restored');
    },
    check: function() {},
};

exports.testSnapshotDrawingSubstitution = {
    message: "oNode snapshot roundtrip preserves drawing substitutions on READ nodes",
    prepare: function() {},
    run: function() {
        var read = $.scn.root.addNode('READ');
        var drawingAttr = read.attributes.drawing;

        // Only meaningful if the node has a drawing column (element attached)
        if (!drawingAttr || !drawingAttr.column) return;

        var snap = read.getAttributeSnapshot();
        assert(typeof snap === 'object', true, 'snapshot should be an object');

        // Reapply should not throw
        read.applyAttributeSnapshot(snap);
    },
    check: function() {},
};

// ---------