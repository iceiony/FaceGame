exports.extendRequest = function ( req , res , next ) {
    req.isJson = req.headers['accept'] && req.headers['accept'].indexOf ( 'application/json' ) > - 1;

    next ();
}

exports.ensureSession = function ( req , res , next ) {
    if ( typeof req.session.quizQuestions === 'undefined' ) {
        req.session.quizQuestions = [];
    }
    next ();


}

exports.noCache = function ( req , res , next ) {
    res.setHeader ( 'Cache-Control' , 'no-cache' );
    next ();
}