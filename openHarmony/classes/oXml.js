
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//           $.oXml class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oXml class.
 * @classdesc
 * The $.oXml class can be used to create an object from a xml string. It will contain a "children" property which is an array that holds all the children node from the main document.
 * @constructor
 * @param {string}     xmlString           the string to parse for xml content
 * @param {string}     objectName          "xmlDocument" for the top node, otherwise, the string description of the xml node (ex: <objectName> <property = "value"/> </objectName>)
 * @property {string}  objectName
 * @property {$.oXml[]}  children
 */
function oXml (xmlString, objectName){
  if (typeof objectName === 'undefined') var objectName = "xmlDocument";
  this.objectName = objectName;
  this.children = [];

  var string = xmlString+"";

  // matches children xml nodes, multiline or single line, and provides one group for the objectName and one for the insides to parse again.
  var objectRE = /<(\w+)[ >?]([\S\s]+?\/\1|[^<]+?\/)>/igm
  var match;
  while (match = objectRE.exec(xmlString)){
    this.children.push(new this.$.oXml(match[2], match[1]));
    // remove the match from the string to parse the rest as properties
    string = string.replace(match[0], "");
  }

  // matches a line with name="property"
  var propertyRE = /(\w+)="([^\=\<\>]+?)"/igm
  var match;
  while (match = propertyRE.exec(string)){
    // set the property on the object
    this[match[1]] = match[2];
  }
}

exports.oXml = oXml;