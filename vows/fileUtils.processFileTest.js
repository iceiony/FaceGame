var vows = require('vows'),
    assert = require('assert'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon'),
    dependencies = {
        'fs': {
            '@noCallThru': true,
            unlink: sinon.stub().yields(),
            link: sinon.stub().yields()
        },
        'mongodb': {
            '@noCallThru': true,
            Db: function () {
                return {
                    open: function (callback) {
                        callback(null, {});
                    }
                };
            },
            Collection: function () {
                dependencies.mongodb.Collection.update =  sinon.stub().yields(); //save reference for assertion
                return {
                    update: dependencies.mongodb.Collection.update
                };
            },
            Server: function () {
            }
        },
        'crypto': {
            '@noCallThru': true,
            randomBytes: function (nrBytes, callback) {
                callback(null, 'randomSetOfBytes')
            }
        }
    },
//subject in test
    utils = proxyquire('../engine/fileUtils',dependencies);

vows.describe('processing a file located in the input folder').addBatch({
    'when an image for a new person is processed for upload': {
        topic: function () {
              utils.processFile("../input/bruce-willis.jpg", this.callback); // path and fs are mocked , file doesn't have to exist
        },
        'the image gets removed from the current path': function (err, result) {
            assert(dependencies.fs.unlink.called);
            assert(dependencies.fs.unlink.calledWith('../input/bruce-willis.jpg'));
        },
        'the image gets copied to the public images with a random name': function (err, result) {
            var parameters = dependencies.fs.link.args[0],
                fileNameAtDestination = parameters[1].substring(parameters[1].lastIndexOf("/") + 1);

            assert(dependencies.fs.link.called);
            assert.strictEqual(parameters[0], "../input/bruce-willis.jpg");
            assert(fileNameAtDestination.indexOf('bruce-willis.jpg')<0);
        },
        'a record upsert-ed in MongoDB': function (topic) {
           var mongoUpdate = dependencies.mongodb.Collection.update,
               parameters = mongoUpdate.args[0];

           assert(mongoUpdate.called);
           assert.strictEqual(parameters[0].name,"Bruce Willis");
           assert(parameters[1].$push);
           assert(parameters[2].upsert);
        }
    }
}).export(module);