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
 * oNodeLink Class
 * @class

 * @property   inPort            {int}                       The inport of this link.
 * @property   outPort           {int}                       The outport of this link.
 * @property   outLink           {int}                       The outlink of this link.
 * @property   srcNode           {oNode}                     The srcNode of the link.
 * @property   dstNode           {oNode}                     The dstNode of the link.
 *
*/
function oNodeLink ( srcNode, dstNode, outPort, outLink, inPort ){
    this.srcNode = srcNode;
    this.dstNode = dstNode;
    this._cacheOutPort = outPort;
    this._cacheOutLink = outLink;
    this._cacheInPort = inPort;
}

/**
 * .outPort
 *
 * @return: {int} The outport of this oNodeLink.
 */
Object.defineProperty(oNodeLink.prototype, 'outPort', {
    get : function(){
        // Check against the cache before computing again
        var _port = this._cacheOutPort;
        var _link = this._cacheOutLink;

        if (node.dstNode(this.srcNode.fullPath, _port, _link) != this.dstNode.fullPath){
            // First look amongst direct dstNodes
            var _outNodes = this.srcNode.outNodes;

            for (var i in _outNodes){
                for (var j in _outNodes[i]){
                    if(_outNodes[i][j].fullPath == this.dstNode.fullPath) {
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
})

// NEW
// string inPort

Object.defineProperty(oNodeLink.prototype, 'inPort', {
    get : function(){
      throw "Not yet implemented.";
    },
    set : function( val ){
      throw "Not yet implemented.";
    }
})

 
// oNodeLink Class methods