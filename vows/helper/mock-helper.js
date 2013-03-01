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
                        stub.Collection[property] = mocks[property];
                    }
                }
                return stub.Collection;
            } ,
            Server     : function () {
            }
        };
    return stub;
}