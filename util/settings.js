var Server = require ('mongodb').Server,
    settings = {host : "127.0.0.1" , port : 27017};

exports.dbSettings = settings;
exports.MongoServer = new Server( settings.host, settings.port);
