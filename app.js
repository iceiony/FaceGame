/**
 * Module dependencies.
 */


var express = require('express')
    , app = express()
    , routes = {
        login: require('./routes/login').login,
        quiz: require('./routes/quiz').quiz
    }
    , http = require('http')
    , path = require('path')
    , folderWatch = require('./engine/folderWatch');

folderWatch.monitor(path.join(__dirname, 'input'));


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

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
