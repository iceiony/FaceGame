var vows = require('vows'),
    assert = require('assert'),
    proxyquire = require('proxyquire').noCallThru(),
    sinon = require('sinon'),
    mockHelper = require('./helper/mockHelper'),

    dependencies = {
        'mongodb': mockHelper.mongoStub({findOne: sinon.stub().yields(null, {score: 10})}),
        '../engine/quizEngine': function (settings) {
            return{
                generateQuestion: sinon.stub()
                    .yields(null, {
                        imageName: "randomImagePath.jpg",
                        options: ['Koala', 'Kooala', 'Cooala'],
                        points: { 'Koala': 10, 'Kooala': 0, 'Cooala': -10 }
                    })
            };
        }
    }
routeInTest = proxyquire('../routes/quiz', dependencies)({host: 'localhost', port: 27017})

makeTest = function (req, res) {
    routeInTest.quiz(req, res);
    return {
        viewName: res.render.args[0] ? res.render.args[0][0] : null,
        local: res.render.args[0] ? res.render.args[0][1] : null,
        request: req,
        response: res
    };
};


vows.describe('Generating a page for a specific player').addBatch({
    "when invoking the index route with the user's email in the body": {
        topic: function () {
            var req = { params: {user: "ionita.adri"}, session: { quizQuestions: { push: sinon.stub() } }, headers: {}},
                res = { render: sinon.stub() };

            return makeTest(req, res);
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
        "the quiz question should be queued up in the session": function (topic) {
            assert(topic.request.session.quizQuestions.push.calledOnce);
        },
        "the queued question should have options": function (topic) {
            assert(topic.request.session.quizQuestions.push.args[0][0].options);
        },
        "the queued question should have the points received for each answer": function (topic) {
            var quizQuestion = topic.request.session.quizQuestions.push.args[0][0];
            assert.equal(quizQuestion.points['Koala'], 10);
            assert.equal(quizQuestion.points['Kooala'], 0);
            assert.equal(quizQuestion.points['Cooala'], -10);
        },
        "it should return the player's current score": function (subTopic) {
            assert.equal(subTopic.local.score, 10);
        }
    },
    "when a quiz question is already queued and the request is not json": {
        topic: function () {
            var req = { params: {user: "ionita.adri"}, session: { quizQuestions: [
                    {
                        imageName: "existingImage.jpg",
                        options: ['Koala', 'Kooala', 'Cooala'],
                        points: { 'Koala': 10, 'Kooala': 0, 'Cooala': -10 }
                    }
                ] }, headers: {}},
                res = { render: sinon.stub() };

            req.session.quizQuestions.push = sinon.spy();
            return makeTest(req, res);
        },
        "then it should return the first question": function(topic){
            assert(topic.local.imageSrc.indexOf("existingImage.jpg")>=0);
        },
        "it should not generate a new question": function(topic){
            assert(!topic.request.session.quizQuestions.push.called);

        }

    },
    "when invoked by a request that accepts json": {
        topic: function () {
            var req = { params: {user: "ionita.adri"}, session: { quizQuestions: { push: sinon.stub() } }, headers: {}},
                res = { render: sinon.stub() };
            req.isJson = true;
            res.json = sinon.spy();

            return makeTest(req, res);
        },
        "it should respond with a json object": function (topic) {
            assert(topic.response.json.called);
        },
        "it should contain the image url": function (topic) {
            assert(topic.response.json.args[0][1].imageSrc);
        },
        "it should contain the links to vote": function (topic) {
            assert(topic.response.json.args[0][1].links);
            assert.equal(topic.response.json.args[0][1].links.length, 3);
        },
        "it shoudl not return the player's score": function (topic) {
            assert(!topic.response.json.args[0][1].score);
        }
    }
}).export(module);