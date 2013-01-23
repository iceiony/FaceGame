var vows = require('vows'),
    assert = require('assert'),
    proxyquire = require('proxyquire'),

    mockLink = function () {
        mockLink.wasCalled = true;
        mockLink.srcPath = arguments[0];
        mockLink.dstPath = arguments[1];
        arguments[2]();  //execute callback
    },
    mockUnlink = function () {
        mockUnlink.wasCalled = true;
        mockUnlink.srcPath = arguments[0];
        arguments[1]();  //execute callback
    },
    mongoInsertMock = function (object) {
        mongoInsertMock.wasCalled = true;
        mongoInsertMock.object = object;
    },
    mongoUpdateMock = function (filter, operation, options, callback) {
        mongoUpdateMock.wasCalled = true;
        mongoUpdateMock.filter = filter;
        mongoUpdateMock.operation = operation;
        mongoUpdateMock.options = options;
        callback(null, {});
    },
//subject in test
    utils = proxyquire('../engine/fileUtils', {
        'fs': {
            '@noCallThru': true,
            unlink: mockUnlink,
            link: mockLink
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
                return {
                    update: mongoUpdateMock
                }
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
    }),
    resetMock = function () {
        mockLink.wasCalled = false;
        mockUnlink.wasCalled = false;
        mongoInsertMock.wasCalled = false;
        mongoUpdateMock.wasCalled = false;
    }

vows.describe('processing a file located in the input folder').addBatch({
    'when an image for a new person is processed for upload': {
        topic: function () {
            resetMock();
            utils.processFile("../input/bruce-willis.jpg", this.callback); // path and fs are mocked , file doesn't have to exist
        },
        'the image gets removed from the current path': function (err, result) {
            assert(mockUnlink.wasCalled);
            assert.strictEqual(mockUnlink.srcPath, '../input/bruce-willis.jpg');
        },
        'the image gets copied to the public images with a random name': function (err, result) {
            var fileNameAtDestination = mockLink.dstPath.substring(mockLink.dstPath.lastIndexOf("/") + 1);
            assert(mockLink.wasCalled);
            assert.strictEqual(mockLink.srcPath, "../input/bruce-willis.jpg");
            assert(fileNameAtDestination.indexOf('bruce-willis.jpg')<0);
        },
        'a record upsert-ed in MongoDB': function (topic) {
           assert(mongoUpdateMock.wasCalled);
           assert.strictEqual(mongoUpdateMock.filter.name,"Bruce Willis");
           assert(mongoUpdateMock.operation.$push);
           assert(mongoUpdateMock.options.upsert);
        }
    }
}).export(module);