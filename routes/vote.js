var assert      = require ( 'assert' ),
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server;

exports.vote = function ( req , res ) {
    var quizQuestion = req.session.quizQuestions[0],
        mongoServer  = new MongoClient ( new MongoServer ( settings.host , settings.port ) , {w : 1} );

    req.session.quizQuestions = req.session.quizQuestions.slice ( 1 ); //pop it off the queue

    mongoServer.open (
        function ( err , mongoClient ) {
            assert.equal ( null , err );

            var userData = mongoClient.db ( 'FaceGame' ).collection ( 'UserData' );

            userData.findAndModify (
                {username : req.params.user } ,
                [] ,
                {$inc : {score : quizQuestion.points[req.params.voted]}} ,
                {upsert : true , w : 1} ,
                function ( err , record ) {
                    assert.equal ( null , err );

                    mongoClient.close();
                    if ( req.isJson ) {
                        res.json ( 200 , {
                            score     : ( record.score || 0 ) + quizQuestion.points[req.params.voted] ,
                            voteScore : quizQuestion.points[req.params.voted] ,
                            quizLink  : "/quiz/" + req.params.user
                        } )
                    }
                    else {
                        res.redirect ( "/quiz/" + req.params.user );
                    }
                } );
        } )
};
