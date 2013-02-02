/**
 * Module dependencies.
 */


var express = require('express')
    , app = express()
    , http = require('http')
    , path = require('path')

    , mongo = require('mongodb')
    , mongoServerConfig = new mongo.Server("127.0.0.1", 27017)
    , routes = {
        login: require('./routes/login').login,
        quiz: require('./routes/quiz').quiz,
        voted: require('./routes/vote')(mongoServerConfig)
    }
    , folderWatch = require('./engine/folderWatch');

folderWatch.monitor(path.join(__dirname, 'input'),{host:mongoServerConfig.host,port:mongoServerConfig.port});


app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'rainbow dash'}));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.all('/', routes.login);
app.all('/', routes.quiz);
app.all('/user/:user/vote/:voted', routes.quiz);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
