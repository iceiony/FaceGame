var child_process = require ( 'child_process' ),
    runAsSeparateProcess;

runAsSeparateProcess = function () {
    var assert = require ( 'assert' ),
        path = require ( 'path' ),
        fs = require ( 'fs' ),
        uploadPath = process.env.MonitorPath,
        fp = require ( './file-processing' ),
        peekForProcess = function ( uploadPath ) {
            fs.readdir ( uploadPath , function ( err , files ) {
                assert.equal ( null , err );
                files.forEach ( function ( file ) {
                    console.log ( 'Processing ' + file );
                    if ( file.lastIndexOf ( ".jpg" ) >= 0 || file.lastIndexOf ( ".png" ) >= 0 || file.lastIndexOf ( ".gif" ) >= 0 ) {
                        fp.processFile ( path.join ( uploadPath , file ) );
                    }
                } );
            } );
        };

    peekForProcess ( uploadPath );
    setInterval ( peekForProcess , 60 * 10 * 1000 , uploadPath );
};

exports.monitor = function ( uploadPath ) {
    return child_process.fork ( "./engine/folder-watch" , [] , {env : {isChildProcess : true , MonitorPath : uploadPath}} );
};

if ( typeof process.env.isChildProcess !== 'undefined' && process.env.isChildProcess ) {
    runAsSeparateProcess ();
}