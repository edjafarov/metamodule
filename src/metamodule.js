var jsparser = require("uglify-js").parser;
var traverse = require("traverse");
var util = require("util");


module.exports.getMeta = function(src){
	var ast = jsparser.parse(src, false, true);
	var completeMetaInfo = {};
	traverse(ast).forEach(function(node) {
		if(node == "exports"){
			var piece = {
				
			};

			// module.*[exports]* . smth? =
			if(this.parent.node[0] == 'dot'){
				var ref =this.parent;
				// [exports.smth.smthelse] trying to find top one node
				if(ref.parent.node[0] == 'dot'){
					ref = ref.parent;
					piece.exportedName = ref.node[2];
				}
				piece.base = ref;
				piece.comments = ref.node[0].start.comments_before;
				
			}
			// *[exports]* = 
			if(this.parent.node[0] && this.parent.node[0].name == 'name'){
				piece.base = this.parent;
				piece.comments = this.parent.node[0].start.comments_before;

			} else {
				if(this.parent.node[0] && this.parent.node[0] == 'name'){// *[exports.smth]*
			
			// *[exports.smth]*
				piece.base = this.parent.parent;
				piece.exportedName = piece.base.node[2];
				piece.comments = piece.base.node[0].start.comments_before;
			}
		}
						
			// if one of cases
			if(piece.comments){
				// [exports = function] check index of next token
				var nextParentIndex = piece.base.parent.keys[piece.base.parent.keys.indexOf(piece.base.key) + 1];
				// [exports] = *function*
				if(piece.base.parent.node[nextParentIndex]){
					var fcnNode = piece.base.parent.node[nextParentIndex];
					piece.functionAssigned = {
						name : fcnNode[1],
						args: fcnNode[2]
					}
				}
			}
			
			
			if(!piece.exportedName) piece.exportedName = "_root";
			if(piece.base){
				delete piece.base;
				completeMetaInfo[piece.exportedName] = piece;
			}
		};
	});
	return completeMetaInfo;
};

