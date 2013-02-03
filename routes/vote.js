var mongo = require('mongodb'),
    assert = require('assert'),
    userData,

    voteHandler =  function(req,res){
        var quizQuestion = req.session.quizQuestions[0];

        req.session.quizQuestions = req.session.quizQuestions.slice(1); //pop it off the queue

        userData.update(
            {username: req.params.user },
            {$inc: {score: quizQuestion.points[req.params.voted]}},
            {upsert: true, w: 1},
        function(err,callback)
        {
            assert.equal(null,err);
            res.redirect("/quiz/"+req.params.user+"/");
        });
    };

module.exports = function(dbSettings){
    //initialise connection to mongo
    new mongo.Db("FaceGame", new  mongo.Server(dbSettings.host,dbSettings.port), {w: 1})
        .open(function (error, client) {
            if (error) throw error;
            userData = new mongo.Collection(client, "UserData");
        });

    //return the route function
    return {
        vote: voteHandler
    };
}
