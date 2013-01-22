var vows = require('vows'),
    assert = require('assert'),
    proxyquire = require('proxyquire'),
    engineMock = {
        generateQuestion: function () {
            return  {
                imageName: "randomImagePath.jpg",
                options: ['Koala', 'Kooala', 'Cooala']
            };
        }
    },
    routes = proxyquire('../routes/index',
        {'../engine/quizEngine': {
            QuizEngine: engineMock,
            '@noCallThru': true
        }});


vows.describe('Generating a page for a specific player').addBatch({
    "when invoking the index route with the user's email": {
        topic: function () {
            var reqMock = {
                    body: {
                        email: "ionita.adri@googlemail.com"
                    }},
                resMock = {
                    render: function () {
                        this.viewName = arguments[0];
                        this.local = arguments[1];
                    }};

            routes.index(reqMock, resMock);
            return resMock;
        },
        'should use the index view': function (topic) {
            assert.strictEqual(topic.viewName, "index");
        },
        'should populate the picture path': function (topic) {
            assert.notEqual(typeof topic.local.imageSrc, "undefined");
        },
        "should generate the response option links": function (topic) {
            assert.notEqual(typeof topic.local.links, "undefined");
        },
        "the links should contain the user's name as reference": function (topic) {
            assert(topic.local.links[0].href.indexOf("ionita.adri") >= 0);
        },
        "the link should not contain the email": function (topic) {
            assert(topic.local.links[0].href.indexOf("ionita.adri@googlemail.com") < 0);
        },
        "the link should contain the option text": function(topic){
            assert(topic.local.links[0].text == "Koala");
        }
    }
}).export(module);