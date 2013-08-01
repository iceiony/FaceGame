var assert      = require ( 'assert' ),
    login       = require ( './login'),
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server;

exports.register = function (req, res) {
    var userEmail = req.body.email,
        password = req.body.password,
        userName;

    if (typeof userEmail === 'undefined' || userEmail.length <= 0) {
        login.badEmailResponse(req, res);
    }
    else {
        userName = userEmail.substring(0, userEmail.indexOf("@"));

        var mongoServer = new MongoClient(new MongoServer(settings.host, settings.port), {w: 1});
        mongoServer.open(
            function (err, mongoClient) {
                assert.equal(null, err);

                var userData = mongoClient.db('FaceGame').collection('UserData');

                userData.findOne({email: userEmail}, function (err, result) {
                    assert.equal(null, err);

                    if (!result) {
                        userData.insert(
                            { username: userName, password: password , email:userEmail},
                            function (err, result) {
                                mongoClient.close();

                                login.login(req, res);
                            });
                    }
                    else {
                        mongoClient.close();

                        if (req.isJson)
                            res.json({isSuccess: false, message: "Email already registered, try logging in."});
                        else
                            res.render('login', {title: "FaceGame Login"});
                    }
                });
            });
    }
}