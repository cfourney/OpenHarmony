var assert = require("helpers.js").assert

// ----------------------- oNode tests ----------------------//
exports.testoNodeName = {
  message: "oNode.name",
  prepare: function () {
  },
  run: function () {
    $.scn.root.addNode('READ') // ensure there is at least one node
    $.scn.root.nodes[0].name = 'Test'
    assert($.scn.root.nodes[0].name, 'Test', 'writing and reading node name')
  },
  check: function () {
  },
}


exports.testoNodeSubtyping = {
  message: "oNode subtypes",
  prepare: function () { },
  run: function () {
    var test = $.scn.root;

    assert(test, 'Top', 'oNode initialization and toString() prints the path')
    assert(test.name, 'Top', 'root scene node name is Top, can access object name property')
    assert(test instanceof $.oNode, true, 'object is an oNode')
    assert(test instanceof $.oGroupNode, true, 'object has deep inheritance that include oGroupNode prototype')

    var readNode = test.addNode('READ') // checking we can access methods of oGroupNode

    assert(!!readNode, true, 'read node was successfully created')
    assert(readNode instanceof $.oNode, true, 'created read Node inherited from oNode')
    assert(readNode instanceof $.oGroupNode, false, "created read Node prototype chain doesn't overlap with oGroupNode")
    assert(readNode instanceof $.oDrawingNode, true, "created read Node is a Drawing Node")
  },
  check: function () {
  },
}