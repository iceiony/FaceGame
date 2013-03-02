var vows = require ( 'vows' ),
    assert = require ( 'assert' ),
    sinon = require ( 'sinon' ),
    mockHelper = require ( './helper/mock-helper' ),
    proxyquire = require ( 'proxyquire' ).noCallThru (),

    dependencies = {
        'mongodb' : mockHelper.mongoStub ( {
            find        : sinon.stub ().yields ( null
                , mockHelper.cursorStub ( [
                    { username : "someuser" , score : 10},
                    null
                ] )
            ) ,
            ensureIndex : sinon.stub ().yields ( null , "index" )
        } )
    },
    routeInTest = proxyquire ( '../routes/leaderboard' , dependencies ),  //the mock is for MongoServer

    resMock = { render : sinon.stub () },
    reqMock = {body : {} , session : {} },

    runRoute = function () {
        routeInTest.leaderboard ( reqMock , resMock );
        return {
//            viewName : function(){return resMock.render.args[0][0]} ,
//            local    : function(){return resMock.render.args[0][1]}
        };
    };

vows.describe ( 'Viewing the leaderboard' ).addBatch ( {
    'When viewing the leaderboard' : {
        topic : function () {
            return runRoute ();
        } ,
        /*'the leaderboard is shown': function (topic) {
         assert.strictEqual(topic.viewName, "leaderboard");
         },*/

        "the top 10 users are retrieved from the db" : function ( topic ) {
            var mongoFind = dependencies.mongodb.Collection.find,
                parameters = mongoFind.args[0];
            assert ( mongoFind.called );
            assert.strictEqual ( parameters[1].limit , 10 );
        } ,

        "the score index should be ensured" : function ( topic ) {
            var mongoIndex = dependencies.mongodb.Collection.ensureIndex,
                parameters = mongoIndex.args[0];
            assert ( mongoIndex.called );
            assert.strictEqual ( parameters[0] , "score" );
        }
    }
} ).export ( module );