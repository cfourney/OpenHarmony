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
//        oAttribute class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////
 
 
/**
 * oAttribute Class
 * @class

 * @property   type           {string}                       The attribute type.
 * @property   column         {oColumn}                      The attached column.
 * @property   frames         {[oFrame]}                     The frames in the attribute.
 * @property   keyFrames      {[oFrame]}                     The keyframes in the attribute. 
 * @property   useSeparate    {bool}                         Not yet implemented.
 *
 * @function   {[oFrame]}     getKeyFrames( )                Provides the keyframes of the attribute.
 
 * @function   {void}         setValue( value, frame )       Sets the value of the attribute at the given frame.
 
 * @function   {...}          getValue( frame )              Gets the value of the attribute at the given frame.
 * @function   {...}          value( frame )                 Gets the value of the attribute at the given frame.
*/
function oAttribute( dom, oNodeObject, attributeObject, parentAttribute ){
  this._type = "attribute";
  this.$     = dom;

  this.oNodeObject = oNodeObject;
  this.attributeObject = attributeObject;
  this.keyword = attributeObject.fullKeyword()
  this.shortKeyword = attributeObject.keyword()
  this.parentAttribute = parentAttribute; // only for subAttributes

  var _subAttributes = [];
  
  if (attributeObject.hasSubAttributes()){
      var _subAttributesList = attributeObject.getSubAttributes();
      
      for (var i in _subAttributesList){
          var _keyword = _subAttributesList[i].keyword().toLowerCase();
          // hard coding a fix for 3DPath attribute name which starts with a numberOf
          if (_keyword == "3dpath") _keyword = "path3d"
          
          var _subAttribute = new oAttribute( this.$, this.oNodeObject, _subAttributesList[i], this );
                      
          // creating a property on the attribute object with the subattribute name to access it
          this[_keyword] = _subAttribute
          _subAttributes.push(_subAttribute)
      }
  }

  // subAttributes is made available as an array for more formal access
  this.subAttributes = _subAttributes;
}
 
// oAttribute Object Properties
 
/**
 * .type
 * @return: {string}   The type of the attribute.
 */
Object.defineProperty(oAttribute.prototype, 'type', {
    get : function(){
        return this.attributeObject.typeName();
    }
})
 
 
/**
 * .column
 * @return: {oColumn}   Provides the column attached to the attribute.
 */
Object.defineProperty(oAttribute.prototype, 'column', {
    get : function(){
        var _column = node.linkedColumn (this.oNodeObject.fullPath, this.keyword)
        return (_column!="")?new oColumn( this.$, _column, this ):null
    },
 
    set : function(columnObject){
        // unlink if provided with null value or empty string
        if (columnObject == "" || columnObject == null){
            node.unLinkAttr(this.oNodeObject.fullPath, this.keyword)
        }else{
            node.linkAttr(this.oNodeObject.fullPath, this.keyword, columnObject.uniqueName)
        }
    }
})
 
 
/**
 * .frames
 * @return: {[oFrame]}   Returns the oFrame of attached to the column.
 */
Object.defineProperty(oAttribute.prototype, 'frames', {
    get : function(){
         var _column = this.column
         if (_column != null){
            return _column.frames;
         }else{
            return [];
         }
    },
    
    set : function(){
      throw "Not implemented."
    }
});


/**
 * .keyframes
 * @return: {[oFrame]}   Returns the filtered keyframes of the attached to the column.
 */
Object.defineProperty(oAttribute.prototype, 'keyframes', {
    get : function(){
      var _frames = this.frames;
      _frames = _frames.filter(function(x){return x.isKeyFrame});
      return _frames;
    },
    
    set : function(){
      throw "Not implemented."
    }
});


/**
 * .useSeparate
 * @return: {[oFrame]}   Returns the oFrame of attached to the column.
 */
//CF Note: Not sure if this should be a general attribute, or a subattribute.
Object.defineProperty(oAttribute.prototype, "useSeparate", {
    get : function(){
       
    },
   
    set : function( _value ){
        // TODO: when swapping from one to the other, copy key values and link new columns if missing
    }
})

 
// oAttribute Class methods

