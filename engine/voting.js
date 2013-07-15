var assert      = require ( 'assert' ),
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server;

var _persistNewScore = function(user,voteScore,callback){
    var mongoServer = new MongoClient(new MongoServer(settings.host, settings.port), {w: 1});
    mongoServer.open(
        function (err, mongoClient) {
            assert.equal(null, err);

            var userData = mongoClient.db('FaceGame').collection('UserData');

            userData.findAndModify(
                {username: user },
                [],
                {$inc: {score: voteScore}},
                {upsert: true, w: 1},
                function (err, result) {
                    mongoClient.close();
                    result.voteScore = voteScore;
                    result.score += voteScore;
                    callback(err, result);
                }
            );
        });
};

exports.vote = function (user, data, vote, callback) {
    var quizQuestion = data.quizQuestions[0],
        isAnonymous = ( user.indexOf('anonymous') == 0 );

    if (!quizQuestion) {
        callback({
            message: "No existing quiz to vote against"
        }, null);
        return;
    }

    data.quizQuestions = data.quizQuestions.slice(1); //pop it off the queue

    if(!isAnonymous){
        _persistNewScore(user,quizQuestion.points[vote],callback);
    }
    else{
        data.totalScore =  data.totalScore || 0;
        data.totalScore += quizQuestion.points[vote];
        callback(null,{score : data.totalScore, voteScore: quizQuestion.points[vote] });
    }
}