function openHarmony_install_update(){
  try{
    var d = new Dialog();
    d.title = "Install/Update OpenHarmony";
    d.cancelButtonText = "Cancel";
    
    //Standard install paths.
    var install_base = specialFolders.userScripts;
    var library_base = install_base + '/openHarmony';
    
    var libdir = new Dir(library_base);
    var label = new Label;
    if( libdir.exists ) {
      label.text = "Update openHarmony libraries?\n";    
      d.okButtonText = "Update";
    }else{
      label.text = "Install openHarmony libraries?\n";
      d.okButtonText = "Install";
    }
    d.add( label );
    
    if ( !d.exec() ){
      return;
    }
    
    if( !libdir.exists ){ 
      libdir.mkdirs();
    }
    if( !libdir.exists ){
      MessageBox.information( "Failed to create folders for openHarmony - please check permissions." );
    }
    
    var apic = new api_call( "https://api.github.com/repos/cfourney/OpenHarmony/branches" );
    if( !apic ){
      MessageBox.information( "API Error - Failed to get available branches." );
      return;
    }
    
    var branch_names = [];
    for( var x=0;x<apic.length;x++ ){
      branch_names.push( (x+1)+": "+apic[x].name.toUpperCase() );
    }
    
    var res = Input.getItem( "Which Branch", branch_names );
    if( !res ){ return; }

    var branch_data = false;
    var fnd = false;
    for( var x=0;x<apic.length;x++ ){
      var fname = (x+1)+": "+apic[x].name.toUpperCase();
      if( fname == res ){
        
        fnd = apic[x]["commit"]["url"];
        
        branch_data = apic[x].name.toUpperCase();        
        branch_data = branch_data + "\n" + fnd;
        branch_data = branch_data + "\n" + new Date();
        break;
      }
    }
    
    if( !fnd ){
      MessageBox.information( "Error - This shouldn't have happened." );
      return;
    }
    
    var apic = new api_call( fnd );
    if( !apic ){
      MessageBox.information( "API Error - Failed to get available branches." );
      return;
    }
    
    if( apic["files"] && apic["files"].length ){
      //Download the files.
      var progress = new QProgressDialog();
      progress.setLabelText( "Downloading files..." );
      progress.show();
      progress.setRange( 0, apic["files"].length );
      
      for( var n=0;n<apic["files"].length;n++ ){
        progress.setValue( n );
        QCoreApplication.processEvents();
        
        var raw_url = apic["files"][n]["raw_url"];
        var local_path = library_base+'/'+apic["files"][n]["filename"];
        var local_dir  = local_path.slice( 0, local_path.lastIndexOf("/") );
        
        var libdir = new Dir(local_dir);
        if( !libdir.exists ){
          libdir.mkdirs();
        }
        
        if( !libdir.exists ){
          MessageBox.information( "Failed to create openHarmony directory: " + local_dir );
          progress.accept();
          return;
        }
        
        var downloaded = download( raw_url, local_path );
        if( !downloaded ){
          MessageBox.information( "Failed to create openHarmony file: " + local_path );
          progress.accept();
          return;
        }
      }
      
      progress.accept();
      
      if( (new File( local_dir + "/" + "openHarmony.js" )).exists ){
        MessageBox.information( "OpenHarmony successfully installed." );
        preferences.setString( 'openHarmonyPath', ( local_dir + "/" + "openHarmony.js" ) );
        
        try {
          var install_path = local_dir + "/" + "INSTALL";
          var file = new File(install_path);
          file.open(FileAccess.Append);
          file.write( branch_data );
          file.close();
        }catch (err){
        }
      }else{
        MessageBox.information( "Unable to find OpenHarmony in install path: " + (local_dir + "/" + "openHarmony.js") );
      }
    }
  }catch( err ){
    MessageBox.information( "Failed to install: " + err + " ("+ err.lineNumber +")" );
  }
}

function api_call( address, callback ){
  try{
  
    var avail_paths = [ 
                        "c:\\Windows\\System32\\curl.exe"
                     ];
    if( !about.isWindowsArch() ){
      avail_paths = [ 
                      "/usr/bin/curl",
                      "/usr/local/bin/curl"
                    ];
    }
    
    var curl_path = false;
    for( var n=0;n<avail_paths.length;n++ ){
      if( ( new File(avail_paths[n]) ).exists ){
        curl_path = avail_paths[n];
        break;
      }
    }

    var cmdline = [ "-L", address ];
    
    var p = new QProcess();
    // p.setWorkingDirectory( pathToTemplate ); 
    p.start( curl_path, cmdline );  
    p.waitForFinished( 10000 );
    
    try{
      var readOut = JSON.parse( ( new QTextStream( p.readAllStandardOutput() ) ).readAll() );
      return readOut;
    }catch(err){
      return false;
    }    
  }catch( err ){
    System.println( err + " ("+address.lineNumber+")" );
  }
}

function download( address, target ){
  try{
  
    var avail_paths = [ 
                        "c:\\Windows\\System32\\curl.exe"
                     ];
    if( !about.isWindowsArch() ){
      avail_paths = [ 
                      "/usr/bin/curl",
                      "/usr/local/bin/curl"
                    ];
    }
    
    var curl_path = false;
    for( var n=0;n<avail_paths.length;n++ ){
      if( ( new File(avail_paths[n]) ).exists ){
        curl_path = avail_paths[n];
        break;
      }
    }
    
    if( !curl_path ){
      MessageBox.information( "Unable to find application for web hook." );
      return false;
    }
    
    var file = new File( target );
    if( file.exists ){
      file.remove();
    }
    
    var cmdline = [ "-L", "-o", target, address ];
    
    var p = new QProcess();
    p.start( curl_path, cmdline );  
    p.waitForFinished( 10000 );
    
    var file = new File( target );
    return file.exists;
    
  }catch( err ){
    System.println( err + "("+err.lineNumber+")" );
  }
}