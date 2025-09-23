var assert = require("./assert.js")

// ----------------------- oScene tests ----------------------//
exports.testSceneLength = {
  message: "oScene.length",
  prepare: function () {
  },
  run: function () {
    $.scn.length = 1;
    assert($.scn.length, 1, "setting scene length to 1");
    $.scn.length = 20;
    assert($.scn.length, 20, "setting scene length to 20");
  },
  check: function () {
  },
}


exports.testSceneRoot = {
  message: "oScene.root",
  prepare: function () {
  },
  run: function () {
    assert($.scn.root, 'Top', "checking access to scene root group");
    assert($.scene.root instanceof $.oGroupNode, true, "root group is oGroupNode");
  },
  check: function () {
  },
}


exports.testSceneNodes = {
  message: "oScene.nodes",
  prepare: function () {
    $.scn.nodes.forEach(function (x) {
      return x.remove()
    })
    assert($.scene.nodes.length, 0, "removed all nodes");
  },
  run: function () {
    assert($.scene.nodes.length, 0, "getting nodes list (empty)");
    $.scn.root.addNode('READ');
    $.scn.root.addNode('READ');
    $.scn.root.addNode('READ');
    $.scn.root.addNode('READ');
    assert($.scene.nodes.length, 4, "Added 4 nodes to the scene root group");
  },
  check: function () {
    $.scn.nodes.forEach(function (x) {
      return x.remove()
    })
    assert($.scene.nodes.length, 0, "cleanup: removed all nodes");
  },
}
