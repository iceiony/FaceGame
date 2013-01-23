var path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    mongo = require('mongodb'),
    crypto = require('crypto'),
    supportedExtensions = ['jpg', 'png', 'gif', 'png'],
    faceData,
    processFile,
    extractPersonName;

extractPersonName = function (fileName) {
    //add space before all upper cases and then split the string
    var fileParts = fileName.replace(/([A-Z])/g, ' $1').split(/[\s\.\-_]/g),
        hasImageExtension = supportedExtensions.indexOf(fileParts[fileParts.length - 1]) >= 0,
        i,
        length;

    if (hasImageExtension) {
        fileParts.pop();  // pop the extension off the back
    }

    for (i = 0, length = fileParts.length; i < length; i += 1) {
        fileParts[i] = fileParts[i][0].toUpperCase() + fileParts[i].slice(1);
    }

    return fileParts.join(' ');
}

processFile = function (inputPath, callback) {
    var fileName = inputPath.substring(inputPath.lastIndexOf("/") + 1),
        fileExtension = fileName.substring(fileName.lastIndexOf("."));//extract ".jpg"

    //generate a new random FileName
    crypto.randomBytes(40, function (err, buf) {
        var newFileName;

        assert.equal(null, err);
        newFileName = buf.toString('hex') + fileExtension;

        //copy file across to the public/image folder
        fs.link(inputPath, path.join("./public/images/", newFileName), function (err) {
            assert.equal(null, err);

            //delete previous location of the file
            fs.unlink(inputPath, function (err) {
                assert.equal(null, err);

                //if we have any record of the face , update the known image
                faceData
                    .update(
                    {name: extractPersonName(fileName)},
                    {$push: {pictures: newFileName}},
                    {upsert: true, w: 1},
                    function (err, result) {
                        assert.equal(null, err);
                        process.nextTick(callback);
                    });
            });
        });
    });
};

new mongo.Db("FaceGame", new mongo.Server("127.0.0.1", 27017), {w: 1})
    .open(function (error, client) {
        if (error) throw error;
        faceData = new mongo.Collection(client, "FaceData");

        exports.processFile = processFile;

    });

