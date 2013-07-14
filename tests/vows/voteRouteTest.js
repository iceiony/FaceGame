var vows       = require ( 'vows' ),
    assert     = require ( 'assert' ),
    sinon      = require ( 'sinon' ),
    proxyquire = require ( 'proxyquire' ).noCallThru (),

    dependencies = {
        '../engine/voting': { vote: sinon.stub()}
    },
    routeInTest = proxyquire ( '../routes/vote' , dependencies ),

    reqMock = {
        headers : {} ,
        session : {   },
        params  : {user : "ionita.adri" , voted : 'a'}
    },
    resMock = { redirect : sinon.stub () },
    runRoute = function () {
        routeInTest.vote ( reqMock , resMock );
        return {
            viewName : resMock.render.args[0][0] ,
            local    : resMock.render.args[0][1]
        };
    };

vows.describe ( 'Voting in the quiz' ).addBatch ( {
    'When a user clicks on a vote link for a quiz' : {
        topic                                                          : function () {
            dependencies['../engine/voting'].vote.yields(null, { score: 11, voteScore: 1 }) ;
            return runRoute ();
        } ,
        'the voting module is invoked'                                 : function ( topic ) {
             assert( dependencies['../engine/voting'].vote.called);
        } ,

        "the user is redirected to the quiz page with the user's name" : function ( topic ) {
            assert ( resMock.redirect.called );
            assert.strictEqual ( resMock.redirect.args[0][0] , "/quiz/ionita.adri" );
        }
    }
} ).addBatch ( {
    "When the request is a json one" : {
        topic                                                            : function () {
            reqMock.isJson = true;
            resMock.redirect.reset ();
            resMock.json = sinon.spy ();
            dependencies['../engine/voting'].vote.yields(null, { score: 11, voteScore: 1 }) ;
            return runRoute ();
        } ,
        'a redirect should no longer happen'                             : function ( topic ) {
            assert ( ! resMock.redirect.called );
        } ,
        'the response should be json'                                    : function ( topic ) {
            assert ( resMock.json.called );
        } ,
        'the response should contain the player current score'           : function ( topic ) {
            assert.equal ( resMock.json.args[0][1].score , 11 );
        } ,
        'the response should contain the latest addition to the score '  : function ( topic ) {
            assert.equal ( resMock.json.args[0][1].voteScore , 1 );
        } ,
        'the response should contain the link to generate the next quiz' : function ( topic ) {
            assert.strictEqual ( resMock.json.args[0][1].quizLink , "/quiz/ionita.adri" );
        }
    }
} ).addBatch ( {
    "When there is no question to vote for" : {
        topic                                : function () {
            reqMock.isJson = false;
            resMock.redirect.reset ();
            resMock.json = sinon.spy ();
            console.log = sinon.spy();
            dependencies['../engine/voting'].vote.yield({message:"No existing quiz to vote against"},null);
            return runRoute ();
        } ,
        'the request should be redirected' : function ( topic ) {
            assert ( resMock.redirect.called );
        }
    }
} ).export ( module );