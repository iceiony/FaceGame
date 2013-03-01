/*
 * ALL home page.
 */

var assert = require ( 'assert' ),
    quizEngine = require ( '../engine/quiz-engine' ),

    dbSettings = require ( '../util/settings' ).dbSettings,
    mongo = require ( 'mongodb' ),
    userData,

    _respondWith = function ( req , res , quizQuestion ) {
        var userName = req.params.user,
            userLinks = [],
            i,
            length;

        for ( i = 0, length = quizQuestion.options.length ; i < length ; i ++ ) {
            userLinks.push ( {
                //href "/user/ionita.adri/vote/Koala"
                href : ["/user/", userName, "/vote/", quizQuestion.options[i]].join ( '' ) , text : quizQuestion.options[i]
            } );
        }

        if ( req.isJson ) {
            res.json ( 200 , {
                imageSrc : "/images/" + quizQuestion.imageName ,
                links    : userLinks
            } )
        }
        else {
            userData.findOne ( {username : userName} , function ( err , record ) {
                assert.equal ( null , err );
                res.render ( 'quiz' , {
                    title    : "FaceGame" ,
                    imageSrc : "/images/" + quizQuestion.imageName ,
                    score    : record ? record.score : 0 ,
                    links    : userLinks} );
            } );
        }
    };

exports.quiz = function ( req , res ) {
    if ( ! req.isJson && req.session.quizQuestions.length > 0 ) {
        _respondWith ( req , res , req.session.quizQuestions[0] );
    }
    else {
        quizEngine.generateQuestion ( function ( err , quizQuestion ) {
            req.session.quizQuestions.push ( quizQuestion );
            _respondWith ( req , res , quizQuestion );
        } );
    }
};


new mongo.Db ( "FaceGame" , new mongo.Server ( dbSettings.host , dbSettings.port ) , {w : 1} )
    .open ( function ( error , client ) {
        if ( error ) throw error;
        userData = new mongo.Collection ( client , "UserData" );
    } );
