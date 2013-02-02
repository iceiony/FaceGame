var vows = require('vows'),
    assert = require('assert'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon'),

    routeInTest = proxyquire('../routes/quiz',
        {'../engine/quizEngine': {
            '@noCallThru': true,
            QuizEngine: {
                generateQuestion: sinon.stub()
                    .returns({
                        imageName: "randomImagePath.jpg",
                        options: ['Koala', 'Kooala', 'Cooala'],
                        points:{ 'Koala': 10, 'Kooala': 0, 'Cooala': -10 }
                    })
            }
        }})  ,
    reqMock = { body: { email: "ionita.adri@googlemail.com" }, session: { quizQuestions: { push: sinon.stub() } }},
    resMock = { render: sinon.stub() },

    makeTest = function () {
        routeInTest.quiz(reqMock, resMock);
        return {
            viewName: resMock.render.args[0][0],
            local: resMock.render.args[0][1]
        };
    };


vows.describe('Generating a page for a specific player').addBatch({
    "when invoking the index route with the user's email in the body": {
        topic: function () {
            return makeTest();
        },
        'should use the quiz view': function (topic) {
            assert.strictEqual(topic.viewName, "quiz");
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
        "the link should contain the option text": function (topic) {
            assert(topic.local.links[0].text == "Koala");
        },
        "the quiz question should be queued up in the session": function(topic){
            assert(reqMock.session.quizQuestions.push.calledOnce);
        },
        "the queued question should have options": function(topic){
            assert(reqMock.session.quizQuestions.push.args[0][0].options);
        },
        "the queued question should have the points received for each answer": function(topic){
            var quizQuestion = reqMock.session.quizQuestions.push.args[0][0];
            assert.equal(quizQuestion.points['Koala'],10);
            assert.equal(quizQuestion.points['Kooala'],0);
            assert.equal(quizQuestion.points['Cooala'],-10);
        }
    }
}).export(module);