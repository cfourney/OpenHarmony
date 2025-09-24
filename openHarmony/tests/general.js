var assert = require("helpers.js").assert

// ----------------------- oNode tests ----------------------//
exports.testAPIprotecting = {
    message:"api protecting",
    prepare:function(){
    },
    run:function(){
        var export_backup = exports

        try{
            node = 'test'
            exports = 'test2'
        }catch(e){
            assert(e, 'Error: node is a protected object from Harmony API. Cannot overwrite.', 'API is not protected')
        }

        exports = export_backup
        function test(){
            var node = "test";
        }
        test() // nothing to assert, this function should not raise the same error
        
    },
    check:function(){
    },
}


