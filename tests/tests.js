function assert(variable, value, message){
	if (variable != value) throw new Error(message + " : expected " + value + ", got " + variable + ".");
}

function Test(params){
	assert(typeof (params.message), 'string', '"message" argument must be a string');
	assert(typeof (params.prepare), 'function', '"prepare" argument must be a function');
	assert(typeof (params.run), 'function', '"run" argument must be a function');
	assert(typeof (params.check), 'function', '"check" argument must be a function');

	this.params = params
}

Test.prototype.execute = function(){
	MessageLog.trace(" Test : "+this.params.message);
	try{
		this.params.prepare();
		this.params.run();
		this.params.check();
		MessageLog.trace(" Test : "+this.params.message + " passed successfully");
	}catch(e){
		MessageLog.trace(" Test : "+this.params.message + " failed : "+e)
	}
}


// ----------------------- oScene tests ----------------------//
exports.testSceneLength = new Test({
	message:"oScene.length",
	prepare:function(){
	},
	run:function(){
		$.scn.length = 1;
		assert($.scn.length, 1);
		$.scn.length = 20;
		assert($.scn.length, 20);
	},
	check:function(){
	},
})

