var vows       = require ( 'vows' ),
    assert     = require ( 'assert' ),
    sinon      = require ( 'sinon' ),
    mockHelper = require ( '././mock-helper' ),
    proxyquire = require ( 'proxyquire' ).noCallThru (),

    dependencies = {
        'mongodb'          : mockHelper.mongoStub ( {findAndModify : sinon.stub ().yields ( null , {score : 10} )} ) ,
        '../util/settings' : {dbSettings : sinon.mock ()}
    },
    voting = proxyquire ( '../engine/voting' , dependencies ),

    data = {
        quizQuestions: [
            {
                options: ['a', 'b', 'c'],
                points: {'a': 1, 'b': 2, 'c': 0}
            },
            {
                options: ['x', 'y', 'z'],
                points: {'x': 1, 'y': 2, 'z': 0}
            }
        ]},
    callback = sinon.stub();

vows.describe ( 'Voting in the quiz' ).addBatch ( {
    'When a vote is executed for a user' : {
        topic                                                                        : function () {

            voting.vote("ionita.adri",data,'a', callback);
            return {};
        } ,
        'a quiz is removed from the queue of quizzes'                                : function ( topic ) {
            assert.equal ( data.quizQuestions.length , 1 );
            assert.strictEqual ( data.quizQuestions[0].options[0] , 'x' ,
                'The wrong question was removed from queue' );
        } ,

        "result is returned via the callback"                                        : function ( topic ) {
            assert( callback.called );
        } ,

        "the error on the callback should be null"                                   : function ( topic ) {
            assert( ! callback.args[0][0] );
        } ,

        'the result should contain the player old score'                         : function ( topic ) {
            assert.equal ( callback.args[0][1].score , 11 );
        } ,

        'the result should contain the latest addition to the score '                : function ( topic ) {
            assert.equal ( callback.args[0][1].voteScore , 1 );
        } ,

        "the user's score is upserted in the db"                                     : function ( topic ) {
            var mongoUpdate = dependencies.mongodb.Collection.findAndModify,
                parameters = mongoUpdate.args[0];

            assert ( mongoUpdate.called );
            assert.strictEqual ( parameters[0].username , "ionita.adri" );
            assert ( parameters[3].upsert );
        }
    }
}).addBatch({
    "When there is no question to vote for" : {
            topic                                                               : function () {
            data.quizQuestions = [  ];
            callback.reset();
            voting.vote("ionita.adri",data,'a', callback);
            return {};
        } ,
        'an error message should be returned to the callback'                   : function ( topic ) {
            assert ( callback.called );
            assert ( callback.args[0][0] );
        }
    }
} ).export ( module );