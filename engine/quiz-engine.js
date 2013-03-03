var assert       = require ( 'assert' ),
    mongoServer  = require ( '../util/settings' ).MongoServer,
    MongoClient  = require ( 'mongodb' ).MongoClient,
    EventEmitter = require ( 'events' ).EventEmitter;


var __selectRandomDoc = function ( callback ) {
    var collection = this,
        randomNr   = Math.floor ( collection._counted * Math.random () );

    collection.findOne ( {} , {limit : - 1 , skip : randomNr} ,
        function ( err , doc ) {
            callback ( err , doc );
        } );

};


var _select3Records = function ( faceData , emitter ) {
        return function () {
            var records = [],
                names   = [];

            faceData._selectRandom (
                function ( err , doc ) {
                    emitter.emit ( 'document retrieved' , doc )
                } );

            emitter.on ( 'document retrieved' ,
                function ( doc ) {

                    if ( names.indexOf ( doc.name ) < 0 ) {
                        records.push ( doc );
                        names.push ( doc.name );
                    }

                    if ( records.length < 3 ) {
                        faceData._selectRandom ( function ( err , doc ) {
                            emitter.emit ( 'document retrieved' , doc );
                        } );
                    }
                    else {
                        emitter.emit ( 'records retrieved' , records );
                    }
                } );
        };
    },
    _makeQuizFromRecords = function ( emitter ) {
        return function ( records ) {
            var randomIndex        = Math.floor ( records.length * Math.random () ),
                randomPictureIndex = Math.floor ( records[randomIndex].pictures.length * Math.random () ),
                quizQuestion       = {
                    imageName : records[randomIndex].pictures[randomPictureIndex] ,
                    options   : [] ,
                    points    : {}
                };

            records.forEach ( function ( record ) {
                quizQuestion.options.push ( record.name );
                quizQuestion.points[record.name] = - 5;
            } );
            quizQuestion.points[records[randomIndex].name] = 10;

            emitter.emit ( 'quiz created' , quizQuestion );
        }
    };


exports.generateQuestion = function ( callback ) {
    //create a new mongo connection
    var mongoClient = new MongoClient ( mongoServer , {w : 1} );

    //open the connection
    mongoClient.open (
        function ( err , mongoClient ) {

            var emitter = new EventEmitter (),
                faceData = mongoClient.db ( 'FaceGame' ).collection ( 'FaceData' );

            faceData.count (
                function ( err , count ) {
                    if ( count < 3 ) {
                        process.nextTick (
                            function () {
                                callback ( {message : 'DB has less than 3 records to generate a quiz'} , null );
                            } );
                        return;
                    }
                    faceData._counted = count;
                    faceData._selectRandom = __selectRandomDoc;
                    emitter.emit ( 'counted' , count );
                } );

            emitter.on ( 'counted' , _select3Records ( faceData , emitter ) );
            emitter.on ( 'records retrieved' , _makeQuizFromRecords ( emitter ) );

            emitter.on ( 'quiz created' ,
                function ( quizQuestion ) {
                    mongoClient.close ();
                    callback ( null , quizQuestion );
                } );
        } );
};