var assert      = require ( 'assert' ),
    voting      = require ( '../engine/voting'),
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server;

var _badEmailResponse = function (req, res) {
    if (req.isJson)
        res.json({isSuccess: false, Error: "Not an email"})
    else
        res.render('login', {title: "FaceGame Login"});
};


exports.badEmailResponse = _badEmailResponse;

exports.login = function (req, res) {
    var userEmail = req.body.email,
        password = req.body.password,
        userName;

    if (typeof userEmail === 'undefined' || userEmail.length <= 0) {
        _badEmailResponse(req, res);
    }
    else {
        userName = userEmail.substring(0, userEmail.indexOf("@"));

        var mongoServer = new MongoClient(new MongoServer(settings.host, settings.port), {w: 1});
        mongoServer.open(
            function (err, mongoClient) {
                assert.equal(null, err);

                var userData = mongoClient.db('FaceGame').collection('UserData');

                userData.findOne(
                    { username: userName, password: password },
                    function (err, result) {
                        mongoClient.close();

                        if (result) {
                            var currentScore = req.session.currentScore;

                            voting.updateScore(userName, currentScore, function () {
                            });

                            req.session.loginName = userName;
                            req.session.currentScore = 0;

                            if (req.isJson) {
                                res.json({
                                    isSuccess: true,
                                    score: result.score,
                                    voteScore: currentScore
                                })
                            }
                            else res.redirect("/quiz/" + userName + "/");
                        }
                        else {
                            delete req.session.loginName;
                            if (req.isJson) {
                                res.json({
                                    isSuccess: false,
                                    Error: "Bad email or password"
                                })
                            }
                            else res.redirect("/login/");
                        }
                    }
                );
            });


    }

};