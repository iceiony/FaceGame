/*
 * ALL home page.
 */
var userData,
    assert = require('assert'),
    quizEngine,


    respondWith = function(req,res,quizQuestion){
        var userName = req.params.user,
            userLinks = [],
            i,
            length;

        for (i = 0, length = quizQuestion.options.length; i < length; i++) {
            userLinks.push({
                //href "/user/ionita.adri/vote/Koala"
                href: ["/user/", userName, "/vote/", quizQuestion.options[i]].join(''), text: quizQuestion.options[i]
            });
        }

        if (req.isJson) {
            res.json(200, {
                imageSrc: "/images/" + quizQuestion.imageName,
                links: userLinks
            })
        }
        else {
            userData.findOne({username: userName}, function (err, record) {
                assert.equal(null, err);
                res.render('quiz', {
                    title: "FaceGame",
                    imageSrc: "/images/" + quizQuestion.imageName,
                    score: record ? record.score : 0,
                    links: userLinks});
            });
        }
    },

    getQuizHandler = function () {
    var assert = require('assert'),
        quizHandler = function (req, res) {

            if(!req.isJson &&  req.session.quizQuestions.length > 0 )  {
                respondWith(req,res,req.session.quizQuestions[0]);
            }
            else{
            quizEngine.generateQuestion(function (err, quizQuestion) {
                req.session.quizQuestions.push(quizQuestion);
                respondWith(req,res,quizQuestion);
            });
            }
        };

    return quizHandler;
};

var mongo = require('mongodb');
module.exports = function (dbSettings) {
    quizEngine = require('../engine/quizEngine')(dbSettings);
    new mongo.Db("FaceGame", new mongo.Server(dbSettings.host, dbSettings.port), {w: 1})
        .open(function (error, client) {
            if (error) throw error;
            userData = new mongo.Collection(client, "UserData");
        });

    return  {
        quiz: getQuizHandler()
    };
}