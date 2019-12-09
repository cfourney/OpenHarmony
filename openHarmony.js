//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//
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
//
//   To use, add the line 'include("openHarmony.js")' at the start of your script
//   and include this file in the same folder.
//
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
//          $ (DOM) class           //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The $ global object that holds all the functions of openHarmony.
 * @namespace
 * @classdesc All the classes can be accessed from it, and it can be passed to a different context.
 * @version   1.0
 * @property {int}     debug_level               - The debug level of the DOM.
 * @property {string}  file                      - The openHarmony base file - THIS!
 *
 * @property {oScene}  getScene                  - The harmony scene.
 * @property {oScene}  scene                     - The harmony scene.
 * @property {oScene}  scn                       - The harmony scene.
 * @property {oScene}  s                         - The harmony scene.
 * @example
 * // To access the functions, first call the $ object.
 * 
 * var doc = $.scn                    // grabbing the scene document
 * $.log("hello")                     // prints out a message to the MessageLog.
 * var myPoint = new $.oPoint(0,0,0)  // create a new class instance from an openHarmony class.
 *
 * // members of the $ objects get published to the global scope, which means $ can be ommited
 *
 * var doc = scn
 * log("hello)
 * var myPoint = new oPoint(0,0,0)    // This is all valid
 * 
 */
$ = {
  debug_level : 0,

 /**
 * Enum to set the debug level of debug statements.
 * @enum
 */
  DEBUG_LEVEL : {
                 'ERROR'   : 0,
                 'WARNING' : 1,
                 'LOG'     : 2
                },            
  file      : __file__,
  directory : false,
  batchMode : false
};

/**
 * Helper function to split the filename, and get the directory name containing the file argument.
 * @param   {string}   file_path            The path for the file to derive a directory from.
 * @return  {string}                        The directory of the file.
 */
$.directoryGet = function( file_path ){
  return file_path.split("\\").join("/").split( "/" ).slice(0, -1).join('/');
};


$.directory = $.directoryGet( __file__ );

// The included files should be relative to the path of THIS file!
include( $.directory + "/openHarmony/openHarmony_misc.js"      );
include( $.directory + "/openHarmony/openHarmony_dialog.js"    );
include( $.directory + "/openHarmony/openHarmony_file.js"      );
include( $.directory + "/openHarmony/openHarmony_threading.js" );
include( $.directory + "/openHarmony/openHarmony_network.js"   );   
include( $.directory + "/openHarmony/openHarmony_path.js"      );   
include( $.directory + "/openHarmony/openHarmony_list.js"      );
include( $.directory + "/openHarmony/openHarmony_backdrop.js"  );      
include( $.directory + "/openHarmony/openHarmony_timeline.js"  );  
include( $.directory + "/openHarmony/openHarmony_attribute.js" );   
include( $.directory + "/openHarmony/openHarmony_frame.js"     );       
include( $.directory + "/openHarmony/openHarmony_element.js"   );     
include( $.directory + "/openHarmony/openHarmony_color.js"     );       
include( $.directory + "/openHarmony/openHarmony_palette.js"   );     
include( $.directory + "/openHarmony/openHarmony_nodeLink.js"  );    
include( $.directory + "/openHarmony/openHarmony_node.js"      );        
include( $.directory + "/openHarmony/openHarmony_column.js"    );      
include( $.directory + "/openHarmony/openHarmony_drawing.js"   );     
include( $.directory + "/openHarmony/openHarmony_scene.js"     );
include(specialFolders.resource+"/scripts/TB_orderNetworkUp.js");
include(specialFolders.userScripts+"/TB_orderNetworkUp.js");       // for older versions of harmony

/**
 * The standard debug that uses logic and level to write to the messagelog. Everything should just call this to write internally to a log in OpenHarmony.
 * @param   {obj}   obj            Description.
 * @param   {int}   level          The debug level of the incoming message to log.
 */
$.debug = function( obj, level ){
  if( level <= this.debug_level ){
    //We log it.
    
    
    //Identify the types.
    if( (typeof obj) == "string" ){
      this.log( obj );
    }else{
      this.log( JSON.stringify( obj ) );
    }
    
  }
}

/**
 * Log the string to the MessageLog.
 * @param {string}  str            Text to log.
 */
$.log = function( str ){
  MessageLog.trace( str );
  System.println( str );
}

/**
 * Log the object and its contents.
 * @param   {object}   object            The object to log.
 * @param   {int}      debugLevel        The debug level.
 */
$.logObj = function( object ){
  for (var i in object){
    try {
      if (typeof object[i] === "function") continue;
      $.log(i+' : '+object[i])
      if (typeof object[i] == "Object"){
        $.log(' -> ')
        $.logObj(object[i])
        $.log(' ----- ')
      }
    }catch(error){}
  }
}


//---- Scene  --------------
$.s     = new $.oScene( );
$.scn   = $.s;
$.scene = $.s;
$.getScene = $.s;


//---- Attach Helpers ------
$.network = new $.oNetwork( );
$.utils   = new $.oUtils( );
$.dialog  = new $.oDialog( );
$.global  = this;

/**
 * Prompts with a confirmation dialog (yes/no choice).
 * @function
 * @name    $#confirm
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 * @param   {string}           [cancelButtonText]             The text on the CANCEL button of the dialog.
 * 
 * @return  {bool}       Result of the confirmation dialog.
 */
$.confirm = $.dialog.confirm;

/**
 * Prompts with an alert dialog (informational).
 * @function
 * @name    $#alert
 * @param   {string}           [title]                        The title of the confirmation dialog.
 * @param   {string}           [labelText]                    The label/internal text of the dialog.
 * @param   {string}           [okButtonText]                 The text on the OK button of the dialog.
 * 
 */
$.alert   = $.dialog.alert;

/**
 * Prompts with a file selector window
 * @name    $#browseForFile
 * @function
 * @param   {string}           [text="Select a file:"]       The title of the confirmation dialog.
 * @param   {string}           [filter="*"]                  The filter for the file type and/or file name that can be selected. Accepts wildcard charater "*".
 * @param   {string}           [getExisting=true]            Whether to select an existing file or a save location
 * @param   {string}           [acceptMultiple=false]        Whether or not selecting more than one file is ok. Is ignored if getExisting is falses.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 * 
 * @return  {string[]}         The list of selected Files, 'undefined' if the dialog is cancelled
 */
$.browseForFile = $.dialog.browseForFile;

/**
 * Prompts with a folder selector window.
 * @name    $#browseForFolder
 * @function
 * @param   {string}           [text]                        The title of the confirmation dialog.
 * @param   {string}           [startDirectory]              The directory showed at the opening of the dialog.
 * 
 * @return  {string[]}         The path of the selected folder, 'undefined' if the dialog is cancelled 
 */
$.browseForFolder = $.dialog.browseForFolder;


//---- Cache Helpers ------
$.cache_columnToNodeAttribute = {};
$.cache_columnToNodeAttribute_date = (new Date()).getTime();
$.cache_oNode = {};


//---- Instantiate Class $ DOM Access ------
function addDOMAccess( target, item ){
  Object.defineProperty( target, '$', {
    configurable: false,
    enumerable: false,
    value: item
  });
}

//Add the context as a local member of the classes.
for( var classItem in $ ){
  if( ( typeof $[classItem] ) == "function" ){
    try{
      addDOMAccess( $[classItem].prototype, $ );
    }catch(err){
      System.println( "Error extending DOM access to : " + classItem );
    }
    
    //Also extend it to the global object.
    this[classItem] = $[classItem];
  }
}


//------------------------------------------------
//-- Undo operations

/**
 * Starts the tracking of the undo accumulation, all subsequent actions are done in a single undo operation.<br>Close the undo accum with $.endUndo().
 * @param   {string}           undoName                                       The name of the operation that is being done in the undo accum.
 * @see $.endUndo
 */
$.beginUndo = function( undoName ){
  //Using epoch as the temp name.
  if (typeof undoName === 'undefined') var undoName = ''+((new Date()).getTime()); 
  
  scene.beginUndoRedoAccum( undoName );
}

/**
 * Cancels the tracking of the undo accumulation, everything between this and the start of the accumulation is undone.
 * @see $.beginUndo
 */
$.cancelUndo = function( ){
  scene.cancelUndoRedoAccum( );
}

/**
 * Stops the tracking of the undo accumulation, everything between this and the start of the accumulation behaves as a single undo operation.
 * @see $.beginUndo
 */
$.endUndo = function( ){
  scene.endUndoRedoAccum( );
}

/**
 * 	Undoes the last n operations. If n is not specified, it will be 1
 * @param   {int}           n                                       The amount of operations to undo.
 */
$.undo = function( dist ){
  if (typeof dist === 'undefined'){ var dist = 1; }
  scene.undo( dist );
}

/**
 * 	Redoes the last n operations. If n is not specified, it will be 1
 * @param   {int}           n                                       The amount of operations to undo.
 */
$.redo = function( dist ){
  if (typeof dist === 'undefined'){ var dist = 1; }
  scene.redo( dist );
}
