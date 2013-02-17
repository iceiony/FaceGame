(function () {
    $(document).ready(function () {
        var scoreBox = $('#scoreBox'),
            quizQuestions = [],
            overrideLinkAction = function () {
                $('a').each(function (index, element) {
                    $(element).click(clickHandler);
                });
            },
            clickHandler = function (event) {
                $.ajax({
                    type: 'GET',
                    url: event.target.href,
                    dataType: 'json',
                    complete: function (validationResponse) {
                        var res = JSON.parse(validationResponse.responseText),
                            nextQuestion = quizQuestions[0];

                        console.log(validationResponse.responseText);
                        scoreBox.text("Score " + res.score);
                        $('img').replaceWith(nextQuestion.img);
                        $('ul').replaceWith(nextQuestion.ul);

                        quizQuestions = quizQuestions.splice(1);
                        overrideLinkAction();
                        preLoadQuestion(res.quizLink);
                    }});


                event.stopPropagation();
                return false;
            }
            ,
            preLoadQuestion = function (quizUrl) {
                $.ajax({
                    type: 'GET',
                    url: quizUrl,
                    dataType: 'json',
                    complete: function (validationResponse) {
                        var newQuiz = JSON.parse(validationResponse.responseText),
                            image = $("<img/>", {src: newQuiz.imageSrc}),
                            optionList = $("<ul/>"),
                            i, len, option , link;

                        for (i = 0, len = newQuiz.links.length; i < len; i += 1) {
                            option = $('<li/>');
                            link = $('<a/>', {href: encodeURI("http://" + document.location.host + newQuiz.links[i].href)});
                            link.text(newQuiz.links[i].text);
                            link.appendTo(option);
                            option.appendTo(optionList);
                        }

                        quizQuestions.push({img: image, ul: optionList});
                    }});
            };

        overrideLinkAction();
        preLoadQuestion(window.location.toString());
    });
}());