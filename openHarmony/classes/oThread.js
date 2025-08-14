//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//
//                            openHarmony Library
//
//
//         Developped by Mathieu Chaptel, Chris Fourney
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
//   This library is made available under the Mozilla Public license 2.0.
//   https://www.mozilla.org/en-US/MPL/2.0/
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
//         $.oThread class          //
//                                  //
//                                  //
//////////////////////////////////////
//////////////////////////////////////


/**
 * The base class for the $.oThread -- WIP, NOT TRULY THREADED AS THE EVENT MANAGER DOESNT ALLOW FOR THREADS YET.
 * @constructor
 * @classdesc  $.oThread Base Class
 * @param   {function}                 kernel                The kernel that is iterating.
 * @param   {object[]}                 list                  The list of elements to iterate upon.
 * @param   {int}                      [threadCount]         The amount of threads to initiate. Default: 5
 * @param   {bool}                     [start]               Whether to start on instantiation, or to wait until prompted. Default: false
 * @param   {int}                      [timeout]             Timeout in MS
 * @param   {bool}                     [reserveThread]       Whether to reserve a thread for this to process while blocking.
 *
 * @property {int}                     threadCount           The amount of threads to initiate.
 * @property {QTimer[]}                threads               The underlying QTimers that behave as threads.
 * @property {object[]}                results_thread        The results from the kernel, should match indices of provided list.
 * @property {string[]}                error_thread          The errors from the kernel, in the event there are code errors.
 * @property {bool[]}                  complete_thread       The completion (note: not success) state of the thread. Success state would be the result.
 * @property {bool}                    started               The start state of all threads.
 * @property {int}                     timeout               MS timeout for blocking processes.
 */
function oThread( kernel, list, threadCount, start, timeout, reserveThread ){
  if (typeof threadCount === 'undefined') var threadCount = "2";
  if (typeof start === 'undefined') var start = false;
  if (typeof reserveThread === 'undefined') reserveThread = true;

  threadCount = Math.min( threadCount, list.length );

  this.list               = list;
  this.threadCount        = threadCount;
  this.threads            = [];
  this.started_thread     = [];
  this.results_thread     = [];
  this.error_thread       = [];
  this.complete_thread    = [];

  this.started     = false;

  this.startAtInstantiation = start;
  this.threads_available    = false;
  this.reserveThread        = reserveThread;
  this.reservedThread       = false;

  this.timeout     = 1000.0 * 60.0;
  if ( timeout ) this.timeout = timeout;

  //Instantiate the results.
  for( var n=0;n<list.length;n++ ){
    this.results_thread.push( false );
    this.complete_thread.push( false );
    this.error_thread.push( false );
  }

  var context = {
                  "kernel"   : kernel,
                  "list"     : list,
                  "results"  : this.results_thread,
                  "complete" : this.complete_thread,
                  "error"    : this.error_thread
                };

  this.kernel = function( thread, from, to ){
    var local_context = context;
    for( var n=from;n<to;n++ ){
      try{
        var result = local_context["kernel"]( local_context["list"][n] );
        local_context["results"][n]   = result;
        local_context["complete"][n]  = true;
        local_context["error"][n]     = true;
      }catch( err ){
        System.println( err + " (" +err.lineNumber+ " " + err.fileName + ")" );
        local_context["results"][n]   = false;
        local_context["complete"][n]  = true;
        local_context["error"][n]     = ( err + " (" +err.lineNumber+ " " + err.fileName + ")" );
      }
    }
  };

}

/**
 * The completion state of all the threads.
 * @name $.oThread#complete
 * @type {bool}
 */
Object.defineProperty(oThread.prototype, 'complete', {
    get : function(){
        if( !this.started ){
          System.println( "Not yet started" );
          return false;
        }

        for( var n=0;n<this.complete_thread.length;n++ ){
          if( !this.complete_thread[n] ){
            return false;
          }
        }

        return true;
    }
});

/**
 * The indices that have completed results.
 * @name $.oThread#completedIndices
 * @type {int[]}
 */
Object.defineProperty(oThread.prototype, 'completedIndices', {
    get : function(){
        var indices = [];
        for( var n=0;n<this.complete_thread.length;n++ ){
          if( this.complete_thread[n] ){
            indices.push( n );
          }
        }

        return indices;
    }
});

/**
 * The errors, if any, in form { "index" : int, "error" : string }
 * @name $.oThread#errorsWithIndex
 * @type {object[]}
 */
