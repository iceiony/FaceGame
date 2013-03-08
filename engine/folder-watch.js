var child_process = require ( 'child_process' );

var _runAsSeparateProcess = function () {
    var assert = require ( 'assert' ),
        path   = require ( 'path' ),
        fs     = require ( 'fs' ),
        fp     = require ( './file-processing' ),

        settings    = require ( '../util/settings' ).dbSettings,
        MongoClient = require ( 'mongodb' ).MongoClient,
        MongoServer = require ( 'mongodb' ).Server;


    var uploadPath     = process.env.MonitorPath,
        fileExtension  = ['jpg', 'png', 'gif'],

        isImageFile    = function ( fileName ) {
            var extension = Array.prototype.splice.call ( fileName , fileName.lastIndexOf ( '.' ) + 1 ).join ( '' );
            return fileExtension.indexOf ( extension ) >= 0;
        },

        peekForProcess = function ( uploadPath ) {
            fs.readdir ( uploadPath ,
                function ( err , files ) {
                    assert.equal ( null , err );

                    files.forEach (
                        function ( file ) {
                            console.log ( 'Processing ' + file );
                            if ( isImageFile ( file ) ) {
                                fp.processFile ( path.join ( uploadPath , file ) );
                            }
                        } );

                } );
        };


    //initial setup ( single mongo connection )
    var mongoClient = new MongoClient ( new MongoServer ( settings.host , settings.port ) , {w : 1} );

    mongoClient.open (
        function ( err , mongoClient ) {
            assert.equal ( null , err );

            var faceData = mongoClient.db ( 'FaceGame' ).collection ( 'FaceData' );

            fp.setDataCollection(faceData);
            peekForProcess ( uploadPath );
            //peek for  changes every 10 minutes
            setInterval ( peekForProcess , 60 * 10 * 1000 , uploadPath );

        });
};

exports.monitor = function ( uploadPath ) {
    return child_process.fork (
        "./engine/folder-watch" ,
        [] ,
        {
            env : {
                isChildProcess : true ,
                MonitorPath    : uploadPath}
        }
    );
};

if ( typeof process.env.isChildProcess !== 'undefined'
    && process.env.isChildProcess ) {

    _runAsSeparateProcess ();

}