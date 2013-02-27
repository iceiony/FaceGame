/**
 * Module dependencies.
 */


var express = require('express')
    , app = express()
    , MongoStore = require('connect-mongo')(express)
    , http = require('http')
    , path = require('path')

    , mongo = require('mongodb')
    , dbSettings = {host:"127.0.0.1", port:27017}
    , routes = {
        login: require('./routes/login').login,
        quiz: require('./routes/quiz')(dbSettings).quiz,
        vote: require('./routes/vote')(dbSettings).vote,
        leaderboard: require('./routes/leaderboard')(dbSettings).leaderboard,
    }
    , folderWatch = require('./engine/folderWatch');


folderWatch.monitor(path.join(__dirname, 'input'), dbSettings);


app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session({
                secret: 'rainbow dash',
                store: new MongoStore({db:"FaceGame"})
            }
        ));

    app.use(require('./util/requestExtension').extendRequest);
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.all('/', routes.login);
app.all('/quiz/:user', routes.quiz);
app.all('/user/:user/vote/:voted', routes.vote);
app.all('/leaderboard', routes.leaderboard);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
