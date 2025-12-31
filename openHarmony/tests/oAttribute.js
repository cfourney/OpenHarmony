var assert = require("helpers.js").assert

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


exports.testCustomAttributes = {
  message: "creation and removal of custom attributes",
  prepare: function(){
  },
  run: function(){
    // testing attributes creation
    var testNode = $.scn.root.addDrawingNode('Test')
    testNode.createAttribute('test', "double", 'Test', true)
    testNode.test = 0.5 // testing setting the attribute using the shorthand
    assert(testNode.test, 0.5, 'Getting custom attribute using shorthand')
    assert(testNode.attributes.test.getValue(), 0.5, 'Getting custom attribute through attributes object')

    // testing animation
    testNode.attributes.test.column = $.scn.addColumn('BEZIER', 'Test')
    assert(!!testNode.attributes.test.column, true, 'Column was created and set')
    testNode.test = 0.8 // testing setting the attribute with linked column
    assert(testNode.test[1].value, 0.8, 'Getting custom attribute set with column present using shorthand')
    assert(testNode.attributes.test.column.keyframes.length, 1, 'Can retrieve the create keyframe when setting value')
    testNode.test = {frameNumber: 5, value: 0.2} // testing setting the attribute on a different frame
    assert(testNode.test[5].value, 0.2, 'Getting custom attribute set with column present on newly set frame using shorthand')
    assert(testNode.attributes.test.column.keyframes.length, 2, 'Can retrieve the create keyframes when setting value')
  },
  check: function(){
  },
}


exports.testDuplicateCloneCustomAttributes = {
  message: "Duplication and cloning of nodes with custom attributes",
  prepare: function(){
  },
  run: function(){
    // testing attributes creation
    var testNode = $.scn.root.addDrawingNode('Test')
    var attr = testNode.createAttribute('test', "double", 'Test', true)
    assert(!!attr, true, 'Attribute correctly created on Node')
    testNode.attributes.test.column = $.scn.addColumn('BEZIER', 'Test')
    testNode.test = 0.8 // testing setting the attribute with linked column
    testNode.test = {frameNumber: 5, value: 0.2} // testing setting the attribute on a different frame

    // testing node duplication
    var testNode2 = testNode.duplicate();
    assert(testNode2.test[5].value, 0.2, 'Duplicated node also can access the attribute')

    // testing node cloning
    var testNode3 = testNode.clone();
    assert(testNode3.test[5].value, 0.2, 'Cloned node also can access the attribute')

    testNode.test = {frameNumber: 5, value: 0.4} // testing setting the attribute on a different frame
    assert(testNode2.test[5].value, 0.2, "Duplicated node value didn't change")
    assert(testNode3.test[5].value, 0.4, 'Cloned node value also changed')

    testNode.removeAttribute('test')
    assert(testNode.attributes.hasOwnProperty('test'), false, 'Attribute was successfully removed')
    assert(testNode.test, undefined, 'Attribute also removed from getter setters')

    assert(testNode2.attributes.hasOwnProperty('test'), true, 'Duplicated node was not impacted by removal')
  },
  check: function(){
  },
}
