var assert      = require ( 'assert' ),
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server;

exports.vote = function (user, data, vote, callback) {
    var quizQuestion = data.quizQuestions[0],
        mongoServer = new MongoClient(new MongoServer(settings.host, settings.port), {w: 1});

    if (!quizQuestion) {
        callback({
            message: "No existing quiz to vote against"
        }, null);
        return;
    }

    data.quizQuestions = data.quizQuestions.slice(1); //pop it off the queue

    mongoServer.open(
        function (err, mongoClient) {
            assert.equal(null, err);

            var userData = mongoClient.db('FaceGame').collection('UserData');

            userData.findAndModify(
                {username: user },
                [],
                {$inc: {score: quizQuestion.points[vote]}},
                {upsert: true, w: 1},
                function (err, result) {
                    mongoClient.close();
                    result.voteScore = quizQuestion.points[vote];
                    result.score += quizQuestion.points[vote];
                    callback(err, result);
                }
            );
        });

}