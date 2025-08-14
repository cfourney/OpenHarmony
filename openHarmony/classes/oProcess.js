
//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//         $.oProcess class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for $.oProcess.
 * @name        $.oProcess
 * @classdesc
 * Process class that allows user to launch executables outside harmony and get feedback from them.
 * @constructor
 * @param    {string}    bin          The path to the binary executable that will be launched.
 * @param    {string[]}  queryArgs    A string array of the different arguments given to the command.
 *
 * @property {$.oSignal} readyRead    A $.oSignal that can be connected to a callback, emitted every time new messages are outputted by the oProcess. Signature: readyRead(stdout (string))
 * @property {$.oSignal} finished     A $.oSignal that can be connected to a callback, emitted when the oProcess has finished. Signature: finished(returnCode(int), stdout(string))
 * @property {QProcess}  process      the QProcess object wrapped by the $.oProcess object.
 * @property {string}    bin          The path to the binary executable that will be launched.
 * @property {string[]}  queryArgs    A string array of the different arguments given to the command.
 * @property {string}    log          The full log of all the messages outputted over the course of the process lifetime.
 */
function oProcess (bin, queryArgs){
  this.readyRead = new this.$.oSignal()
  this.finished = new this.$.oSignal()
  this.bin = bin;
  this.queryArgs = queryArgs;
  this.process = new QProcess();
  this.readChannel = "All";
  this.log = "";
}


/**
 * Which channel will the process read from. Set before launching the process. can take the values "All", "Output" and "Error".
 * @name $.oProcess#readChannel
 * @type {string}
 */
Object.defineProperty(oProcess.prototype, 'readChannel', {
  get : function(){
    var merged = (this.process.processChannelMode() == QProcess.MergedChannels);
    if (merged) return "All";
    if (this.process.readChannel == QProcess.StandardOutput) return "Output";
    if (this.process.readChannel == QProcess.StandardError) return "Error";
  },

  set : function(channel){
    if (channel == "All") {
      this.process.setProcessChannelMode(QProcess.MergedChannels);
      this.process.readChannel = QProcess.StandardOutput;
    }else if (channel == "Output"){
      this.process.setProcessChannelMode(QProcess.SeparateChannels);
      this.process.readChannel = QProcess.StandardOutput;
    }else if (channel == "Error"){
      this.process.setProcessChannelMode(QProcess.SeparateChannels);
      this.process.readChannel = QProcess.StandardError;
    }
  }
});


/**
 * kills the process instantly (useful for hanging processes, etc).
 */
oProcess.prototype.kill = function(){
  if (!this.process) return;
  this.process.kill()
}

/**
 * Attempts to terminate the process execution by asking it to close itself.
 */
oProcess.prototype.terminate = function(){
  if (!this.process) return;
  this.process.terminate()
}

