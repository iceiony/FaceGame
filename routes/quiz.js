/*
 * ALL home page.
 */

var assert = require ( 'assert' ),
    engine = require ( '../engine/quiz-engine' ),

    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server;


var _getScore = function ( userName , callback ) {
        var mongoClient = new MongoClient ( new MongoServer ( settings.host , settings.port ) );

        mongoClient.open (
            function ( err , mongoClient ) {
                assert.equal ( null , err );

                var userData = mongoClient.db ( 'FaceGame' ).collection ( 'UserData' );

                userData.findOne (
                    {username : userName} ,
                    function ( err , record ) {
                        assert.equal ( null , err );

                        mongoClient.close ();
                        callback ( record ? record.score : 0 );
                    } );
            } );

    },
    _makeResponse = function ( req , res , quizQuestion ) {
        var userName = req.params.user,
            userLinks = [];

        quizQuestion.options.forEach (
            function ( option ) {
                userLinks.push (
                    {
                        //href "/user/ionita.adri/vote/Koala"
                        href : ["/user/", userName, "/vote/", option].join ( '' ) ,
                        text : option
                    } );
            } );

        if ( req.isJson ) {
            res.json ( 200 , {
                links    : userLinks,
                imageSrc : "/images/" + quizQuestion.imageName
            } )
        }
        else {

            _getScore ( userName ,
                function ( score ) {
                    res.render ( 'quiz' , {
                        title    : "FaceGame" ,
                        score    : score ,
                        links    : userLinks,
                        imageSrc : "/images/" + quizQuestion.imageName
                    } );
                } );
        }
    };

exports.quiz = function ( req , res ) {

    if ( ! req.isJson && req.session.quizQuestions.length > 0 ) {
        _makeResponse ( req , res , req.session.quizQuestions[0] );
        return;
    }

    if ( req.isJson && req.session.quizQuestions.length > 1 ) {
        _makeResponse ( req , res , req.session.quizQuestions[1] );
        return;
    }

    engine.generateQuestion ( function ( err , quizQuestion ) {
        req.session.quizQuestions.push ( quizQuestion );
        _makeResponse ( req , res , quizQuestion );
    } );


};