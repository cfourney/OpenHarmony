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
//         oTimeline class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
/**
 * oTimeline Class
 * @class
 * @property   layers         {[oNode]}                        The nodes in the timeline.
 * @property   layersList     {[string]}                       The path of the nodes in the timeline. 
 */
function oTimeline( display, oSceneObject ){
    this.display = display
    this.composition = ''
    this.scene = oSceneObject;
   
    if (node.type(this.display) == '') {
        this.composition = compositionOrder.buildDefaultCompositionOrder();
    }else{
        this.composition = compositionOrder.buildCompositionOrderForDisplay(display);
    }
   
}
 
// Properties
/**
 * layers
 *
 * Summary: The node layers in the scene, based on the timeline's order given a specific display.
 * @return: { [oNode] } The nodes in the timeline.
 */
Object.defineProperty(oTimeline.prototype, 'layers', {
    get : function(){
        var _timeline = this.layersList;
        var _scene = this.scene;
       
        _timeline = _timeline.map( function(x){return _scene.getNodeByPath(x)} );
       
        return _timeline;
    }
});
 
/**
 * layersList
 *
 * Summary: Gets the paths of the layers in order, given the specific display's timeline.
 * @return: { [string] }  The path of the nodes in the timeline. 
 */
Object.defineProperty(oTimeline.prototype, 'layersList', {
    get : function(){
        var _composition = this.composition;
        var _timeline = [];
       
        for (var i in _composition){
            _timeline.push( _composition[i].node )
        }
       
        return _timeline;
    }
})