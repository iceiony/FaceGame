var mongo = require('mongodb'),
    assert = require('assert'),
    userData,

    voteHandler =  function(req,res){
        var quizQuestion = req.session.quizQuestions[0];

        req.session.quizQuestions = req.session.quizQuestions.slice(1); //pop it off the queue

        userData.findAndModify(
            {username: req.params.user },
            [],
            {$inc: {score: quizQuestion.points[req.params.voted]}},
            {upsert: true, w: 1},
        function(err,record)
        {
            assert.equal(null,err);

            if(req.isJson){
                res.json(200,{
                    score: record.score + quizQuestion.points[req.params.voted],
                    voteScore : quizQuestion.points[req.params.voted],
                    quizLink: "/quiz/"+req.params.user
                })
            }
            else{
                res.redirect("/quiz/"+req.params.user);
            }
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
