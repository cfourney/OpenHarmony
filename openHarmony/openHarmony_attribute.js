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


//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oAttribute class        //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////

/**
 * The base class for the $.oAttribute.
 * @constructor
 * @classdesc  $.oAttribute Base Class
 * @param   {$.oNode}                  oNodeObject                The oNodeObject that the attribute is associated to.
 * @param   {attr}                     attributeObject            The internal harmony Attribute Object.
 * @param   {$.oAttribute}             parentAttribute            The parent attribute of the subattribute.
 *
 * @property {$.oNode}                 node                       The name of the drawing.
 * @property {attr}                    attributeObject            The element object associated to the element.
 * @property {string}                  keyword                    The name of the drawing.
 * @property {string}                  shortKeyword               The element object associated to the element.
 * @property {$.oAttribute}            parentAttribute            The element object associated to the element.
 * @property {$.oAttribute[]}          subAttributes              The subattributes, if any exist, of this attribute.
 */
$.oAttribute = function( oNodeObject, attributeObject, parentAttribute ){
  this._type = "attribute";

  this.node = oNodeObject;
  this.attributeObject = attributeObject;
  
  this._shortKeyword = attributeObject.keyword();
  
  if( attributeObject.fullKeyword ){
    this._keyword = attributeObject.fullKeyword();
  }else{
    this._keyword = (parentAttribute?(parentAttribute._keyword+"."):"") + this._shortKeyword;
  }
  
  this.parentAttribute = parentAttribute; // only for subAttributes

  // recursively add all subattributes as properties on the object  
  this.createSubAttributes(attributeObject);
}


/**
 * Private function to create subAttributes in an oAttribute object at initialisation.
 * @private 
 * @return  {void}   Nothing returned.
 */
$.oAttribute.prototype.createSubAttributes = function (attributeObject){
  var _subAttributes = [];
  
  // if harmony version supports getSubAttributes
  if (attributeObject.getSubAttributes){
    var _subAttributesList = attributeObject.getSubAttributes();
  }else{
    var _subAttributesList = this.getSubAttributes_oldVersion();
  }
  
  for (var i in _subAttributesList){ 
    var _subAttribute = new this.$.oAttribute( this.node, _subAttributesList[i], this );
    var _keyword = _subAttribute.shortKeyword;     
    
    // creating a property on the attribute object with the subattribute name to access it
    this[_keyword] = _subAttribute;
    _subAttributes.push(_subAttribute)
  }

  // subAttributes is made available as an array for more formal access
  this.subAttributes = _subAttributes;
}

 
/**
 * Private function to add utility to subattributes on older versions of Harmony.
 * @private 
 * @return  {void}   Nothing returned.
 */
$.oAttribute.prototype.getSubAttributes_oldVersion = function (){
  var sub_attrs = [];
  
  switch( this.type ){
      case "POSITION_3D" :
        //hard coded subAttr handler for POSITION_3D in older versions of Harmony.
        sub_attrs = [ 'SEPARATE', 'X', 'Y', 'Z'];
        break
      case "ROTATION_3D" :
        sub_attrs = [ 'SEPARATE', 'ANGLEX', 'ANGLEY', 'ANGLEZ', "QUATERNIONPATH" ];
        break
      case "SCALE_3D" :
        sub_attrs = [ 'SEPARATE', 'IN_FIELDS', 'XY', 'X', 'Y', 'Z' ];
        break
      case "DRAWING" :
        sub_attrs = [ 'ELEMENT', 'ELEMENT_MODE', 'CUSTOM_NAME'];
        break
      case "ELEMENT" :
        sub_attrs = [ 'LAYER' ]
        break
      case "CUSTOM_NAME" :
        sub_attrs = [ 'NAME', 'TIMING', 'EXTENSION', 'FIELD_CHART' ]
      default:
        break
  }

  var _node = this.node.path;
  var _keyword = this._keyword;  

  sub_attrs = sub_attrs.map(function(x){return node.getAttr( _node, 1, _keyword+"."+x )})
  
  return sub_attrs;
}
 
/**
 * The full keyword of the attribute.
 * @name $.oAttribute#keyword
 * @type {string}
 */
Object.defineProperty($.oAttribute.prototype, 'keyword', {
    get : function(){
        // formatting the keyword for our purposes
        // hard coding a fix for 3DPath attribute name which starts with a number
        var _keyword = this._keyword.toLowerCase();
        if (_keyword == "3dpath") _keyword = "path3d";
        return _keyword;
    }
});


/**
 * The short keyword of the attribute.
 * @name $.oAttribute#shortKeyword
 * @type {string}
 */
Object.defineProperty($.oAttribute.prototype, 'shortKeyword', {
    get : function(){
        // formatting the keyword for our purposes
        // hard coding a fix for 3DPath attribute name which starts with a number
        var _keyword = this._shortKeyword.toLowerCase();
        if (_keyword == "3dpath") _keyword = "path3d";
        return _keyword;
    }
});


