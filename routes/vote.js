var mongo = require('mongodb'),
    userData,

    voteHandler =  function(req,res){
        var quizQuestion = req.session.quizQuestions[0];

        req.session.quizQuestions = req.session.quizQuestions.slice(1); //pop it off the queue
        res.redirect("/quiz/"+req.params.user+"/");

        userData.update(
            {username: req.params.user },
            {$inc: {score: quizQuestion.points[req.params.voted]}},
            {upsert: true, w: 1});
    };

module.exports = function(mongoServerConfig){
    //initialise connection to mongo
    new mongo.Db("FaceGame", mongoServerConfig, {w: 1})
        .open(function (error, client) {
            if (error) throw error;
            userData = new mongo.Collection(client, "UserData");
        });

    //return the route function
    return {
        vote: voteHandler
    };
}
