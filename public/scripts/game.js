"use strict";
var Game = Game || {};
Game.nameSpace = function ( ns_string ) {
    var parts = ns_string.split ( '.' ),
        parent = Game,
        parts_length,
        i;
    // strip redundant leading global
    if ( parts[0] === "Game" ) {
        parts = parts.slice ( 1 );
    }
    for ( i = 0, parts_length = parts.length ; i < parts_length ; i += 1 ) {
        // create a property if it doesn't exist
        if ( typeof parent[parts[i]] === "undefined" ) {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};


Game.nameSpace ( "Game.PreLoad" );
(function () {

    Game.PreLoad = function ( scoreElement ) {
        this.scoreBox = scoreElement;
        this.quizQuestions = [];
    };

    Game.PreLoad.prototype.overrideLinkAction = function () {
        var that = this;

        $ ( 'a' ).each ( function ( index , element ) {
                $ ( element ).click (
                    function ( event ) {
                        $.ajax (
                            {
                                type     : 'GET' ,
                                url      : event.target.href ,
                                dataType : 'json' ,

                                complete : function ( validationResponse ) {
                                    var res = JSON.parse ( validationResponse.responseText ),
                                        nextQuestion = that.quizQuestions[0];

                                    console.log ( validationResponse.responseText );

                                    $ ( 'img' ).replaceWith ( nextQuestion.img );
                                    $ ( 'ul' ).replaceWith ( nextQuestion.ul );
                                    that.overrideLinkAction ();

                                    that.scoreBox.text ( "Score " + res.score , res.voteScore );
                                    that.quizQuestions = that.quizQuestions.splice ( 1 );
                                    that.loadNextQuestion ( res.quizLink );
                                }
                            }
                        );

                        event.stopPropagation ();
                        return false;
                    } );
            }
        );
    };

    Game.PreLoad.prototype.loadNextQuestion = function ( quizUrl ) {
        var that = this;
        $.ajax (
            {
                type     : 'GET' ,
                url      : quizUrl ,
                dataType : 'json' ,

                complete : function ( validationResponse ) {
                    var newQuiz = JSON.parse ( validationResponse.responseText ),
                        image = $ ( "<img/>" , {src : newQuiz.imageSrc} ),
                        optionList = $ ( "<ul/>" );

                    _.each ( newQuiz.links , function ( element ) {
                            var option = $ ( '<li/>' ),
                                link = $ ( '<a/>' , {
                                    href : encodeURI ( "http://" + document.location.host + element.href )   ,
                                    text : element.text
                                } );

                            link.appendTo ( option );
                            option.appendTo ( optionList );
                        }
                    );

                    that.quizQuestions.push ( {img : image , ul : optionList} );
                }
            }
        );
    };
} ());
