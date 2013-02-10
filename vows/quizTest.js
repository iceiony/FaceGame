var vows = require('vows'),
    assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon'),
    mockHelper = require('./helper/mockHelper'),

    routeInTest = proxyquire('../routes/quiz',
        {
           'mongodb': mockHelper.mongoStub({findOne: sinon.stub().yields(null,{score:10})}),
            '../engine/quizEngine': {
            QuizEngine: {
                generateQuestion: sinon.stub()
                    .returns({
                        imageName: "randomImagePath.jpg",
                        options: ['Koala', 'Kooala', 'Cooala'],
                        points:{ 'Koala': 10, 'Kooala': 0, 'Cooala': -10 }
                    })
            }
        }})({host:'localhost',port:27017})  ,
    reqMock = { params:{user:"ionita.adri"}, session: { quizQuestions: { push: sinon.stub() } },headers : {}},
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
        },
        "it should return the player's current score": function(topic){
           assert.equal(topic.local.score,10);
        }
    }}).addBatch({
    "when invoked by a request that accepts json": {
        topic : function(topic){
            reqMock.isJson = true;
            resMock.json = sinon.spy();
            return makeTest();
        },
        "it should respond with a json object" : function(topic){
            assert(resMock.json.called);
        },
        "it should contain the image url": function(topic){
            assert(resMock.json.args[0][1].imageSrc);
        },
        "it should contain the links to vote": function(topic){
            assert(resMock.json.args[0][1].links);
            assert.equal(resMock.json.args[0][1].links.length,3);
        },
        "it shoudl not return the player's score": function(topic){
            assert(!resMock.json.args[0][1].score);
        }
    }
}).export(module);