var path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    mongo = require('mongodb'),
    crypto = require('crypto'),
    supportedExtensions = ['jpg', 'png', 'gif', 'png'],
    faceData,
    extractPersonName,
    upsertRecord,
    processFileFunction;

extractPersonName = function (fileName) {
    //add space before all upper cases and then split the string
    var fileParts = fileName.replace(/([A-Z])/g, ' $1').trim().split(/[\s\.\-_]/g),
        hasImageExtension = supportedExtensions.indexOf(fileParts[fileParts.length - 1]) >= 0,
        i,
        length;

    if (hasImageExtension) {
        fileParts.pop();  // pop the extension off the back
    }

    for (i = 0, length = fileParts.length; i < fileParts.length; i += 1) {
        if (fileParts[i].length > 0)
            fileParts[i] = fileParts[i][0].toUpperCase() + fileParts[i].slice(1);
    }
    return fileParts.join(' ');
}

upsertRecord = function (personName, pictureName, callback) {

    if (typeof faceData !== "undefined") {
        faceData
            .update(
            {name: personName },
            {$push: {pictures: pictureName}},
            {upsert: true, w: 1},
            function (err, result) {
                assert.equal(null, err);
                console.log("Updated " + personName);
                if (typeof callback != "undefined") {
                    process.nextTick(callback);
                }
            });
    }
    else {
        //TODO: instead of delaying , try adopting a callback pattern
        setTimeout(upsertRecord(personName, pictureName), 10000); // delay for 10 seconds to do the insert in case db connection was not made yet
        console.log("delaying document upsert for (" + personName + " " + pictureName + ")");
    }
}

processFileFunction = function (inputPath, callback) {
    var fileName = inputPath.substring(inputPath.lastIndexOf(path.sep) + 1),
        fileExtension = fileName.substring(fileName.lastIndexOf("."));//extract ".jpg"
    console.log("location : " + inputPath);
    //generate a new random FileName
    crypto.randomBytes(40, function (err, buf) {
        var newFileName;

        assert.equal(null, err);
        newFileName = buf.toString('hex') + fileExtension;

        //copy file across to the public/image folder       s
        fs.link(inputPath, path.join("./public/images/", newFileName), function (err) {
            assert.equal(null, err);

            //delete previous location of the file
            fs.unlink(inputPath, function (err) {
                var personName = extractPersonName(fileName);
                assert.equal(null, err);

                //if we have any record of the face , update the known image
                upsertRecord(personName, newFileName, callback)
            });
        });
    });
};

module.exports = function (dbSettings) {
    new mongo.Db("FaceGame", new mongo.Server(dbSettings.host, dbSettings.port), {w: 1})
        .open(function (error, client) {
            if (error) throw error;
            faceData = new mongo.Collection(client, "FaceData");
        });

    return {
        processFile : processFileFunction
    };
};


