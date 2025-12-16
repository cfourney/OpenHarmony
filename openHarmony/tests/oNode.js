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

// ----------------------- oNode Lazy Loading Tests ----------------------//

/**
 * Test that attribute placeholders are initialized at library load time
 */
exports.testoNodePlaceholdersInitialized = {
    message: "oNode attribute placeholders initialized at load time",
    prepare: function(){
    },
    run: function(){
        // Placeholders should already be initialized when library loaded
        // (before any node is created)
        assert($.oNode._placeholdersInitialized === true, true,
            'placeholders should be initialized at library load time');
    },
    check: function(){
    },
}

/**
 * Test that attributes cache is not loaded during node construction
 */
exports.testoNodeLazyLoadingNotLoadedOnConstruction = {
    message: "oNode attributes cache not loaded on construction",
    prepare: function(){
    },
    run: function(){
        // Create node and check immediately - don't set name as that triggers refreshAttributes()
        var testNode = $.scn.root.addNode('READ');
        
        // Verify _attributes_cached is null before first access
        assert(testNode._attributes_cached === null, true, 
            'attributes cache should be null on construction');
        assert(testNode._attributeGettersCreated === false, true,
            'full attribute getters should not be created on construction');
    },
    check: function(){
    },
}

/**
 * Test that attributes are loaded on first access
 */
exports.testoNodeLazyLoadingLoadsOnFirstAccess = {
    message: "oNode attributes load on first access",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('READ');
        
        // Verify cache is null before access
        assert(testNode._attributes_cached === null, true,
            'cache should be null before first access');
        
        // Access attributes property - this should trigger lazy loading
        var attrs = testNode.attributes;
        
        // Verify cache is now populated
        assert(testNode._attributes_cached !== null, true,
            'cache should be populated after first access');
        assert(typeof testNode._attributes_cached === 'object', true,
            'cache should be an object');
        assert(testNode._attributeGettersCreated === true, true,
            'attribute getters should be created after first access');
    },
    check: function(){
    },
}

/**
 * Test that multiple accesses don't rebuild cache unnecessarily
 */
exports.testoNodeLazyLoadingCacheReuse = {
    message: "oNode cache is reused on multiple accesses",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('READ');
        
        // First access - should build cache
        var attrs1 = testNode.attributes;
        var cache1 = testNode._attributes_cached;
        var cacheTime1 = testNode._cacheTime;
        
        // Small delay to ensure different timestamp if cache was rebuilt
        var _dummy = 0;
        for (var i = 0; i < 1000; i++) { _dummy += i; }
        
        // Second access - should reuse cache
        var attrs2 = testNode.attributes;
        var cache2 = testNode._attributes_cached;
        var cacheTime2 = testNode._cacheTime;
        
        // Verify same cache object is reused
        assert(cache1 === cache2, true,
            'cache object should be reused on multiple accesses');
        assert(cacheTime1 === cacheTime2, true,
            'cache time should not change on subsequent accesses');
        assert(testNode._attributeGettersCreated === true, true,
            'getters should remain created');
    },
    check: function(){
    },
}

/**
 * Test refreshAttributes clears and rebuilds cache
 */
exports.testoNodeLazyLoadingRefreshAttributes = {
    message: "oNode refreshAttributes clears and rebuilds cache",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('READ');
        
        // First access - build cache
        var attrs1 = testNode.attributes;
        var cache1 = testNode._attributes_cached;
        
        // Verify cache is built
        assert(cache1 !== null, true, 'cache should be built');
        assert(testNode._attributeGettersCreated === true, true,
            'getters should be created');
        
        // Small delay to ensure different timestamp
        var _dummy = 0;
        for (var i = 0; i < 1000; i++) { _dummy += i; }
        
        // Refresh attributes - should clear and rebuild
        testNode.refreshAttributes();
        
        // Verify cache was cleared and rebuilt
        var cache2 = testNode._attributes_cached;
        
        assert(cache2 !== null, true, 'cache should be rebuilt after refresh');
        assert(cache2 !== cache1, true,
            'cache should be a new object after refresh');
    },
    check: function(){
    },
}

/**
 * Test lazy loading with multiple nodes
 */
exports.testoNodeLazyLoadingMultipleNodes = {
    message: "oNode lazy loading works with multiple nodes",
    prepare: function(){
    },
    run: function(){
        // Create multiple nodes without accessing attributes
        var nodes = [];
        for (var i = 0; i < 5; i++) {
            var n = $.scn.root.addNode('READ');
            nodes.push(n);
            
            // Verify attributes not loaded (don't set name as that triggers refreshAttributes)
            assert(n._attributes_cached === null, true,
                'attributes should not be loaded on construction');
        }
        
        // Now access attributes on each node
        for (var j = 0; j < nodes.length; j++) {
            var attrs = nodes[j].attributes;
            assert(nodes[j]._attributes_cached !== null, true,
                'attributes should be loaded after access');
        }
    },
    check: function(){
    },
}

// ----------------------- Shorthand Attribute Getter/Setter Tests ----------------------//
// These tests verify that shorthand attribute access like node.position.x = 5
// works correctly with lazy loading.
//
// Dynamic placeholder getters are created for ALL attributes at first node creation,
// so shorthand access works immediately for any attribute.

/**
 * Test shorthand attribute triggers lazy loading automatically
 * Verifies: node.position works immediately on PEG nodes and triggers lazy loading
 */
exports.testoNodeShorthandTriggersLazyLoading = {
    message: "oNode shorthand triggers lazy loading automatically",
    prepare: function(){
    },
    run: function(){
        var testNode = $.scn.root.addNode('PEG');
        
        // Verify cache not loaded yet
        assert(testNode._attributes_cached === null, true,
            'cache should be null before shorthand access');
        
        // Access attribute using shorthand - triggers lazy loading automatically
        var position = testNode.position;
        
        // Verify lazy loading was triggered
        assert(testNode._attributes_cached !== null, true,
            'cache should be populated after shorthand access');
        assert(testNode._attributeGettersCreated === true, true,
            'getters should be created after shorthand access');
        
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
        
        // Verify cache not loaded yet
        assert(testNode._attributes_cached === null, true,
            'cache should be null before shorthand access');
        
        // Set value using shorthand immediately - no .attributes access first!
        testNode.position.x = 100;
        
        // Verify lazy loading was triggered
        assert(testNode._attributes_cached !== null, true,
            'cache should be populated after shorthand setter');
        
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
        
        // Set a value using shorthand (triggers lazy loading)
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
        
        // Set initial value using shorthand (triggers lazy loading)
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
        
        // Verify cache not loaded yet
        assert(testNode._attributes_cached === null, true,
            'cache should be null before access');
        
        // Access drawing attribute (common on READ nodes)
        var drawing = testNode.drawing;
        
        // Verify lazy loading was triggered
        assert(testNode._attributes_cached !== null, true,
            'cache should be populated after shorthand access');
        
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
        // just verify no error occurred and lazy loading was triggered
        assert(compNode._attributes_cached !== null, true,
            'lazy loading should be triggered on COMPOSITE node');
    },
    check: function(){
    },
}
