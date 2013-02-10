/*
 * ALL home page.
 */
var engine = require('../engine/quizEngine'),
    path = require('path'),
    mongo = require('mongodb'),
    assert = require('assert'),
    userData,

    quizHandler = function (req, res) {
        var userName = req.params.user,
            quizQuestion = engine.QuizEngine.generateQuestion(),
            userLinks = [],
            i,
            length;

        for (i = 0, length = quizQuestion.options.length; i < length; i++) {
            userLinks.push({
                //href "/user/ionita.adri/vote/Koala"
                href: ["/user/", userName, "/vote/", quizQuestion.options[i]].join(''), text: quizQuestion.options[i]
            });
        }

        //why queue you ask ?  so that we can generate and store on client side multiple quiz questions in advance.
        req.session.quizQuestions.push(quizQuestion);

        if (req.isJson) {
            res.json(200, {
                imageSrc: "/images/" + quizQuestion.imageName,
                links: userLinks
            })
        }
        else {
            userData.findOne({username:userName},function(err,record){
                assert.equal(null,err);
                res.render('quiz', {
                    title: "FaceGame",
                    imageSrc: "/images/" + quizQuestion.imageName,
                    score: record?record.score:0,
                    links: userLinks});
            });
        }
    };


module.exports = function (dbSettings) {
    new mongo.Db("FaceGame", new  mongo.Server(dbSettings.host,dbSettings.port), {w: 1})
        .open(function (error, client) {
            if (error) throw error;
            userData = new mongo.Collection(client, "UserData");
        });

    return  {
        quiz : quizHandler
    }
}