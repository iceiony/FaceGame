var child_process = require('child_process'),
    runAsSeparateProcess;

runAsSeparateProcess = function () {
    var assert = require('assert'),
        path = require('path'),
        fs = require('fs'),
        uploadPath = process.env.MonitorPath,
        dbSettings = { host: process.env.DbHost, port: parseInt(process.env.DbPort)},
        fileUtils = require('./fileUtils')(dbSettings),
        peekForProcess = function (uploadPath) {
            fs.readdir(uploadPath, function (err, files) {
                assert.equal(null, err);
                files.forEach(function (file) {
                    console.log('Processing ' + file);
                    if (file.lastIndexOf(".jpg") >= 0 || file.lastIndexOf(".png") >= 0 || file.lastIndexOf(".gif") >= 0) {
                        fileUtils.processFile(path.join(uploadPath, file));
                    }
                });
            });
        };

    peekForProcess(uploadPath);
    setInterval(peekForProcess, 60 * 10 * 1000, uploadPath);
};

exports.monitor = function (uploadPath, mongoServerConfig) {
    return child_process.fork("./engine/folderWatch", [], {env: {isChildProcess: true, MonitorPath: uploadPath, DbHost: mongoServerConfig.host, DbPort: mongoServerConfig.port}});
};

if (typeof process.env.isChildProcess !== 'undefined' && process.env.isChildProcess) {
    runAsSeparateProcess();
}