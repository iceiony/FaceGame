var vows = require('vows'),
    assert = require('assert'),
    routes = require('../routes/login'),
    resMock = {
        render: function () {
            this.viewName = arguments[0];
            this.local = arguments[1];
        }},
    reqMock = {body: {}},
    next= function () {
            resMock.nextCalled = true;
    };

vows.describe('Generating a page for a specific player').addBatch({
    'when accessing site root with no user email': {
        topic: function () {
            delete reqMock.body.email;
            routes.login(reqMock, resMock,next);
            return resMock;
        },
        'will be prompted to login': function (topic) {
            assert.strictEqual(topic.viewName, "login");
        }
    }, 'when accessing the site root with a user email': {
        topic: function () {
            reqMock.body.email = "ionita.adri@googlemail.com";
            routes.login(reqMock, resMock,next);
            return resMock;
        },
        'the next matching route should be called': function (topic) {
            assert.equal(topic.nextCalled, true);
        }
    }
}).export(module); // Run it