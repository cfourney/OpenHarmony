/**
 *  Load the Open Harmony Library as needed.
 */
function oh_load(){
  try{
    //If an override debug path exists, use it.
    var oh_incl = preferences.getString( 'openHarmonyIncludeDebug', false );
    if( oh_incl ){
      oh_incl = preferences.getString( 'openHarmonyInclude', false );
    }
  
    if( !this["$"] ){  
      include( oh_incl );
    }
    if( !this["$"] ){  
      MessageBox.warning( "Unable to load the openHarmony library. Is it installed?" );
    }
  }catch(err){
    System.println( err + " : " + err.lineNumber + " " + err.fileName );
  }
}


/**
 *  Smart key button. Only adds a key if a column already exists. Maintains sections that are tweens and other sections that are stop-motion/holds.
 */
function oh_anim_smartKey(){
  
  
}