exports.extendRequest = function ( req , res , next ) {
    req.isJson = req.headers['accept'] && req.headers['accept'].indexOf ( 'application/json' ) > - 1;
    next ();
}