Object.defineProperty(oThread.prototype, 'errorsWithIndex', {
    get : function(){
        var errors = [];
        for( var n=0;n<this.error_thread.length;n++ ){
          if( this.error_thread[n] ){
            errors.push( { "index" : n, "error":this.error_thread[n] } );
          }
        }

      return errors;
    }
});

/**
 * The results, if any, in form { "index" : int, "results" : object }
 * @name $.oThread#resultsWithIndex
 * @type {object[]}
 */
Object.defineProperty(oThread.prototype, 'resultsWithIndex', {
    get : function(){
        var results = [];
        for( var n=0;n<this.results_thread.length;n++ ){
          if( this.results_thread[n] ){
            results.push( { "index" : n, "results":this.results_thread[n] } );
          }
        }

      return results;
    }
});

/**
 * The errors, matching index of input list.
 * @name $.oThread#errors
 * @type {string[]}
 */
Object.defineProperty(oThread.prototype, 'errors', {
    get : function(){
      return this.error_thread;
    }
});

/**
 * The errors, matching index of input list.
 * @name $.oThread#results
 * @type {object[]}
 */
Object.defineProperty(oThread.prototype, 'results', {
    get : function(){
      return this.results_thread;
    }
});


/**
 * Start the thread and block if necessary.
 * @param   {bool}         block                    Whether the process should block and wait for completion.
 */
oThread.prototype.start = function( block ){
  if (typeof block === 'undefined') block = true;

  if( !this.threads_available ){
    if( !this.prepareThreads() ){
      return;
    }
  }

  for( var n=0;n<this.threads.length;n++ ){
    // System.println( "THREAD STARTING: " + n );
    if( this.started_thread[ n ] ){
      continue;
    }

    this.threads[n].start( 0 );
    QCoreApplication.processEvents();

    this.started_thread[ n ] = true;
  }

  this.started = true;

  if( block ){
    this.wait();
  }
}


/**
 * If threads are not yet prepared, this will prepare them.
 * @param   {bool}         [block]                    Whether the process should block and wait for completion.
 */
oThread.prototype.prepareThreads = function( start ){
  if (start) this.startAtInstantiation = start;

  if( this.threads_available ){
    return false;
  }

  try{
    for( var thread_num=0;thread_num<this.threadCount;thread_num++ ){
      this.started_thread.push( false );

      var from_val  = Math.floor( ( thread_num / this.threadCount ) * this.list.length );
      var to_val    = Math.floor( ( (thread_num+1) / this.threadCount ) * this.list.length );

      if( this.reserveThread && thread_num == this.threadCount-1 ){
        this.reservedThread = eval( 'kernel = function(){ this.kernel('+thread_num+', '+from_val+','+to_val+') }'  );
        continue;
      }

      this.threads.push( new QTimer() );
      this.threads[thread_num].singleShot = true;
      this.threads[thread_num]["timeout"].connect( this, eval( 'kernel = function(){ this.kernel('+thread_num+', '+from_val+','+to_val+') }'  ) );

      if( this.startAtInstantiation ){
        this.threads[thread_num].start(0);
        QCoreApplication.processEvents();
        this.started = true;
        this.started_thread[ thread_num ] = true;
      }
    }
  }catch(err){
    System.println( err + " (" +err.lineNumber+ " " + err.fileName + ")" );
  }

  this.threads_available    = true;
  return true;
}


/**
 * If started, will block until completion or timeout.
 * @param   {int}         block_time                    The MS time to block.
 */
oThread.prototype.wait = function( block_time ){
    if ( block_time ) this.timeout = block_time;

    if( this.reserveThread && this.reservedThread ){
      this.reservedThread();
    }

    if( !this.started ){
      return;
    }

    var start_time = (new Date()).getTime();
    var curr_time  = (new Date()).getTime();

    var completed  = false;
    while( (curr_time - start_time) < this.timeout ){
      QCoreApplication.processEvents();
      if( this.complete ){
        completed = true;
        break;
      }
      curr_time  = (new Date()).getTime();
    }
}

/**
 * If started, will block until completion or timeout.
 */
oThread.prototype.runSingleThreaded = function( ){
  this.started = true;
  for( var n=0;n<this.list.length;n++ ){
    this.kernel( 0, n, n+1 );
  }
}

exports.oThread = oThread;