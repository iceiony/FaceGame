var mongo = require('mongodb'),
    userData;

exports.vote = function(req,res){
   var quizQuestion = req.session.quizQuestions[0];

    req.session.quizQuestions = req.session.quizQuestions.slice(1); //pop it off the queue
    res.redirect("/quiz/"+req.params.user+"/");

    userData.update(
        {username: req.params.user },
        {$inc: {score: quizQuestion.points[req.params.voted]}},
        {upsert: true, w: 1});
}

//TODO: have to move te server location from here into the app setup
new mongo.Db("FaceGame", new mongo.Server("127.0.0.1", 27017), {w: 1})
    .open(function (error, client) {
        if (error) throw error;
        userData = new mongo.Collection(client, "UserData");
    });