/**
 * The type of the attribute.
 * @name $.oAttribute#type
 * @type {string}
 */
Object.defineProperty($.oAttribute.prototype, 'type', {
    get : function(){
        return this.attributeObject.typeName();
    }
});
 
/**
 * The column attached to the attribute.
 * @name $.oAttribute#column
 * @type {$.oColumn}
 */
Object.defineProperty($.oAttribute.prototype, 'column', {
    get : function(){
        var _column = node.linkedColumn ( this.node.path, this._keyword ); 
        if( _column && _column.length ){
          return this.node.scene.$column( _column, this );
        }else{
          return null;
        }
    },
 
    set : function(columnObject){
        // unlink if provided with null value or empty string
        if (columnObject == "" || columnObject == null){
            node.unlinkAttr(this.node.path, this._keyword);
        }else{
            node.linkAttr(this.node.path, this._keyword, columnObject.uniqueName);
            // TODO: transfer current value of attribute to a first key on the column
        }
    }
});
 
 
 /**
 * The oFrames of attached to the column..
 * @name $.oAttribute#frames
 * @type {$.oFrame[]}
 */
Object.defineProperty($.oAttribute.prototype, 'frames', {
    get : function(){
         var _column = this.column
         if (_column != null){
            return _column.frames;
         }else{
          //Need a method to get frames of non-column values. Local Values.
            return [ new this.$.oFrame( 1, this, false ) ];
         }
    },
    
    set : function(){
      throw "Not implemented."
    }
});


/**
 * Returns the filtered keyframes of the attached to the column.
 * @name $.oAttribute#keyframes
 * @type {$.oFrame[]}
 */
Object.defineProperty($.oAttribute.prototype, 'keyframes', {
    get : function(){
      var col     = this.column;
      var frames  = this.frames;

      if( !col ){
        return frames[1];
      }
    
      return this.column.keyframes;
    },
    
    set : function(){
      throw "Not implemented."
    }
});

/**
 * WIP.
 * @name $.oAttribute#useSeparate
 * @type {bool}
 */
//CF Note: Not sure if this should be a general attribute, or a subattribute.
Object.defineProperty($.oAttribute.prototype, "useSeparate", {
    get : function(){
        // TODO
        throw new Error("not yet implemented");
    },
   
    set : function( _value ){
        // TODO: when swapping from one to the other, copy key values and link new columns if missing
        throw new Error("not yet implemented");
    }
});


/**
 * WIP.
 * @name $.oAttribute#defaultValue
 * @type {bool}
 */
Object.defineProperty($.oAttribute.prototype, "defaultValue", {
    get : function(){
        // TODO: we could use this to reset bones/deformers to their rest states
        var _keyword = this._keyword;
       
        switch (_keyword){
            case "OFFSET.X" :
            case "OFFSET.Y" :
            case "OFFSET.Z" :
           
            case "POSITION.X" :
            case "POSITION.Y" :
            case "POSITION.Z" :
           
            case "PIVOT.X":
            case "PIVOT.Y":
            case "PIVOT.Z":
           
            case "ROTATION.ANGLEX":
            case "ROTATION.ANGLEY":
            case "ROTATION.ANGLEZ":
           
            case "ANGLE":
            case "SKEW":
           
            case "SPLINE_OFFSET.X":
            case "SPLINE_OFFSET.Y":
            case "SPLINE_OFFSET.Z":
           
                return 0;
               
            case "SCALE.X" :
            case "SCALE.Y" :
            case "SCALE.Z" :
                return 1;
               
            case "OPACITY" :
                return 100;
                
            case "COLOR" :
                return new this.$.oColorValue();
               
            case "OFFSET.3DPATH":
                // pseudo oPathPoint
                // CFNote: is this supposed to be an object?
                return "{x:0, y:0, z:0}";
               
            default:
                return null; // for attributes that don't have a default value, we return null
        }
    }
});
 
// $.oAttribute Class methods


/**
 * Provides the keyframes of the attribute.
 * @return {$.oFrame[]}   The filtered keyframes.
 */
$.oAttribute.prototype.getKeyFrames = function(){
    var _frames = this.frames;
    _frames = _frames.filter(function(x){return x.isKeyFrame});
    return _frames;
}

/**
 * Sets the value of the attribute at the given frame.
 * @param   {string}     value                 The value to set on the attribute.
 * @param   {int}        [frame]               The frame at which to set the value, if not set, assumes 1
 */
