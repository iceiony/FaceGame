var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire'),
    mockHelper = require('../helper/mock-helper'),
    dependencies = {
        '../util/settings': {dbSettings: sinon.mock()},
        './login': {login: sinon.mock()}
    };


describe('Request to register anonymous user : ', function () {

    describe('When an anonymous attempts to register an account with an un-existing email', function () {
        dependencies.mongodb = mockHelper.mongoStub({
            insert: sinon.stub().yields(null, {}),
            findOne: sinon.stub().yields(null, null)
        });

        var subject = proxyquire('../../routes/register', dependencies),
            req = {isJson: true, body: { email: "broni@facegame.co.uk", password: "pony16" }, params: { anonymousUser: "anonymous.3117"}, session: {currentScore: 10} },
            res = {json: sinon.stub()};

        subject.register(req, res);

        it("should create an account for the user", function () {
            assert(dependencies.mongodb.Collection['insert'].called);
        });

        it("login the user to the website", function () {
            assert(dependencies['./login'].login.called);
        });
    });

    describe("When an anonymous user attempts to register an account with an existing email", function () {
        dependencies.mongodb = mockHelper.mongoStub({
            findOne: sinon.stub().yields(null, {score: 10})
        });

        var subject = proxyquire('../../routes/register', dependencies),
            req = {isJson: true, body: { email: "broni@facegame.co.uk", password: "pony16" }, params: { anonymousUser: "anonymous.3117"}, session: {currentScore: 10} },
            res = {json: sinon.stub()};

        subject.register(req, res);

        it("should return an error message to the user", function () {
            assert(!res.json.args[0][0].isSuccess);
            assert.strictEqual(res.json.args[0][0].message, 'Email already registered, try logging in.');
        });

        it("should not attempt to login the user", function () {
            assert(!dependencies['./login'].called);
        });
    });

});

