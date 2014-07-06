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

                    records.each (
                        function ( err , record ) {
                            if ( record == null ) {
                                mongoClient.close();
                                
                                if(req.isJson){
                                    res.json(200,userList)
                                }
                                else
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