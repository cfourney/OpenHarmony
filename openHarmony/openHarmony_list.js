//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library v0.01
//
//
//         Developped by Mathieu Chaptel, Chris Fourney...
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

/**
 * The base class for the $.oList.
 * @constructor
 * @classdesc  $.oList Base Class
 * @param   {object[]}                 array                 The array that this $.oList represents.
 * @param   {int}                      startIndex            The index at which this list starts.
 * @param   {int}                      currentIndex          The current index of this list iterator.
 *
 * @property {object[]}                index[int]            The indexed object of the item.
 */
$.oList = function(array, startIndex){
  if(typeof startIndex == 'undefined') var startIndex = 0;
  if(typeof array == 'undefined') var array = [];
  
  for (var i=0; i<array.length; i++){
    this[i+startIndex] = array[i];
  }
}


/**
 * The internal type of $.oList object, should always return list.
 * @name $.oList#_type
 * @private
 * @type {string}
 */
Object.defineProperty($.oList.prototype, '_type', {
    enumerable : false,
    value: 'list'
});


/**
 * The internal type of $.oList object, should always return list.
 * @name $.oList#_type
 * @private
 * @type {string}
 */
Object.defineProperty($.oList.prototype, 'currentIndex', {
    enumerable : false,
    configurable : true,
    value: this.startIndex
});



/**
 * The number of elements in the list
 * @name $.oList#length
 * @type {int}
 */
Object.defineProperty($.oList.prototype, 'length', {
  enumerable : false,
  get: function(){
    var _start = this.startIndex;
    var i = _start;
    while (this.hasOwnProperty(i)){
        i++;
    }
    return i-_start;
  }
});


/**
 * The index of the last valid element of the list
 * @name $.oList#length
 * @type {int}
 */
Object.defineProperty($.oList.prototype, 'lastIndex', {
  enumerable : false,
  get: function(){
    var _start = this.startIndex;
    var i= _start;
    while (this.hasOwnProperty(i)) i++;
    return i-1;
  }
});


/**
 * The index of the first element of the list, as set at the creation of the oList
 * @name $.oList#startIndex
 * @type {int}
 */
Object.defineProperty($.oList.prototype, 'startIndex', {
    enumerable : false,
    get: function(){
        var _start = 0;
        var i = _start;
        while (!this.hasOwnProperty(i)){
            i++;
        }
        return i;
    }
});


// Methods must be declared as unenumerable properties this way
/**
 * Converts the oList to an array
 * @name $.oList#toArray
 * @return  {object[]}   The list represented as an array.
 */
Object.defineProperty($.oList.prototype, 'toArray', {
    enumerable : false,
    value : function(){
        var _array = [];
        for (var i=0; i<this.length; i++){
            _array[i-this.startIndex] = this[i];
        }
        return _array;
    }
});



/**
 * Similar to Array.filter. Provide a filtering function as a parameter that returns a boolean.
 * @name $.oList#filterFunction
 * @param   {function}     func                    A function that is used to filter, returns true if it is to be kept in the list.
 *
 * @return  {object[]}   The list represented as an array, filtered given the function.
 */
Object.defineProperty($.oList.prototype, 'filter', {
  enumerable : false,
  value : function( func ){
    this.$.log("oList.filter is deprecated. Consider using oList.filterByFunction")
    var _results = this.toArray();
    return new this.$.oList( _results.filter(func) );
  }
});


/**
 * Similar to Array.map. Provide a filtering function as a parameter that returns a boolean.
 * @name $.oList#filterFunction
 * @param   {function}     func                    A function that is used to filter, returns true if it is to be kept in the list.
 *
 * @return  {object[]}   The list represented as an array, filtered given the function.
 */
Object.defineProperty($.oList.prototype, 'map', {
    enumerable : false,
    value : function( func ){
        this.$.log("oList.map is deprecated. Consider using oList.filterByProperty")
        var _results = this.toArray();
        return new this.$.oList( _results.map(func) );
    }
});


/**
 * Similar to Array.push. Provide a filtering function as a parameter that returns a boolean.
 * @name $.oList#filterFunction
 * @param   {function}     func                    A function that is used to filter, returns true if it is to be kept in the list.
 *
 * @return  {object[]}   The list represented as an array, filtered given the function.
 */
Object.defineProperty($.oList.prototype, 'push', {
    enumerable : false,
    value : function( newElement ){
      this[this.lastIndex+1] = newElement;
    }
});





/**
 * Returns an oList object containing only the elements that passed the provided filter function.
 * @name $.oList#filterFunction
 * @param   {function}     func                    A function that is used to filter, returns true if it is to be kept in the list.
 *
 * @return  {object[]}   The list represented as an array, filtered given the function.
 */
