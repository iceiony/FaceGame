/*
 * ALL leader board
 */

var assert = require('assert')        ,
    dbSettings = require('../util/settings').dbSettings,
    mongo = require('mongodb'),
    userData;

exports.leaderboard = function (req, res) {
    var userList = [];

    userData.find({}, {
        "limit": 10,
        "sort": [
            ['score', 'desc']
        ]
    }, function (err, records) {
        assert.equal(null, err);
        records.each(function (err, record) {
            if (record == null) {
                res.render('leaderboard', {
                    title: "FaceGame Leaderboard",
                    users: userList
                });
            }
            else {
                userList.push(record);
            }
        });
    });
};

new mongo.Db("FaceGame", new mongo.Server(dbSettings.host, dbSettings.port), {w: 1})
    .open(function (error, client) {
        if (error) throw error;
        userData = new mongo.Collection(client, "UserData");
        userData.ensureIndex("score", function (e, index) {
            if (error) throw error;
        });
    });
