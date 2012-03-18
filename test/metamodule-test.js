var vows = require('vows'),
    assert = require('assert'),
    metamodule = require("../src/metamodule.js"),
    fs = require("fs");

// Create a Test Suite
vows.describe('metamodule test').addBatch({
	'metamodule getMeta': {
        topic: metamodule.getMeta(fs.readFileSync("./test-mocks/exports-mock.js").toString()),
        'returns meta as Object': function(metaInfo) {
        	assert.isObject(metaInfo);
        },
        'returns _root item for module.exports': function(metaInfo){
        	assert.isObject(metaInfo._root); //is object
        	assert.isArray(metaInfo._root.comments); //have comments
        	assert.equal(metaInfo._root.functionAssigned.name, "moduleFunction"); //have functionName
        	assert.deepEqual(metaInfo._root.functionAssigned.args, ['arg1', 'arg2']); //arg names resolved
        },
        'returns moduleExportsFunction item for module.exports': function(metaInfo){
        	assert.isObject(metaInfo.moduleExportsFunction); //is object
        	assert.isArray(metaInfo.moduleExportsFunction.comments); //have comments
        	assert.equal(metaInfo.moduleExportsFunction.functionAssigned.name, "moduleExportsFunction"); //have functionName
        	assert.deepEqual(metaInfo.moduleExportsFunction.functionAssigned.args, ['arg11', 'arg12']); //arg names resolved
        },
           'returns exportsFunction item for exports': function(metaInfo){
        	assert.isObject(metaInfo.exportsFunction); //is object
        	assert.isArray(metaInfo.exportsFunction.comments); //have comments
        	assert.equal(metaInfo.exportsFunction.functionAssigned.name, "exportsFunction"); //have functionName
        	assert.deepEqual(metaInfo.exportsFunction.functionAssigned.args, ['arg21', 'arg22']); //arg names resolved
        }
    }

}).export(module);
