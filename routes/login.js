/*
 * ALL login page
 */

exports.login = function (req, res) {
    var userEmail = req.body.email,
        userName;

    if (typeof userEmail === 'undefined' || userEmail.length <= 0) {
        res.render('login', {title: "FaceGame Login"});
        req.session.destroy();
    }
    else {
        userName = userEmail.substring(0, userEmail.indexOf("@"));
        if (typeof req.session.quizQuestions === 'undefined') {
            req.session.quizQuestions = [];
        }
        res.redirect("/quiz/" + userName + "/");
    }
};