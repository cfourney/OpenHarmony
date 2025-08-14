//////////////////////////////////////
//////////////////////////////////////
//                                  //
//                                  //
//        $.oDataBase class         //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The constructor for the $.oDataBase.
 * @classdesc
 * A class to access the contents of the Harmony database from a scene.
 * @constructor
 */
function oDatabase (){
}


/**
 * Function to query the database using the dbu utility.
 * @private
 */
oDatabase.prototype.query = function(args){
	var dbbin = specialFolders.bin+"/dbu";
	var p = new $.oProcess(dbbin, args);
	var result = p.execute();

	result = result.split("Name:").join("").split("\r\n");

	return result;
}

/**
 * Lists the environments existing on the local database
 * @return {string[]}  The list of names of environments
 */
oDatabase.prototype.getEnvironments = function(){
  var dbFile = new this.$.oFile("/USA_DB/envs/env.db");
  if (!dbFile.exists){
    this.$.debug("Can't access Harmony Database at address : /USA_DB/envs/env.db", this.$.DEBUG_LEVEL.ERROR);
    return null;
  }
  var dbqueryArgs = ["-l", "-sh", "Name", dbFile.path];
	var envs = this.query(dbqueryArgs);
	return envs;
}


/**
 * Lists the jobs in the given environment in the local database
 * @param {string}  [environment]    The name of the environment to return the jobs from. Returns the jobs from the current environment by default. 
 * @return {string[]}  The list of job names in the environment.
 */
oDatabase.prototype.getJobs = function(environment){
  if (typeof environment === 'undefined' && this.$.scene.online) {
    var environment = this.$.scene.environment;
  }else{
    return null;
  }

  var dbFile = new this.$.oFile("/USA_DB/online_jobs/jobs.db");
  if (!dbFile.exists){
    this.$.debug("Can't access Harmony Database at address : /USA_DB/online_jobs/jobs.db", this.$.DEBUG_LEVEL.ERROR);
    return null;
  }
	var dbqueryArgs = ["-l", "-sh", "Name", "-search", "Env == "+environment, dbFile.path];
	var jobs = this.query(dbqueryArgs);
	return jobs;
}


/**
 * Lists the scenes in the given environment in the local database
 * @param {string}  [job]    The name of the jobs to return the scenes from. Returns the scenes from the current job by default. 
 * @return {string[]}  The list of scene names in the job.
 */
oDatabase.prototype.getScenes = function(job){
  if (typeof job === 'undefined' && this.$.scene.online){
    var job = this.$.scene.job;
  }else{
    return null;
  }

  var dbFile = new this.$.oFile("/USA_DB/db_jobs/"+job+"/scene.db");
  if (!dbFile.exists){
    this.$.debug("Can't access Harmony Database at address : /USA_DB/db_jobs/"+job+"/scene.db", this.$.DEBUG_LEVEL.ERROR);
    return null;
  }
  var dbqueryArgs = ["-l", "-sh", "Name", dbFile.path];
	var scenes = this.query(dbqueryArgs);
	return scenes;
}


exports.oDatabase = oDatabase;