/**
 * Execute a process and read the result as a string.
 * @param {function} [readCallback]         User can provide a function to execute when new info can be read. This function's first argument will contain the available output from the process.
 * @param {function} [finishedCallback]     User can provide a function to execute when new process has finished
 * @example
 * // This example from the openHarmony oScene.renderWriteNodes() function code
 * // uses the oProcess class to launch an async process and print its progress
 * // to the MessageLog.
 *
 * // declaring the binary called by the process
 * var harmonyBin = specialFolders.bin+"/HarmonyPremium";
 *
 * // building the list of arguments based on user provided input
 * var args = ["-batch", "-frames", startFrame, endFrame, "-res", resX, resY];
 *
 * // different arguments depending on wether the scene is stored on the database or offline
 * if (this.online){
 *   args.push("-env");
 *   args.push(this.environnement);
 *   args.push("-job");
 *   args.push(this.job);
 *   args.push("-scene");
 *   args.push(this.name);
 * }else{
 *   args.push(this.stage);
 * }
 *
 * // Create the process with the arguments above
 * var p = new this.$.oProcess(harmonyBin, args);
 * p.readChannel = "All"; // specifying which channel of the process we will listen to: here we listen to both stdout and error.
 *
 * // creating an async process
 * if (renderInBackground){
 *   var length = endFrame - startFrame;
 *
 *   // Creating a function to respond to new readable information on the output channel.
 *   // This function takes a "message" argument which will contain the returned output of the process.
 *
 *   var progressDialogue = new this.$.oProgressDialog("Rendering : ",length,"Render Write Nodes", true);
 *   var self = this;
 *
 *   var renderProgress = function(message){
 *     // parsing the message to find a Rendered frame number.
 *     var progressRegex = /Rendered Frame ([0-9]+)/igm;
 *     var matches = [];
 *     while (match = progressRegex.exec(message)) {
 *       matches.push(match[1]);
 *     }
 *     if (matches.length!=0){
 *       // if a number is found, we compare it to the total frames in the render to deduce a completion percentage.
 *       var progress = parseInt(matches.pop(),10)
 *       progressDialogue.label = "Rendering Frame: "+progress+"/"+length
 *       progressDialogue.value = progress;
 *       var percentage = Math.round(progress/length*100);
 *       self.$.log("render : "+percentage+"% complete");
 *     }
 *   }
 *
 *   // Creating a function that will trigger when process exits.
 *   // This function can take an "exit code" argument that will tell if the process terminated without problem.
 *
 *   var renderFinished = function(exitCode){
 *     // here we simply output that the render completed successfully.
 *     progressDialogue.label = "Rendering Finished"
       progressDialogue.value = length;
 *     self.$.log(exitCode+" : render finished");
 *   }
 *
 *   // launching the process in async mode by providing true as first argument, and then the functions created above.
 *
 *   p.launchAndRead(renderProgress, renderFinished);
 *   this.$.log("Starting render of scene "+this.name);

 * }else{
 *
 *   // if we don't want to use an async process and prefer to freeze the execution while waiting, we can simply call:
 *   var readout  = p.execute();
 * }
 *
 * // we return the output of the process in case we didn't use async.
 * return readout
 *
 */
oProcess.prototype.launchAndRead = function(readCallback, finishedCallback){
  if (typeof timeOut === 'undefined') var timeOut = -1;

  var p = this.process;

  this.$.debug("Executing Process with arguments : "+this.bin+" "+this.queryArgs.join(" "), this.$.DEBUG_LEVEL.LOG);

  // start process and attach functions to "readyRead" and "finished" signals
  function onRead(){
    var stdout = this.read();
    this.readyRead.emit(stdout);
  }

  function onFinished(returnCode){
    var stdout = this.read(); // reading any extra messages issued since last read() call to add to log
    this.finished.emit(returnCode, this.log);
  }

  p.readyRead.connect(this, onRead);
  p["finished(int)"].connect(this, onFinished);

  if (typeof readCallback !== 'undefined') this.readyRead.connect(readCallback);
  if (typeof finishedCallback !== 'undefined') this.finished.connect(onFinished);

  if (about.isLinuxArch()) {
    p.start(this.bin, this.queryArgs);
  } else {
    var bin = this.bin.split("/");
    var app = bin.pop();
    var directory = bin.join("/");
    p.setWorkingDirectory(directory);
    p.start(app, this.queryArgs);
  }
}


/**
 * read the output of a process.
 * @return {string}   The lines as returned by the process since the last "read" instruction
 */
oProcess.prototype.read = function (){
  var p = this.process;
  if (p.readChannel == QProcess.StandardOutput){
    var readOut = p.readAllStandardOutput();
  }else {
    var readOut = p.readAllStandardError();
  }

  var output = new QTextStream(readOut).readAll();
  while(output.slice(-1)== "\n" || output.slice(-1)== "\r"){
    output = output.slice (0, -1);
  }

  this.log += output;

  return output;
}


/**
 * Execute a process and waits for the end of the execution.
 * @return {string}   The lines as returned by the process.
 */
oProcess.prototype.execute = function(){
  this.$.debug("Executing Process with arguments : "+this.bin+" "+this.queryArgs.join(" "), this.$.DEBUG_LEVEL.LOG);

  var p = this.process;
	p.start( this.bin, this.queryArgs );
	p.waitForFinished(-1);
  var result = this.read();
  return result;
}


/**
 * Execute a process as a separate application, which doesn't block the script execution and stops the script from interacting with it further.
 */
oProcess.prototype.launchAndDetach = function(){
  QProcess.startDetached(this.bin, this.queryArgs);
}


exports.oProcess = oProcess;