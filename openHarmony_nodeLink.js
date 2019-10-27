//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, ...
//
//
//   This library is an open source implementation of a Document Object Model
//   for Toonboom Harmony. It also implements patterns similar to JQuery
//   for traversing this DOM.
//
//   Its intended purpose is to simplify and streamline toonboom scripting to
//   empower users and be easy on newcomers, with default parameters values,
//   and by hiding the heavy lifting required by the official API.
//
//   This library is provided as is and is a work in progress. As such, not every
//   function has been implemented or is garanteed to work. Feel free to contribute
//   improvements to its official github. If you do make sure you follow the provided
//   template and naming conventions and document your new methods properly.
//
//   This library doesn't overwrite any of the objects and classes of the official
//   Toonboom API which must remains available.
//
//   This library is made available under the MIT license.
//   https://opensource.org/licenses/mit
//
//   The repository for this library is available at the address:
//   https://github.com/cfourney/OpenHarmony/
//
//
//   For any requests feel free to contact m.chaptel@gmail.com
//
//
//
//
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         oNodeLink class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 

/**
 * The base class for the oTimeline.
 * @constructor
 * @classdesc  oTimeline Base Class
 * @param   {oNode}                   outNode                   The source oNode of the link.
 * @param   {oNode}                   inNode                    The destination oNode of the link.
 * @param   {int}                     outPort                   The outport of the outNode that is connecting this link.
 * @param   {int}                     outLink                   The outlink of the outport on the outNode that is connecting this link.
 * @param   {int}                     inPort                    The inport of the inNode that is connecting the link.
 *                                                          
 * @property   {oNode}                   outNode                The source oNode of the link.
 * @property   {oNode}                   inNode                 The destination oNode of the link.
 * @property   {int}                     _cacheOutPort          The outport of the outNode that is connecting this link.
 * @property   {int}                     _cacheOutLink          The outlink of the outport on the outNode that is connecting this link.
 * @property   {int}                     _cacheInPort           The inport of the inNode that is connecting the link.
 */
function oNodeLink ( outNode, inNode, outPort, outLink, inPort ){
    this.outNode = outNode;
    this.inNode = inNode;
    this._cacheOutPort = outPort;
    this._cacheOutLink = outLink;
    this._cacheInPort = inPort;
}


/**
 * The outport of this oNodeLink.
 * @name oNodeLink#outPort
 * @type {oNode[]}
 */
Object.defineProperty(oNodeLink.prototype, 'outPort', {
    get : function(){
        // Check against the cache before computing again
        var _port = this._cacheOutPort;
        var _link = this._cacheOutLink;

        if (node.inNode(this.outNode.fullPath, _port, _link) != this.inNode.fullPath){
            // First look amongst direct inNodes
            var _outNodes = this.outNode.outNodes;

            for (var i in _outNodes){
                for (var j in _outNodes[i]){
                    if(_outNodes[i][j].fullPath == this.inNode.fullPath) {
                        _port = this._cacheOutPort = i;
                        _link = this._cacheOutLink = j;
                        return {port: _port, link: _link}
                    }
                }
            }

            // if not found check in groups amongst outNodes


        }

        return {port: _port, link: _link}
    },
    set : function( val ){
      throw "Not yet implemented.";
    }
});



/**
 * Not yet implemented.
 * @name oNodeLink#inPort
 * @type {oNode[]}
 */
Object.defineProperty(oNodeLink.prototype, 'inPort', {
    get : function(){
      throw "Not yet implemented.";
    },
    set : function( val ){
      throw "Not yet implemented.";
    }
});

 
// oNodeLink Class methods