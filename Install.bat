@echo off
SETLOCAL ENABLEDELAYEDEXPANSION 
SET dlPath=%~dp0
set harmonyPrefsDir=%appdata%\Toon Boom Animation

echo -- Starting install of openHarmony open source scripting library --

rem Check Harmony Versions and make a list
set i=0
for /d %%D in ("%harmonyPrefsDir%\*") do (
  set harmonyVersionDir=%%~fD
  for /d %%V in ("!harmonyVersionDir!\*-layouts*") do (
    set /a i+=1
    set "folderName=%%~nD"
    set "versionName=%%~nV"
    set "harmonyFolder[!i!]=!folderName:~-7!"
    set "harmonyVersions[!i!]=!versionName:~0,2!"
    set versionString[!i!]=Harmony !versionName:~0,2! !folderName:~-7!
  )
)

rem offer choice if more than one version
if %i% GEQ 2 (
  rem print out the list
  echo Found %i% installed Toonboom Harmony versions:
  for /l %%a in (1 1 %i%) do ( echo %%a. !versionString[%%a]! )
  set /p choice=Install OpenHarmony for which Harmony version? : 
) else (
  set choice=1
)

set "installDir=%harmonyPrefsDir%\Toon Boom Harmony !harmonyFolder[%choice%]!\!harmonyVersions[%choice%]!00-scripts\"
echo Installing openHarmony to directory :
echo %installDir%

rem create script folder if missing
if not exist "%installDir%" mkdir "%installDir%"

rem copy scriptfiles into destination
(echo .bat 
echo .json
echo .txt
echo .md)> exclude.txt

xcopy "%dlPath%*" "%installDir%" /y /s /i /e /q /exclude:exclude.txt
del exclude.txt

echo - Install Complete -
pause