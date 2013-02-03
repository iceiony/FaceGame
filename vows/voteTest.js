var vows = require('vows'),
    assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru(),

    dependencies = {
        'mongodb': {
            Db: function () {
                return {
                    open: function (callback) {
                        callback(null, {});
                    }
                };
            },
            Collection: function () {
                dependencies.mongodb.Collection.update = sinon.stub().yields(); //save reference for assertion
                return {
                    update: dependencies.mongodb.Collection.update
                };
            },
            Server: function () {
            }}},
    routeInTest = proxyquire('../routes/vote', dependencies)(sinon.mock()),  //the mock is for MongoServer

    reqMock = {
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
        params: {user: "ionita.adri" , voted: 'a'}
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
            var mongoUpdate = dependencies.mongodb.Collection.update,
                parameters = mongoUpdate.args[0];

            assert(mongoUpdate.called);
            assert.strictEqual(parameters[0].username, "ionita.adri");
            assert(parameters[2].upsert);
        }
    }
}).export(module);