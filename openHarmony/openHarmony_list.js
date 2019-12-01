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
    
    this._type = "list";
    
    this.currentIndex = 0;
    
    for (var i in array){
        if (i>=startIndex){
            this[i] = array[i];
        }
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
    get: function(){
        return 'list';
    }
});


/**
 * The length of the array that this represents.
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
 * The start index of the array that this represents.
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
 * The elements of this list, represented by an array again.
 * @name $.oList#toArray
 * @return  {object[]}   The list represented as an array.
 */
Object.defineProperty($.oList.prototype, 'toArray', {
    enumerable : false,
    value : function(){
        var _array = [];
        for (var i in this){
            array[i-this.startIndex] = this[i];
        }
        return Array;
    }
});


/**
 * The elements of this list, represented by an array again, filtered.
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
 * The elements of this list, represented by an array again, filtered.
 * @name $.oList#filterProperty
 * @param   {string}    property                    The property to find.
 * @param   {string}    search                      The value to search for in the property.
 *
 * @return  {object[]}   The list represented as an array, filtered given its properties.
 */
Object.defineProperty($.oList.prototype, 'filterProperty', {
    enumerable : false,
    value : function(property, search){
        var _results = [];
        for (var i in this){
            // TODO: Implement partial match / regex?
            if (this[i].hasOwnProperty(property) && this[i][property] == search) _results.push(this[i]);
        }

        return new this.$.oList( _results );
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
    value: function(){
        enumerable : false,
        this.currentIndex++;
        if( !this.hasOwnProperty(this.currentIndex) ){
            return false;
        }

        return this[ this.currentIndex ];
    }
});
