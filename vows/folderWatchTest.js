var vows = require('vows'),
    assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),

    dependencies = {
        'child_process': {
            '@noCallThru': true,
            fork: sinon.stub().returns({})//return something that is not undefined
        } ,
        './fileUtils': {
            '@noCallThru': true,
            processFile: sinon.spy()
        }
        ,'fs' :{
            '@noCallThru': true,
            readdir: sinon.stub()
                .yields(null,["readme.txt","pic1.jpg","pic2.bmp","pic3.gif","pic4.png"])
        }
    };


vows.describe("An upload folder is watched for new files to get transferred").addBatch({
    'When creating an instance of the folderWatch': {
        topic: function () {
            var folderWatch = proxyquire('../engine/folderWatch', dependencies);
            return {
                result: folderWatch.monitor("./input")
            }

        },
        'the watch starts a new node process': function (topic) {
            assert(dependencies.child_process.fork.called);
        },
        'it returns a reference to the child process': function (topic) {
            assert(topic.result);
        },
        'it does not execute the rest of the code': function (topic) {
            assert(!dependencies['./fileUtils'].processFile.called);
        }}
    }).addBatch({
    'When executing the code as a child process': {
        topic: function () {
            var clock = sinon.useFakeTimers(),
                consoleLog = console.log;

            //stop console logging from polluting test output
            console.log = sinon.spy();

            process.env.IsChildProcess = true;
            process.env.MonitorPath = "../input";
            var folderWatch = proxyquire('../engine/folderWatch', dependencies);


            return {
                clock: clock,
                consoleLog : consoleLog
            };
        },
        teardown : function(topic){
           topic.clock.restore();
           console.log = topic.consoleLog;
        },
        'it should process a total of 3 images only': function(topic){
            assert(dependencies['./fileUtils'].processFile.calledThrice);
        },
        'it will process all jpg files in the given path': function (topic) {
            assert(dependencies['./fileUtils'].processFile.args[0][0].indexOf('pic1.jpg')>=0);
        },
        'it will process all gif files in the given path': function (topic) {
            assert(dependencies['./fileUtils'].processFile.args[1][0].indexOf('pic3.gif')>=0);
        },
        'it will process all png files in the given path': function (topic) {
            assert(dependencies['./fileUtils'].processFile.args[2][0].indexOf('pic4.png')>=0);
        },
        'it will peek for new files every 10 minutes': function (topic) {

            //test it read from the folder only once
            assert(!dependencies.fs.readdir.calledTwice, 'wasn\'t called more than once before timeout');
            topic.clock.tick(60 * 10 * 1000 );//tick for 10 minute

            //test it read from the folder a second time
            assert(dependencies.fs.readdir.calledTwice,'was called a second time after 10 minutes');
        }
    }

}).export(module);