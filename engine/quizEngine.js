var dbSettings = require("../util/settings").dbSettings,
    mongo = require('mongodb'),
    assert = require('assert'),
    EventEmitter = require('events').EventEmitter,
    faceData,

    _getRandomDocument = function (count, callback) {
        var randomNr = Math.floor(count * Math.random());
        faceData.findOne({}, {limit: -1, skip: randomNr}, function (err, doc) {
            callback(err, doc);
        });
    },
    _select3Records = function (_emitter) {
        return function (count) {
            var records = [],
                names = [],
                _recordUniqueDoc = function (doc) {
                    if (names.indexOf(doc.name) < 0) {
                        records.push(doc);
                        names.push(doc.name);
                    }

                    if (records.length < 3) {
                        _getRandomDocument(count, function (err, doc) {
                            _emitter.emit("documentRetrieved", doc);
                        });
                    }
                    else {
                        _emitter.emit("dbDataRetrieved", records);
                    }
                };

            _emitter.on("documentRetrieved", _recordUniqueDoc);

            _getRandomDocument(count, function (err, doc) {
                _emitter.emit("documentRetrieved", doc)
            });

        };
    },
    _makeQuizFromRecords = function (returnCallback) {
        return function (records) {
            var randomIndex = Math.floor(records.length * Math.random()),
                randomPictureIndex = Math.floor(records[randomIndex].pictures.length * Math.random()),
                quizQuestion = {
                    imageName: records[randomIndex].pictures[randomPictureIndex],
                    options: [],
                    points: {}
                };

            records.forEach(function (record) {
                quizQuestion.options.push(record.name);
                quizQuestion.points[record.name] = -5;
            });
            quizQuestion.points[records[randomIndex].name] = 10;

            returnCallback(null, quizQuestion);
        }
    };

exports.generateQuestion = function (returnCallback) {
    var _emitter = new EventEmitter();

    faceData.count(function (err, count) {
        if (count >= 3) {
            _emitter.emit("counted", count);
        }
        else {
            process.nextTick(function () {
                returnCallback({message: "DB has less than 3 records to generate a quiz"}, null);
            });
        }
    });

    _emitter.on("counted", _select3Records(_emitter));
    _emitter.on("dbDataRetrieved", _makeQuizFromRecords(returnCallback));
};


new mongo.Db("FaceGame", new mongo.Server(dbSettings.host, dbSettings.port), {w: 1})
    .open(function (error, client) {
        if (error) throw error;
        faceData = new mongo.Collection(client, "FaceData");
    });
