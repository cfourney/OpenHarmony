#!/bin/bash
cd -- "$(dirname "$0")"
dlPath=$PWD
harmonyPrefsDir="${HOME}/Library/Preferences/Toon Boom Animation/"

echo -------------------------------------------------------------------
echo -- openHarmony open source scripting library - macOS Installer --
echo -------------------------------------------------------------------
echo OpenHarmony will be installed to the folder : 
echo $dlPath
echo Do not delete the contents of this folder.


# ********************  Add OpenHarmony Install Path to Environment Variable  ********************

# ----- METHOD 1 I TESTED, COMMENTED OUT FOR FUTURE REFERENCE -----
# ALERT!> Env Variable might disappear after restart as per https://apple.stackexchange.com/a/433770
# sudo launchctl setenv LIB_OPENHARMONY_PATH "$dlPath"

# ----- METHOD 2 I TESTED, COMMENTED OUT FOR FUTURE REFERENCE -----
# ALERT!> Sets Permanent Environment Variables but only for shells and not systemwide, so Harmony doesn't pick up the variable
# touch ~/.zshrc
# touch ~/.zprofile
# touch ~/.bash_profile
# chmod 700 ~/.bash_profile
# echo "export LIB_OPENHARMONY_PATH="$dlPath"" >> ~/.zshrc
# echo "export LIB_OPENHARMONY_PATH="$dlPath"" >> ~/.zprofile
# echo "export LIB_OPENHARMONY_PATH="$dlPath"" >> ~/.bash_profile

# ----- METHOD 3 I TESTED, WORKS, SURVIVES REBOOTS, BUT FAILS IN EDGE CASES, SEE INFO -----
# INFO: https://stackoverflow.com/a/26586170
# Create a multiline XML launchagent file that sets the environment variable at boot
cat <<EOT > ~/Library/LaunchAgents/tbenv.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>my.startup</string>
  <key>ProgramArguments</key>
  <array>
    <string>sh</string>
    <string>-c</string>
    <string>
    launchctl setenv LIB_OPENHARMONY_PATH "$dlPath"
    </string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
EOT
launchctl load ~/Library/LaunchAgents/tbenv.plist # Load plist without rebooting

# Iterate Harmony Versions and Install Script onto each one
for dir in "$harmonyPrefsDir"*Harmony*/; do
  for subdir in "$dir"*-layouts*/; do
    subdir="${subdir%/}" # Strip trailing slash (if any)
    harmonyLayoutsFolderName="${subdir##*/}" # Get Layouts Folder Name which contains Version
    harmmonyFullPath="${subdir%/*}"
    harmmonyBaseFolder="${harmmonyFullPath##*/}"
    harmonyVersionNumber="${harmonyLayoutsFolderName:0:4}"
    echo Found $harmmonyBaseFolder "${harmonyVersionNumber:0:2}" - installing openHarmony for this version.
    installDir="$harmonyPrefsDir""$harmmonyBaseFolder/""$harmonyVersionNumber""-scripts/"
    if [[ "$installDir" != "$dlPath" ]]; then
      if [[ ! -e "$installDir" ]]; then
          mkdir "$installDir"
      elif [[ ! -d "$installDir" ]]; then
          echo "$installDir already exists but is not a directory" 1>&2
      fi
      script="include(System.getenv('LIB_OPENHARMONY_PATH')+'/openHarmony.js');"
      echo $script > "$installDir""openHarmony.js" #creating a "openHarmony.js" file in script folders
    fi
  done 
done
