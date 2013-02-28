var vows = require('vows'),
    assert = require('assert'),
    sinon = require('sinon'),
    mockHelper = require('./helper/mockHelper'),
    proxyquire = require('proxyquire').noCallThru(),

    dependencies = {
        'mongodb': mockHelper.mongoStub({findAndModify: sinon.stub().yields(null, {score: 10})}),
        '../util/settings': {dbSettings: sinon.mock()}
    },
    routeInTest = proxyquire('../routes/vote', dependencies),  //the mock is for MongoServer

    reqMock = {
        headers: {},
        session: {
            quizQuestions: [
                {
                    options: ['a', 'b', 'c'],
                    points: {'a': 1, 'b': 2, 'c': 0}
                },
                {
                    options: ['x', 'y', 'z'],
                    points: {'x': 1, 'y': 2, 'z': 0}
                }
            ]
        },
        params: {user: "ionita.adri", voted: 'a'}
    },
    resMock = { redirect: sinon.stub() },
    runRoute = function () {
        routeInTest.vote(reqMock, resMock);
        return {
            viewName: resMock.render.args[0][0],
            local: resMock.render.args[0][1]
        };
    };

vows.describe('Voting in the quiz').addBatch({
    'When a user clicks on a vote link for a quiz': {
        topic: function () {
            return runRoute();
        },
        'a quiz is removed from the queue of quizzes': function (topic) {
            assert.equal(reqMock.session.quizQuestions.length, 1);
            assert.strictEqual(reqMock.session.quizQuestions[0].options[0], 'x', 'The wrong question was removed from queue');
        },

        "the user is redirected to the quiz page with the user's name": function (topic) {
            assert(resMock.redirect.called);
            assert.strictEqual(resMock.redirect.args[0][0], "/quiz/ionita.adri");
        },

        "the user's score is upserted in the db": function (topic) {
            var mongoUpdate = dependencies.mongodb.Collection.findAndModify,
                parameters = mongoUpdate.args[0];

            assert(mongoUpdate.called);
            assert.strictEqual(parameters[0].username, "ionita.adri");
            assert(parameters[3].upsert);
        }
    }
}).addBatch({
        "When the request is a json one": {
            topic: function () {
                reqMock.isJson = true;
                reqMock.session.quizQuestions = [
                    {
                        options: ['a', 'b', 'c'],
                        points: {'a': 1, 'b': 2, 'c': 0}
                    }
                ];
                resMock.redirect.reset();
                resMock.json = sinon.spy();
                return runRoute();
            },
            'a redirect should no longer happen': function (topic) {
                assert(!resMock.redirect.called);
            },
            'the response should be json': function (topic) {
                assert(resMock.json.called);
            },
            'the response should contain the player current score': function (topic) {
                assert.equal(resMock.json.args[0][1].score, 11);
            },
            'the response should contain the latest addition to the score ': function (topic) {
                assert.equal(resMock.json.args[0][1].voteScore, 1);
            },
            'the response should contain the link to generate the next quiz': function (topic) {
                assert.strictEqual(resMock.json.args[0][1].quizLink, "/quiz/ionita.adri");
            }
        }
    }).export(module);