/**
 * getKeyFrames
 *
 * Summary: Provides the keyframes of the attribute.
 *  
 * @return: { [oFrame] }   The filtered keyframes.
 */
oAttribute.prototype.getKeyFrames = function(){
    var _frames = this.frames;
    _frames = _frames.filter(function(x){return x.isKeyFrame});
    return _frames;
}
 

/**
 * setValue
 *
 * Summary: Sets the value of the attribute at the given frame.
 * @param   {string}     value                 The value to set on the attribute.
 * @param   {int}        frame                 The frame at which to set the value, if not set, assumes 1
 *  
 * @return: { void } No return
 */
oAttribute.prototype.setValue = function ( value, frame ){
    if (typeof frame === 'undefined') var frame = 1;
    //MessageLog.trace('setting frame :'+frame+' to value: '+value+' of attribute: '+this.keyword)
 
    var _attr = this.attributeObject;
    var _type = this.type;
 
    if (frame != 1 && this.column == null){
        // generate a new column to be able to animate
        var _doc = new oScene();
        var _column = _doc.addColumn()
        this.column = _column;
    }
    
    // TODO deal with subattributes ? for ex pass a oPoint object to an attribute with x, y, z properties?
    switch (_type){
        // TODO: sanitize input
        case "GENERIC_ENUM" :
            node.setTextAttr(this.oNodeObject.fullPath, this.keyword, frame, value)
            break;
            
        case "PATH_3D" :
            // TODO include velocity
            _attr.attributeObject.setValueAt(value, frame)
            break;
            
        case "ELEMENT" :
            column.setEntry(this.column.uniqueName, 1, frame, value)
            break;
            
        default : 
            _attr.setValueAt(value, frame);
    }
}
 

//CFNote: Is it worth having a getValueType?
/**
 * getValue
 *
 * Summary: Gets the value of the attribute at the given frame.
 * @param   {int}        frame                 The frame at which to set the value, if not set, assumes 1
 *  
 * @return: { ... }      The value of the attribute in the native format of that attribute (contextual to the attribute).
 */
oAttribute.prototype.getValue = function(frame){
    if (typeof frame === 'undefined') var frame = 1;
 
    var _attr = this.attributeObject;
    var _type = this.type;
    var _value;
           
    //MessageLog.trace("getting "+this.keyword+" "+_type+" "+frame)
    switch (_type){
        case 'BOOL':
            _value = _attr.boolValueAt(frame)
            break;
           
        case 'INT':
            _value = _attr.intValueAt(frame)
            break;
           
        case 'DOUBLE':
        case 'DOUBLEVB':
            _value = _attr.doubleValueAt(frame)
            break;
           
        case 'STRING':
            _value = _attr.textValueAt(frame)
            break;
           
        case 'COLOR':
            _value = _attr.colorValueAt(frame)
            break;

        case 'POSITION_2D':
            _value = _attr.pos2dValueAt(frame)
            break;
           
        case 'POSITION_3D':
            _value = _attr.pos3dValueAt(frame)
            break;
            
        case 'PATH_3D':
            _attr = this.parentAttribute.attributeObject
            _value = _attr.pos3dValueAt(frame)
            // get the velocity in any other way than getting the subcolumn?
            //_value = new oPoint (_value.x, _value.y, _value.z)
            break;
            
        case 'ELEMENT':
            // an element always has a column, so we'll fetch it from there
            _value = column.getEntry(this.column.uniqueName, 1, frame)
            //MessageLog.trace(_value)
            break;
        
        // TODO: How does QUATERNION_PATH work? subcolumns I imagine
        // TODO: How to get types SCALE_3D, ROTATION_3D, DRAWING, GENERIC_ENUM? -> maybe we don't need to, they don't have intrinsic values
           
        default:
            // enums, etc
            _value = _attr.textValueAt(frame)
    }
       
    return _value;
}

/**
 * value
 *
 * Summary: Gets the value of the attribute at the given frame.
 * @param   {int}        frame                 The frame at which to set the value, if not set, assumes 1
 *  
 * @return: { ... }      The value of the attribute in the native format of that attribute (contextual to the attribute).
 */
oAttribute.prototype.value = function(frame){
  return this.getValue( frame );
}