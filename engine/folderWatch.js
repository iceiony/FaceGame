var child_process = require('child_process'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    fileUtils = require('./fileUtils'),
    uploadPath,
    peekForProcess;

peekForProcess = function(uploadPath){
    fs.readdir(uploadPath, function (err, files) {
        assert.equal(null,err);
        files.forEach(function (file) {
            console.log('Processing '+file);
            if (file.lastIndexOf(".jpg") >= 0 || file.lastIndexOf(".png") >= 0 || file.lastIndexOf(".gif") >= 0 ) {
                fileUtils.processFile(path.join(uploadPath, file));
            }
        })
    });
};


exports.monitor = function (uploadPath) {
    return child_process.fork("./engine/folderWatch", [], {env: {isChildProcess: true, MonitorPath: uploadPath}});
};

if (typeof process.env.isChildProcess !== 'undefined' && process.env.isChildProcess) {
    uploadPath = process.env.MonitorPath;
    peekForProcess(uploadPath);
    setTimeout(peekForProcess,60*10*1000,uploadPath);
}