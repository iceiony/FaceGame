/*
 * ALL home page.
 */
var engine = require('../engine/quizEngine'),
    path = require('path');


exports.index = function (req, res) {
    var userEmail = req.body.email,
        userName = userEmail.substring(0, userEmail.indexOf("@")),
        quizQuestion = engine.QuizEngine.generateQuestion(),
        userLinks = [],
        i,
        length;

    for (i = 0, length = quizQuestion.options.length; i < length; i++) {
        userLinks.push({
          //href "/user/ionita.adri/vote/Koala"
            href:["/user/", userName, "/vote/", quizQuestion.options[i]].join('')
            ,text : quizQuestion.options[i]
        });
    }

    res.render('index', {
        title: "FaceGame",
        imageSrc: '../public/images/'+ quizQuestion.imageName,
        links: userLinks});
};