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
 
 
// Constructor
//
// oAttribute(oNodeObject, attributeObject)
//
// Properties
//
// oNode oNodeObject
// Attribute attributeObject
// String keyword
// string type
// oColumn column
// array frames
//
// Methods
//
// oColumn getLinkedColumn()
// array getKeyFrames()
// bool set(value, double frame)
// various get(frame)
 
// oAttribute constructor
 
function oAttribute(oNodeObject, attributeObject){
    this.oNodeObject = oNodeObject;
    this.attributeObject = attributeObject;
    
    try{
      this.keyword = attributeObject.fullKeyword();
    }catch( err ){
      //Not an applicatable method for Harmony <16
      this.keyword = attributeObject.keyword();
    }
    
    var _subAttributes = [];
    if( attributeObject.hasSubAttributes ){
      if ( attributeObject.hasSubAttributes() ){
          var _subAttributesList = attributeObject.getSubAttributes();
          for (var i in _subAttributesList){
              var _keyword = _subAttributesList[i].keyword().toLowerCase();
              var _subAttribute = new oAttribute(this.oNodeObject, _subAttributesList[i])
              this[_keyword] = _subAttribute
              _subAttributes.push(_subAttribute)
          }
      }
    }else{
      // Not an applicatable method for Harmony <16
      // Will need to derive sub-attributes depending on the attribute type for older versions.
      
    }
    
    this.subAttributes = _subAttributes;
}

// oAttribute Object Properties

// string type

Object.defineProperty(oAttribute.prototype, 'type', {
    get : function(){
        return this.attributeObject.typeName();
    }
})
 

// oColumn column
 
Object.defineProperty(oAttribute.prototype, 'column', {
    get : function(){
        var _column = node.linkedColumn (this.oNodeObject.fullPath, this.keyword)
        var _subAttributesNum = this.attributeObject.getSubAttributes().length
        return new oColumn(_column, _subAttributesNum)
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
 
 
// Array frames
 
Object.defineProperty(oAttribute.prototype, 'frames', {
    get : function(){
         var _column = this.column
         if (_column != null){
            return _column.frames;
         }else{
            return [];
         }
    }
})

 
oAttribute.prototype.getKeyFrames = function(){
    var _frames = this.frames;
    _frames = _frames.filter(function(x){return x.isKeyFrame})
    return _frames
}


// bool set(value, double frame)

oAttribute.prototype.set = function (value, frame) {
    if (typeof frame === 'undefined') var frame = 1;

    if (frame != 1){
        // generate a new column to be able to animate
        if (this.column == null){
            var _doc = new oScene();
            var _column = _doc.addColumn()
            this.column = _column;
        }
        this.column.frames[frame].value = value;

    }else{
        // TODO deal with subattributes
        try{
            if (this.column == null){
                this.attributeObject.setValue(value);
                return true;
            }else{
                this.column.frames[frame].value = value;
            }
        }
        catch(err){return false}
    }
}


// various get(frame)

oAttribute.prototype.get = function (frame) {
    if (typeof frame === 'undefined') var frame = 1;

    if (frame != 1 && this.column != null){
        // generate a new column to be able to animate
        return this.column.frames[frame].value;

    }else{
        var _attr = this.attributeObject;
        var _type = this.type;
        var _value;
        
        switch (_type){
            case 'bool':
                _value = _attr.boolValueAt(1)
                break;
                
            case 'int':
                _value = _attr.inValueAt(1)
                break;
                
            case 'double':
                _value = _attr.doubleValueAt(1)
                break;
                
            case 'text':
                _value = _attr.textValueAt(1)
                break;
                
            case 'color':
                _value = _attr.colorValueAt(1)
                break;

            case 'pos2d':
                _value = _attr.pos2dValueAt(1)
                break;
                
            case 'pos3d':
                _value = _attr.pos3dValueAt(1)
                break;
                
            default:
        }
        
        // TODO deal with subattributes
        return this.attributeObject.getValue();
    }
}