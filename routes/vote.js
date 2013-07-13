var assert      = require ( 'assert' ),
    voting      = require  ( '../engine/voting');

exports.vote = function (req, res) {

    voting.vote(req.params.user, req.session, req.params.voted,
        function (err, result) {
            if (err != null) {
                console.log(err);

                if (req.isJson) {
                    res.json(500, {
                        redirect: "/quiz/" + req.params.user
                    });
                }
                else res.redirect("/quiz/" + req.params.user);

                return;
            }

            if (req.isJson) {
                res.json(200, {
                    score: ( result.score || 0 ),
                    voteScore: result.voteScore,
                    quizLink: "/quiz/" + req.params.user
                })
            }
            else res.redirect("/quiz/" + req.params.user);

        });
};
