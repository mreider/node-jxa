const browserify = require( 'browserify' );
const cp = require( 'child_process' );

const HEAD = 'window = this;\nObjC.import("stdlib");\ntry {\n ';
const TAIL = ';\n} catch (e) {\n console.log( e.message );\n $.exit(1); \n}\n$.exit(0);';
const OSA_JXA_CMD = 'osascript';
const OSA_JXA_CMD_ARGS = ['-l', 'JavaScript' ];


module.exports = ( scriptFile, browserifyOptions = { debug: false } ) => {
  const b = browserify();
  b.add( scriptFile, browserifyOptions );
  b.bundle( ( error, src ) => {
    if ( !!error ) {
      console.error( error );
      process.exit( 1 );
    } else {
      let modifiedScriptCode = HEAD;
      modifiedScriptCode += src.toString();
      modifiedScriptCode += TAIL;

      let osaProcess = cp.spawn( OSA_JXA_CMD, OSA_JXA_CMD_ARGS, { stdio: [ 'pipe', 1, 2 ] } );
      osaProcess
        .on( 'exit', ( exitCode, sigTerm ) => {
          if ( !!sigTerm ) {
            console.error( `osascript process terminated by signal: ${sigTerm}`);
            process.exit( 1 );
          } else {
            process.exit( exitCode );
          }
        } );
      osaProcess
        .on( 'error', error => {
          console.error( error );
          process.exit( 1 );
        } );
      osaProcess.stdin.write( modifiedScriptCode );
      osaProcess.stdin.end();
    }
  });
}

