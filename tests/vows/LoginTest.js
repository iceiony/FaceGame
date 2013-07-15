var vows = require ( 'vows' ),
    assert = require ( 'assert' ),
    routeInTest = require ( '../../routes/login' ),
    sinon = require ( 'sinon' ),

    resMock = { render : sinon.stub () , redirect : sinon.stub () },
    reqMock = {body : {} , session : {} },


    makeTest = function () {
        routeInTest.login ( reqMock , resMock  );
        return {
            viewName : resMock.render.args[0][0] ,
            local    : resMock.render.args[0][1]
        };
    };

vows.describe ( 'Generating a page for a specific player' ).addBatch ( {
    'when accessing site root with no user email' : {
        topic                       : function () {
            reqMock = {body : {} , session : {destroy : sinon.spy ()} };
            return makeTest ();
        } ,
        'will be prompted to login' : function ( topic ) {
            assert.strictEqual ( topic.viewName , "login" );
        }
    }} ).export ( module ); // Run it