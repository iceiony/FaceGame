var assert       = require('assert'),
    sinon        = require('sinon'),
    proxyquire   = require('proxyquire'),
    mockHelper   = require ( '../helper/mock-helper' ),
    dependencies = {
        'mongodb': mockHelper.mongoStub ( {findOne : sinon.stub ().yields ( null , {score : 10} )} ),
        '../util/settings' : {dbSettings : sinon.mock ()}
    };

describe("Quiz page ajax request to login anoymous user",function(){
    describe("When an anonymous user decides to login from a quiz page with the correct password",function(){
        var subject = proxyquire('../../routes/login',dependencies),
            req = { isJson:true, body:{ email:"broni@facegame.co.uk",password:"pony16" } , params:{ anonymousUser : "anonymous.3117"} , session:{currentScore:10} },
            res = { json:sinon.stub() };

            subject.login(req,res);

        it("should return success for correct username and password",function(){
            assert( res.json.args[0][0].isSuccess );
        });
        it("should mark the user session as logged-in",function(){
            assert.strictEqual( req.session.loginName , "broni" );
        });
        it("should return the user's score from the db",function(){
            assert.equal( res.json.args[0][0].score, 10 );
        });
        it("should return the user's current anonymous score as a voteScore",function(){
            assert.equal( res.json.args[0][0].voteScore, 10 );
        });
        it("should set the currentScore property on the session to 0",function(){
            assert.equal( req.session.currentScore , 0 );
        });
    });
    describe("When an anonymous user decides to login from a quiz page and the password is incorrect",function(){
        dependencies.mongodb= mockHelper.mongoStub ( {findOne : sinon.stub ().yields ( null , null )});

        var subject = proxyquire('../../routes/login',dependencies),
            req = { isJson:true, body:{ email:"broni@facegame.co.uk",password:"pony16" } , params:{ anonymousUser : "anonymous.3117"} , session:{currentScore:10} },
            res = { json:sinon.stub() };

        subject.login(req,res);

        it("should return failure",function(){
            assert( ! res.json.args[0][0].isSuccess );
        });
        it("should not mark the user session as logged-in",function(){
            assert( ! req.session.loginName );
        });

    });
});