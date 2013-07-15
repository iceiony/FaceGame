var assert          = require('assert'),
    sinon           = require('sinon'),
    proxyquire      = require('proxyquire').noCallThru(),
    dependencies    = {
        'mongodb'         : {MongoClient: sinon.mock(), Server:sinon.stub()},
        '../util/settings': {dbSettings: sinon.mock()}
    };

describe('Anonymous user voting',function(){
    var subject       = proxyquire('../../engine/voting',dependencies);



    describe("When an user with name prefixed by 'anonymous' votes for a quiz and has no score",function(){
        var fakeQuestions = [{options: ['a', 'b', 'c'],points: {'a': 1, 'b': 2, 'c': 0}}],
            callback      = sinon.stub(),
            result        = subject.vote('anonymous.123',{quizQuestions:fakeQuestions},'a',callback);

        it('should return a score equal to the last vote',function(){
            assert(callback.called);
            assert(callback.args[0][1]);
            assert(! callback.args[0][0] ,"no error should be returned");
            assert.equal(callback.args[0][1].score, 1);
        });

        it('should NOT persist the score to the DB',function(){
            assert(! dependencies['mongodb'].MongoClient.called, "Should not try to persist to db");
        });
    });

    describe("When an user with name prefixed by 'anonymous' votes for a quiz and has score",function(){
        var data = {quizQuestions:[{options: ['a', 'b', 'c'],points: {'a': 1, 'b': 2, 'c': 0}}], totalScore : 10},
            callback      = sinon.stub(),
            result        = subject.vote('anonymous.123',data,'a',callback);

        it('should return a score equal to the last score plus the vote score',function(){
            assert.equal(callback.args[0][1].score, 11);
        });
    });
});
