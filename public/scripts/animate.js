"use strict";
Game.nameSpace ( "Game.Animate" );
(function () {
    var POSITIVE_COLOR = '#1DD300',
        NEGATIVE_COLOR = '#FF5300';


    var _moveParticles = function ( animate ) {
            var firstPositive = 0;

            _.each ( animate.particles ,
                function ( element , index ) {

                    if ( element.y > - 10 ) {
                        element.y -= element.speed;
                        if ( firstPositive < 0 ) firstPositive = index;

                        return;
                    }

                    animate.stage.removeChild ( element );
                } );

            animate.particles = animate.particles.splice ( firstPositive );
        },
        _blinkText = function ( animate ) {
            var blinkCount = 10,
                interval = setInterval ( function () {
                    blinkCount --;

                    animate.score.color = animate.score.color === POSITIVE_COLOR ? NEGATIVE_COLOR : POSITIVE_COLOR;

                    if ( ! blinkCount ) {
                        clearInterval ( interval );
                        animate.score.color = animate.score.text.indexOf ( '-' ) < 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
                    }
                } , 1000 / 5 );
        },
        _voteBuble = function ( voteScore , event ) {
            var bubble = $ ( '<div/>' , {
                style : "position : absolute;" +
                    "font-weight : bold;" +
                    "z-index : -1;" +
                    "font-size : 2em;" +
                    "left : " + (event.clientX + 21 ) + "px;" +
                    "top : " + event.clientY + "px;" +
                    "color : " + ( voteScore > 0 ? POSITIVE_COLOR : NEGATIVE_COLOR) ,
                text  : (voteScore < 0 ? '-' : '+') + Math.abs ( voteScore )
            } );

            $ ( 'body' ).append ( bubble );
            bubble.animate ( {
                    opacity : .3 ,
                    top     : '-=89'
                } ,
                3000 ,
                function () {
                    bubble.remove ();
                } );
        };


    Game.Animate = function ( canvasId ) {
        var that = this,
            dom = $ ( '#' + canvasId ),
            scoreText = dom.text (),
            initialColor = scoreText.indexOf ( '-' ) < 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;

        this.stage = new createjs.Stage ( canvasId );

        this.score = new createjs.Text ( scoreText , 'bold 2em Arial' , initialColor );
        this.score.x = 8;
        this.score.y = 34;
        this.stage.addChild ( this.score );

        this.particles = [];
        this.stageWidth = dom.width ();
        this.stageHeight = dom.height ();

        createjs.Ticker.setFPS ( 46 );
        createjs.Ticker.addEventListener ( 'tick' , function () {
            that.stage.update ();
        } );

        //counts as internal clock, different from FPS ticks
        setInterval ( _moveParticles , 1000 / 60 , this );

    };


    Game.Animate.prototype.text = function ( text , lastValue , clickEvent ) {
        var that = this,
            particle = new createjs.Text ( '' , 'bold 2em Arial' );

        this.score.text = text;
        if ( lastValue > 0 ) {
            particle.text = '+';
            particle.color = POSITIVE_COLOR;
        }
        else {
            particle.text = '-';
            particle.color = NEGATIVE_COLOR;
        }

        _.each ( _.range ( Math.abs ( lastValue ) * 2 ) ,
            function ( ordinal ) {
                var clone = particle.clone ();

                clone.x = 10 + Math.random () * ( that.stageWidth - 10)
                clone.y = that.stageHeight - ( 2 + Math.random () * 5 );
                clone.alpha = 0.2 + Math.random () * 0.8;
                clone.scaleX = clone.scaleY = 0.5 + Math.random () * 1.5;

                //custom property
                clone.speed = 0.5 + Math.random ();

                that.particles.push ( clone );
                that.stage.addChild ( clone );
            }
        );

        //blink text
        that.score.color = that.score.text.indexOf ( '-' ) < 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
        if ( lastValue < 0 ) _blinkText ( this );

        //voteScore bubble next to mouse
        _voteBuble ( lastValue , clickEvent );
    };

    Game.Animate.prototype.isCanvasSupported = (function () {
        var elem = document.createElement ( 'canvas' );
        return ! ! (elem.getContext && elem.getContext ( '2d' ));
    } ());

} ());
//1 1 2 3 5 8 13 21 34 55 89 144 233 377