$.oAttribute.prototype.setValue = function (value, frame) {
    var frame_set = true;
    if (typeof frame === 'undefined'){
      frame     = 1;
      frame_set = false;
    }
    
    var _attr = this.attributeObject;
    var _column = this.column;
    var _type = this.type;
    var _animate = false;

    if ( frame_set && _column == null ){
        // generate a new column to be able to animate
        var _doc = new this.$.oScene();
        _column = _doc.addColumn()
        this.column = _column;
    }
    
    if( _column ){
      _animate = true;
    }
    
    switch(_type){
        // TODO: sanitize input
        case "COLOR" :
            value = new this.$.oColorValue(value)
            value = ColorRGBA(value.r, value.g, value.b, value.a)
            _animate ? _attr.setValueAt(value, frame) : _attr.setValue(value);
            break;
           
        case "GENERIC_ENUM" :
            node.setTextAttr(this.node.path, this._keyword, frame, value)
            break;
           
        case "PATH_3D" :
            var _frame = new this.$.oFrame(frame, this.column, this.column.subColumns);
            if (_frame.isKeyFrame){
                var _point = new this.$.oPathPoint (this.column, _frame);
                _point.set(value);
            }else{
                // TODO: create keyframe?
                this.parentAttribute.attributeObject.setValueAt(value, frame);
            }
            break;
            
        case 'POSITION_2D':
            value = Point2d(value.x, value.y)
            _animate ? _attr.setValueAt(value, frame) : _attr.setValue(value);
            break;
            
        case 'POSITION_2D':
            value = Point2d(value.x, value.y)
            _animate ? _attr.setValueAt(value, frame) : _attr.setValue(value);
            break;

        case 'POSITION_3D':
            value = Point3d(value.x, value.y, value.z)
            _animate ? _attr.setValueAt(value, frame) : _attr.setValue(value);
            break;
           
        case "ELEMENT" :
            _column = this.column;
            column.setEntry(_column.uniqueName, 1, frame, value+"");
            break;
           
        default :
            // MessageLog.trace(this.keyword+" "+(typeof value))
            try{
                _animate ? _attr.setValueAt( value, frame ) : _attr.setValue( value );
            }catch(err){
                node.setTextAttr( this.node.path, this._keyword, frame, value );
                
                // throw new Error("Couldn't set attribute "+this.keyword+" to value "+value+". Incompatible type.")
            }
    }
}
 

//CFNote: Is it worth having a getValueType?
/**
 * Gets the value of the attribute at the given frame.
 * @param   {int}        frame                 The frame at which to set the value, if not set, assumes 1
 *  
 * @return {object}      The value of the attribute in the native format of that attribute (contextual to the attribute).
 */
$.oAttribute.prototype.getValue = function (frame) {
    // MessageLog.trace('getting value of frame :'+frame+' of attribute: '+this._keyword)
    
    if (typeof frame === 'undefined') var frame = 1;
 
    var _attr = this.attributeObject;
    var _type = this.type;
    var _value;
    var _column = this.column;

    //MessageBox.information("getting "+this.keyword)
    //MessageBox.information(_type)
    
    // handling conversion of all return types into our own types
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
            _value = new this.$.oColorValue(_attr.colorValueAt(frame))
            break;
 
        case 'POSITION_2D':
            _value = _attr.pos2dValueAt(frame)
            _value = new this.$.oPoint(_value.x, _value.y)
            break;
           
        case 'POSITION_3D':
            _value = _attr.pos3dValueAt(frame)
            _value = new this.$.oPoint(_value.x, _value.y, _value.z)
            break;
            
        case 'SCALE_3D':
            _value = _attr.pos3dValueAt(frame)
            _value = new this.$.oPoint(_value.x, _value.y, _value.z)
            break;
           
        case 'PATH_3D':
            _attr = this.parentAttribute.attributeObject;
              var _frame = new this.$.oFrame(frame, _column, _column.subColumns);
            if(_frame.isKeyFrame){
                _value = new this.$.oPathPoint(_column, _frame);
            } else{
                _value = _attr.pos3dValueAt(frame);
            }
            break;
            
        case 'DRAWING':
            // override with returning an oElement object
            System.println( "DRAWING: " + this.keyword );
            
            value = _column.element;
            break;
           
        case 'ELEMENT':
            // an element always has a column, so we'll fetch it from there
            _value = column.getEntry(_column.uniqueName, 1, frame)
            // Convert to an instance of oDrawing
            _value = _column.element.getDrawingByName(_value)
            break;
       
        // TODO: How does QUATERNION_PATH work? subcolumns I imagine
        // TODO: How to get types SCALE_3D, ROTATION_3D, DRAWING, GENERIC_ENUM? -> maybe we don't need to, they don't have intrinsic values
           
        default:
            // enums, etc
            _value = _attr.textValueAt(frame)
           
            // in case of subattributes, create a fake string that can have properties
            if ( _attr.hasSubAttributes && _attr.hasSubAttributes() ){
                _value = { value:_value };
                _value.toString = function(){ return _value }
            }
            
    }
       
    return _value;
}

/**
 * Gets the value of the attribute at the given frame.
 * @param   {int}        frame                 The frame at which to set the value, if not set, assumes 1
 *  
 * @return {object}      The value of the attribute in the native format of that attribute (contextual to the attribute).
 */
$.oAttribute.prototype.value = function(frame){
  return this.getValue( frame );
}