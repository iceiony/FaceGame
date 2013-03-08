var path = require ( 'path' ),
    assert = require ( 'assert' ),
    fs = require ( 'fs' ),
    crypto = require ( 'crypto' ),

    supportedExtensions = ['jpg', 'png', 'gif'],
    faceData;

//adds spaces before all upper case letters and then splits by ['.', '_', ' ']
var _extractPersonName = function ( fileName ) {
        var fileParts         = fileName.replace ( /([A-Z])/g , ' $1' ).trim ().split ( /[\s\.\-_]/g ),
            hasImageExtension = supportedExtensions.indexOf ( fileParts[fileParts.length - 1] ) >= 0;

        if ( hasImageExtension )  fileParts.pop ();

        fileParts.forEach (
            function ( part , index ) {
                if ( part.length > 0 ) {
                    fileParts[index] = part[0].toUpperCase () + part.slice ( 1 );
                }
            } );

        return fileParts.join ( ' ' );
    },

    _upsertRecord = function ( personName , pictureName , callback ) {

        faceData.update (
            {name : personName } ,
            {$push : {pictures : pictureName}} ,
            {upsert : true , w : 1} ,
            function ( err , result ) {
                assert.equal ( null , err );

                console.log ( "Updated " + personName );
                if ( typeof callback != "undefined" ) {
                    process.nextTick ( callback );
                }
            } );

    };


exports.setDataCollection = function(dataCollection){
    faceData = dataCollection;
}

exports.processFile = function ( inputPath , callback ) {
    console.log ( "location : " + inputPath );

    crypto.randomBytes ( 40 ,
        function ( err , buf ) {
            assert.equal ( null , err );

            var fileName = inputPath.substring ( inputPath.lastIndexOf ( path.sep ) + 1 ),
                fileExtension = fileName.substring ( fileName.lastIndexOf ( "." ) ),
                newFileName = buf.toString ( 'hex' ) + fileExtension;

            fs.link ( inputPath , path.join ( "./public/images/" , newFileName ) ,
                function ( err ) {
                    assert.equal ( null , err );

                    fs.unlink ( inputPath , function ( err ) {
                        assert.equal ( null , err );

                        _upsertRecord (
                            _extractPersonName ( fileName ) ,
                            newFileName ,
                            callback )
                    } );
                } );
        } );
};

