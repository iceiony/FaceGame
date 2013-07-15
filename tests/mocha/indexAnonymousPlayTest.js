var sinon = require('sinon'),
    assert = require('assert');


describe('Hitting the index page will result in anonymous play',function(){
    describe("When a user hits the index page",function(){
        it("will redirect the user to a quiz with the username prefixed by anonymous",function(){
            var subject = require('../../routes/index'),
                resMock = {redirect:sinon.stub()};
            subject.index({},resMock);

            assert( resMock.redirect.called );
            assert.strictEqual( resMock.redirect.args[0][0].indexOf( '/quiz/anonymous' ),0 , 'Was instead: '+resMock.redirect.args[0][0]);
        });
    })
});
