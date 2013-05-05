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
        this.minQuestions = 2;

        this.pendingQuestionLoad = 0;

        // fix splice for < IE9
        if (document.documentMode && document.documentMode < 9) {
            var originalSplice = Array.prototype.splice;
            Array.prototype.splice = function() {
                var arr = [],
                    i = 0,
                    max = arguments.length;

                for (; i < max; i++){
                    arr.push(arguments[i]);
                }
                if (arr.length==1) {
                    arr.push(this.length - arr[0]);
                }
                return originalSplice.apply(this, arr);
            };
        }
    };



    Game.PreLoad.prototype.showNext = function () {
      var question = this.quizQuestions[0];
	      this.quizQuestions = this.quizQuestions.splice ( 1 );
        $ ( 'ul' ).replaceWith ( question.ul );
        //jquery in IE adding with and height attribtues
        question.img.removeAttr('width');
        question.img.removeAttr('height');
        $ ( 'img' ).replaceWith ( question.img );
    }

    Game.PreLoad.prototype.overrideLinkAction = function ( links ) {
        var that = this,
            isBatchVoted = false;

        _.each ( links , function ( element ) {
                $ ( element ).click ( function ( event ) {

                    if ( ! isBatchVoted ) {

                        //load next question ( if we have one )
                        if ( typeof that.quizQuestions[0] !== 'undefined' ) {
                            that.showNext ();
                        }
                        else {
                            that.isQuestionHungry = true;
                        }

                        //make vote
                        $.ajax (
                            {
                                type     : 'GET' ,
                                url      : $(event.target ).attr('href') ,
                                dataType : 'json' ,

                                complete : function ( scoreResponse ) {
                                    var res = $.parseJSON ( scoreResponse.responseText );

                                    that.scoreBox.text ( "Score " + res.score , res.voteScore , event );
                                    that.loadNextQuestions ( res.quizLink );
                                }
                            }
                        );
                    }

                    event.stopPropagation ();
                    return false;
                } );
            }
        );
    };

    Game.PreLoad.prototype.moreNeeded = function () {
        return this.pendingQuestionLoad + this.quizQuestions.length < this.minQuestions;
    }


    Game.PreLoad.prototype.loadNextQuestions = function ( quizUrl ) {
        var that = this;
        this.pendingQuestionLoad += 1;

        $.ajax (
            {
                type     : 'POST' ,
                url      : quizUrl ,
                dataType : 'json' ,
		data     : {"nounce":Math.random()},

                complete : function ( nextQuiz ) {
                    var newQuiz = $.parseJSON ( nextQuiz.responseText ),
                        image = $ ( "<img/>" , {src : newQuiz.imageSrc} ),
                        optionList = $ ( "<ul/>" ),
                        links = [];

                    _.each ( newQuiz.links , function ( element ) {
                            var option = $ ( '<li/>' ),
                                link = $ ( '<a/>' , {
                                    href : encodeURI ( "http://" + document.location.host + element.href ) ,
                                    text : element.text
                                } );

                            link.appendTo ( option );
                            option.appendTo ( optionList );
                            links.push ( link );
                        }
                    );
                    that.overrideLinkAction ( links );

                    that.pendingQuestionLoad -= 1;
                    that.quizQuestions.push ( {img : image , ul : optionList} );
                    if ( that.isQuestionHungry ) {
                        that.isQuestionHungry = false;
                        that.showNext ();
                    }

                    if ( that.moreNeeded () ) {
                        that.loadNextQuestions ( quizUrl );
                    }
                }
            }
        );

        return this;
    };
} ());
