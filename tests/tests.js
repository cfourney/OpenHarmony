function assert(variable, value, message){
	if (variable != value) throw new Error("Error during " + message + " : expected " + value + ", got " + variable + ".");
}

function Test(params){
	assert(typeof (params.message), 'string', '"message" argument must be a string');
	assert(typeof (params.prepare), 'function', '"prepare" argument must be a function');
	assert(typeof (params.run), 'function', '"run" argument must be a function');
	assert(typeof (params.check), 'function', '"check" argument must be a function');

	this.params = params
}

var errors = [];

Test.prototype.execute = function(){
	MessageLog.trace(" Test : "+this.params.message);
	try{
		this.params.prepare();
		this.params.run();
		this.params.check();
		MessageLog.trace(" Test : "+this.params.message + " passed successfully");
	}catch(e){
		MessageLog.trace(" Test : "+this.params.message + " failed : "+e)
		errors.push(" Test : "+this.params.message + " failed : "+e)
	}
}

exports.reportErrors = function(){
	if (errors.length != 0){
		MessageLog.trace("========== Following errors occured: =========")
		errors.forEach(function(x){
			MessageLog.trace(x)
		})
	} else {
		MessageLog.trace("========== All tests passed successfully =========")
	}
}

var tests = {}
// ----------------------- oScene tests ----------------------//
tests.testSceneLength = new Test({
	message:"oScene.length",
	prepare:function(){
	},
	run:function(){
		$.scn.length = 1;
		assert($.scn.length, 1, "setting scene length to 1");
		$.scn.length = 20;
		assert($.scn.length, 20, "setting scene length to 20");
	},
	check:function(){
	},
})


tests.testSceneRoot = new Test({
	message:"oScene.root",
	prepare:function(){
	},
	run:function(){
		assert($.scn.root, 'Top', "checking access to scene root group");
		assert($.scene.root instanceof $.oGroupNode, true, "root group is oGroupNode");
	},
	check:function(){
	},
})


tests.testSceneNodes = new Test({
	message:"oScene.nodes",
	prepare:function(){
		$.scn.nodes.forEach(function(x){
			return x.remove()
		})
		assert($.scene.nodes.length, 0, "removed all nodes");
	},
	run:function(){
		assert($.scene.nodes.length, 0, "getting nodes list (empty)");
		$.scn.root.addNode('READ');
		$.scn.root.addNode('READ');
		$.scn.root.addNode('READ');
		$.scn.root.addNode('READ');
		assert($.scene.nodes.length, 4, "Added 4 nodes to the scene root group");
	},
	check:function(){
		$.scn.nodes.forEach(function(x){
			return x.remove()
		})
		assert($.scene.nodes.length, 0, "cleanup: removed all nodes");
	},
})


// ----------------------- oNode tests ----------------------//
tests.testoNodeName = new Test({
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
})


exports.tests = tests;