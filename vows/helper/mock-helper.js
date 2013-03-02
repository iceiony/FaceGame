exports.mongoStub = function ( mocks ) {
    var property,
        stub = {
            Db         : function () {
                return {
                    open : function ( callback ) {
                        callback ( null , {} );
                    }
                };
            } ,
            Collection : function () {
                for ( property in mocks ) {
                    if ( mocks.hasOwnProperty ( property ) ) {
                        stub.Collection[property] = (function ( prop ) {
                            return function () {
                                var args = arguments;
                                process.nextTick ( function () {
                                    mocks[prop].apply ( null , args );
                                    stub.Collection[prop].args = mocks[prop].args;
                                    stub.Collection[prop].called = mocks[prop].called;
                                } );
                            }
                        } ( property ));
                    }
                }
                return stub.Collection;
            } ,
            Server     : function () {
            }
        };
    return stub;
}

exports.cursorStub = function ( mockRecords ) {
    mockRecords.each = function ( callback ) {
        var simpleCallback = function ( value ) {
            return callback ( null , value );
        };
        return mockRecords.forEach.call ( mockRecords , simpleCallback );
    };

    return mockRecords;
}