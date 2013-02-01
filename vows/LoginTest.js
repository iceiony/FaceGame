var vows = require('vows'),
    assert = require('assert'),
    routeInTest = require('../routes/login'),
    sinon = require('sinon'),

    resMock = { render: sinon.stub() },
    reqMock = {body: {}, session:{} },
    next = sinon.stub(),

    makeTest = function () {
        routeInTest.login(reqMock, resMock, next);
        return {
            viewName: resMock.render.args[0][0],
            local: resMock.render.args[0][1]
        };
    };

vows.describe('Generating a page for a specific player').addBatch({
    'when accessing site root with no user email': {
        topic: function () {
            return makeTest();
        },
        'will be prompted to login': function (topic) {
            assert.strictEqual(topic.viewName, "login");
        }
    },
    'when accessing the site root with a user email': {
        topic: function () {
            reqMock.body.email = "ionita.adri@googlemail.com";
            return makeTest();
        },
        'the next matching route should be called': function (topic) {
            assert.equal(next.called, true);
        },
        'the session quizQuestions queue should be created': function(topic){
            assert(reqMock.session.quizQuestions);
        }
    }
}).export(module); // Run it