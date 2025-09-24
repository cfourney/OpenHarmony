var assert = require("helpers.js").assert

// ----------------------- General tests ----------------------//
exports.testAPIprotecting = {
    message:"api protecting",
    prepare:function(){
    },
    run:function(){
        // testing overwriting of the api in the global scope
        try{
            node = 'test'
        }catch(e){
            assert(e, 'Error: node is a protected object from Harmony API. Cannot overwrite.', 'API is not protected')
        }

        // testing overwriting some values that should be overwritable
        var export_backup = exports;
        exports = 'test2'; // this should not raise the same error
        exports = export_backup;

        // testing overwriting the same variable name in a more restricted scope (allowed)
        function test(){
            var node = "test";
        }
        test() // nothing to assert, this function should not raise the same error
        
    },
    check:function(){
    },
}


