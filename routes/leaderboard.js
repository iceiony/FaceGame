/*
 * ALL leader board
 */

var assert      = require ( 'assert' )        ,
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server,
    userData;

exports.leaderboard = function ( req , res ) {
    var mongoClient = new MongoClient ( new MongoServer ( settings.host , settings.port ) , {w : 1} ),
        userList = [];

    mongoClient.open (
        function ( err , mongoClient ) {
            assert.equal(null,err);

            var userData = mongoClient.db ( 'FaceGame' ).collection ( 'UserData' );

            userData.ensureIndex ( "score" ,
                function ( error , index ) {
                    if ( error ) throw error;
                } );

            userData.find ( {} ,
                {
                    "limit" : 10 ,
                    "sort"  : [ ['score', 'desc'] ]
                } ,
                function ( err , records ) {
                    assert.equal ( null , err );
                    mongoClient.close();

                    records.each (
                        function ( err , record ) {
                            if ( record == null ) {

                                res.render ( 'leaderboard' , {
                                    title : "FaceGame Leaderboard" ,
                                    users : userList
                                } );
                            }
                            else {
                                userList.push ( record );
                            }
                        } );
                } );
        }
    );
};