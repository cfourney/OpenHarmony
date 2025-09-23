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