Object.defineProperty($.oList.prototype, 'filterFunction', {
    enumerable : false,
    value : function( func ){
        var _results = [];
        for (var i in this){
            // TODO: Implement partial match / regex?
            if ( func(this[i]) ){
              _results.push( this[i] );
            }
        }

        return new this.$.oList( _results );
    }
});


/**
 * Returns an oList object containing only the elements that have the same property value as provided.
 * @name $.oList#filterProperty
 * @param   {string}    property                    The property to find.
 * @param   {string}    search                      The value to search for in the property.
 *
 * @return  {object[]}   The list represented as an array, filtered given its properties.
 * @example
 * var doc = $.s // grab the scene object
 * var nodeList = new $.oList(doc.nodes, 1) // get a list of all the nodes, with a first index of 1
 * 
 * $.log(nodeList) // outputs the list of all the node paths
 * 
 * var readNodes = nodeList.filterProperty("type", "READ") // get a new list of only the nodes of type 'READ'
 * 
 * $.log(readNodes.extractProperty("name"))  // prints the names of the result
 *
 */
Object.defineProperty($.oList.prototype, 'filterProperty', {
  enumerable : false,
  value : function(property, search){
    var _results = []
    var _lastIndex = this.lastIndex;
    for (var i=this.startIndex; i < _lastIndex; i++){
      // this.$.log(i+" "+(property in this[i])+" "+(this[i][property] == search)+_lastIndex)
      if ((property in this[i]) && (this[i][property] == search)) _results.push(this[i])
    }
    // this.$.log(_results)
    return new this.$.oList(_results)
  }
});


/**
 * Returns an oList object containing only the values of the specified property.
 * @name $.oList#filterProperty
 * @param   {string}     property                    The property to find.
 *
 * @return  {object[]}   The newly created oList object containing the property values.
 */
Object.defineProperty($.oList.prototype, 'extractProperty', {
  enumerable : false,
  value : function(property){
    var _results = []
    var _lastIndex = this.lastIndex;
    for (var i=this.startIndex; i < _lastIndex; i++){
      _results.push(this[i][property])
    }
    return new this.$.oList(_results)
  }
});


/**
 * The elements of this list, represented by an array again, sorted.
 * @name $.oList#sortByProperty
 * @param   {string}    property                    The property to find.
 * @param   {bool}      ascending                   Whether the sort is ascending/descending.
 *
 * @return  {object[]}   The list represented as an array, sorted given its properties.
 */
Object.defineProperty($.oList.prototype, 'sortByProperty', {
    enumerable : false,
    value : function( property, ascending ){
        if (typeof ascending === 'undefined') var ascending = false;

        var _array = this.toArray();
        if (ascending){
            var results = _array.sort(function (a,b){return b[property] - a[property]});
        }else{
            var results = _array.sort(function (a,b){return a[property] - b[property]});
        }

        // Sort in place or return a copy?
        return new this.$.oList( results, this.startIndex );
    }
});


/**
 * The elements of this list, represented by an array, sorted.
 * @name $.oList#sortByFunction
 * @param   {function}   func                    A function that is used to sort, in form function (a,b){return a - b}.
 *
 * @return  {object[]}   The list represented as an array, sorted given its function.
 */
Object.defineProperty($.oList.prototype, 'sortByFunction', {
    enumerable : false,
    value : function( func ){
        var _array = this.toArray();
        var results = _array.sort( func );

        // Sort in place or return a copy?
        return new this.$.oList( results, this.startIndex );
    }
});


/**
 * The first item in the list, resets the iterator to the first entry.
 * @name $.oList#first
 * @return {object}   The first item in the list.
 */
Object.defineProperty($.oList.prototype, 'first', {
    enumerable : false,
    value: function(){
        this.currentIndex = this.startIndex;
        return this[ this.startIndex ];
    }
});


/**
 * The next item in the list, bool false if reaching the end of the list.
 * @name $.oList#next
 * @type {object}
 * @example
 *         var item = $.oList.first();
 *         while( item ){
 *              item = $.oList.next();    
 *         }
 */
Object.defineProperty($.oList.prototype, 'next', {
    enumerable : false,
    value: function(){
        this.currentIndex++;
        if( !this.hasOwnProperty(this.currentIndex) ) return false;

        return this[ this.currentIndex ];
    }
});


/**
 * outputs the list to a string for easy logging
 * @name $.oList#toString
 * @type {object}
 */
Object.defineProperty($.oList.prototype, 'toString', {
  enumerable : false,
  value: function(){
    return this.toArray().join(",");
  }
});
