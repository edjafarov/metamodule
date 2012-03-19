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
			if(piece.base){
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
				//parse annotations
				piece.annotations = parseAnnotations(piece.comments);
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



var ANNOT_TOKEN_REG = new RegExp("@(\\w+)");
var ANNOT_VARS_REG = new RegExp("\\((.*)\\)");
var ANNOTATION_REG = new RegExp("@(.+)\\n", "g");

function parseAnnotations(comment){
    var annot;
    for(var i=0; i< comment.length; i++){
        var checkAnnot = comment[i].value.match(ANNOTATION_REG);
        if(checkAnnot){
            checkAnnot.forEach(
                function(annotationString){
                    var annotationToken = ANNOT_TOKEN_REG.exec(annotationString)[1];
                    if(!annot) annot = {};
                    annot[annotationToken] = {};
                    if(ANNOT_VARS_REG.test(annotationString)){
                        var vars = ANNOT_VARS_REG.exec(annotationString)[1];
                        var varsArray = vars.split(",");
                        varsArray.forEach(function(pair, i, pairs) {
                            var res = pair.split("=");
                            if (res[0] && res[1]) {
                                annot[annotationToken][trim(res[0])] = trim(res[1]);
                            }
                        })
                    }
                }
            );
        }

    }
    return annot;
}

//todo: need to cleanup following code - looks ugly
function trim(str) {
    str = str.replace(/^[\s"']+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/[^\s"']/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}
