var child_process = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    fileUtils = require('./fileUtils'),
    uploadPath,
    peekForProcess;

peekForProcess = function(path){
    fs.readdir(path, function (err, files) {
        files.forEach(function (file) {
            console.log('Processing '+file);
            if (file.lastIndexOf(".jpg") >= 0 || file.lastIndexOf(".png") >= 0 || file.lastIndexOf(".gif") >= 0 ) {
                fileUtils.processFile(path.join(path, file));
            }
        })
    });
};


exports.monitor = function (path) {
    return child_process.fork("./engine/folderWatch", [], {env: {isChildProcess: true, MonitorPath: path}});
};

if (typeof process.env.isChildProcess !== 'undefined' && process.env.isChildProcess) {
    uploadPath = process.env.MonitorPath;
    peekForProcess(path);
    setTimeout(peekForProcess,60*10*1000,path);
}