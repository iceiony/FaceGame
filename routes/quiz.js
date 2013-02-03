/*
 * ALL home page.
 */
var engine = require('../engine/quizEngine'),
    path = require('path');


exports.quiz = function (req, res) {
    var userName= req.params.user,
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

    //why queue you ask ?  so that we can generate and store on client side multiple quiz questions in advance.
    req.session.quizQuestions.push(quizQuestion);

    res.render('quiz', {
        title: "FaceGame",
        imageSrc: '../images/'+ quizQuestion.imageName,
        links: userLinks});
};