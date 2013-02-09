var vows = require('vows'),
    assert = require('assert'),
    subject = require('../util/requestExtension').extendRequest,
    reqJson ={headers: { "accept": "application/json, text/javascript, */*; q=0.01" }};
    reqNonJson ={headers: { "accept": "text/html, text/javascript, */*; q=0.01" }};

vows.describe('RequestExtensions will add custom helper properties to the req,res objects').addBatch({
        'when a request is received with a json header': {
            topic: function () {
                subject(reqJson, {}, this.callback);
            },
            'the isJson property should be true': function (err, stat) {
                assert(reqJson.isJson);
            }
        },
        'when a request is received that does not have a json header': {
            topic: function () {
                subject(reqNonJson, {}, this.callback);
            },
            'the isJson property should be falsely ': function (err, stat) {
                assert(!reqNonJson.isJson);
            }
        }}
).export(module);