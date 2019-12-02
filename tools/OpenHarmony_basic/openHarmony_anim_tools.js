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
  try{
    oh_load();
    System.println("");
    
    scene.beginUndoRedoAccum( "oh_anim_smartKey" );
    
    var timeline = $.scene.getTimeline();
    var layers   = timeline.selectedLayers;
    var cseg_val = preferences.getBool( "SP_CONSTANT_SEGMENT", false );
    
    //--------------------------------------------------
    //--- The key function, used 
    
    var last_seg = false;
    
    var smart_key_item = function( attr ){
      var cfrm  = $.scene.currentFrame; 
      
      var frame = attr.frames[ cfrm ];
      
      if( !frame.isKeyFrame ){
        // var val   = attr.getValue( cfrm ); 
        var nk    = frame.keyframeLeft;
        
        if(!nk){
          //Consider this as static.
          if( !last_seg ){
            preferences.setBool( "SP_CONSTANT_SEGMENT", true );
            last_seg = true;
          }
        }else{
          var cont = nk.continuity;
          if( cont == "CONSTANT" ){
            if( !last_seg ){
              preferences.setBool( "SP_CONSTANT_SEGMENT", true );
              last_seg = true;
            }
          }else{
            var lk    = frame.keyframeRight;
            if( lk ){
              //Something is right, keep the tween.
              if( last_seg ){
                preferences.setBool( "SP_CONSTANT_SEGMENT", false );
                last_seg = false;
              }
            }else{
              //Consider this a constant segment, nothing was to the right.
              if( !last_seg ){
                preferences.setBool( "SP_CONSTANT_SEGMENT", true );
                last_seg = true;
              }
            }
          }
        }
        frame.setKey();
      }
    }
    
    if( layers.length == 0 ){
      System.println( "LAYERS" );
      var layers = timeline.compositionLayers;
      
      var items = [];
      for( var n=0;n<layers.length;n++ ){
        var tlayer = layers[n];
        for( var attrname in tlayer.attributes ){
          var tattr = tlayer.attributes[ attrname ];
          if( tattr.column ){
            // smart_key_item( tattr );
          }else{
            for( var tt=0;tt<tattr.subAttributes.length;tt++ ){
              var subattr = tattr.subAttributes[tt];
              if( subattr.column ){
                smart_key_item( subattr );
              }
            }
          }
        }
      }
    }else{
      //Selected layers are sufficient.
      System.println( "ITERATING LAYERS" );
      for( var n=0;n<layers.length;n++ ){
        var tlayer = layers[n];
        if( tlayer.attribute ){
          if( tlayer.attribute.column ){
            smart_key_item( tlayer.attribute );
          }
        }
      }
    }

    System.println( "END" );
    scene.endUndoRedoAccum( );
    
  }catch( err ){
    $.debug( err + " ("+err.fileName+" "+err.lineNumber+")", $.DEBUG_LEVEL["ERROR"] );
    
  }
}