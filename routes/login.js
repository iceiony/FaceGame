/*
 * ALL login page
 */

exports.login = function (req, res,next) {
    var userEmail = req.body.email;

    if (typeof userEmail === 'undefined' || userEmail.length <= 0) {
        res.render('login', {title: "FaceGame Login"});
    }
    else next();
};