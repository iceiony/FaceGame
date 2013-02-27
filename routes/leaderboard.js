/*
 * ALL leader board
 */

var userData,
    assert = require('assert'),

    getHandler = function (req, res) {
        var userList = [];

        userData.find({}, {
            "limit": 10,
            "sort": [['score','desc']]
            }, function (err, records) {
                assert.equal(null, err);
                records.each(function(err,record){
                    if(record == null){
                        res.render('leaderboard', {
                            title: "FaceGame Leaderboard",
                            users: userList
                        });
                    }
                    else{
                        userList.push(record);
                    }
                });
        });
    };

var mongo = require('mongodb');
module.exports = function (dbSettings) {
    new mongo.Db("FaceGame", new mongo.Server(dbSettings.host, dbSettings.port), {w: 1})
        .open(function (error, client) {
            if (error) throw error;
            userData = new mongo.Collection(client, "UserData");
            userData.ensureIndex("score", function(e, index){
                if(error) throw error;
            });
        });

    return  {
        leaderboard: getHandler
    };
}

function sortByScore(a, b){
    if(a == b) return 0;
    return a.score > b.score ? -1 : 1
}