var vows = require ( 'vows' ),
    assert = require ( 'assert' ),
    sinon = require ( 'sinon' ),
    proxyquire = require ( 'proxyquire' ).noCallThru (),
    mockHelper = require ( '../helper/mock-helper' );


vows.describe ( "Generating a quiz " ).addBatch ( {
    "When generating a quiz with 3 names but not enough data in the db" : {
        topic                            : function () {
            var generateRecord = function ( query , options , callback ) {
                    callback ( null , {name : "Badger" , pictures : ["Badger.jpg"]} )
                },
                dependencies = {
                    'mongodb' : mockHelper.mongoStub ( {
                        findOne : generateRecord ,
                        count   : sinon.stub ().yields ( null , 1 )
                    } )
                },
                subject = proxyquire ( '../../engine/quiz-engine' , dependencies );

            subject.generateQuestion ( this.callback );
        } ,
        'should return an error message' : function ( err , result ) {
            assert ( err );
        }
    } ,
    "When generating a quiz with 3 randomly selected names"             : {
        topic                                                             : function () {
            var dummyRecords = [
                    {name : "Badger" , pictures : ["Badger.jpg"]},
                    {name : "Fox" , pictures : ["Fox.jpg"]},
                    {name : "Koala" , pictures : ["Koala.jpg"]}
                ],
                recordGenerator = function ( query , options , callback ) {
                    callback ( null , dummyRecords.pop () )
                },
                dependencies = {
                    'mongodb' : mockHelper.mongoStub ( {
                        findOne : recordGenerator ,
                        count   : sinon.stub ().yields ( null , 10 )
                    } )
                },
                subject = proxyquire ( '../../engine/quiz-engine' , dependencies );

            subject.generateQuestion ( this.callback );
        } ,
        'should populate the image name'                                  : function ( result ) {
            assert ( result.imageName );
        } ,
        'should populate the options with 3 choices'                      : function ( result ) {
            assert ( result.options );
            assert.equal ( result.options.length , 3 );
        } ,
        'should populate the points field with properties of the options' : function ( result ) {
            var i , len;
            assert ( result.points );
            for ( i = 0, len = result.options.length ; i < len ; i += 1 ) {
                assert ( typeof result.points[result.options[i]] != "undefined" );
            }
        }
    }

} ).export ( module );

