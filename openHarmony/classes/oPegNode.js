//////////////////////////////////////
//                                  //
//                                  //
//          $.oPegNode class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

var oNode = require("./oNode.js");

/**
 * Constructor for the $.oPegNode class
 * @classdesc
 * $.oPegNode is a subclass of $.oNode and implements the same methods and properties as $.oNode. <br>
 * It represents peg nodes in the scene.
 * @constructor
 * @augments   $.oNode
 * @classdesc  Peg Moudle Class
 * @param   {string}         path                          Path to the node in the network.
 * @param   {oScene}         oSceneObject                  Access to the oScene object of the DOM.
 */
oPegNode = function( path, oSceneObject ) {
    if (node.type(path) != 'PEG') throw "'path' parameter must point to a 'PEG' type node";
    var instance = this.$.oNode.call( this, path, oSceneObject );
    if (instance) return instance;

    this._type = 'pegNode';
}
oPegNode.prototype = Object.create( oNode.prototype );
oPegNode.prototype.constructor = oPegNode;

exports = oPegNode;