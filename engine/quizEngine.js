exports.QuizEngine = (function () {
    return{
        generateQuestion: function () {
            return  {
                imageName: "Koala.jpg",
                options: ['Koala', 'Kooala', 'Cooala'],
                points: {
                    'Koala' : 10,
                    'Kooala': 0,
                    'Cooala': -10
                }
            };
        }
    };
}());

exports.QuizRule = function () {
}

exports.QuizType = {
    "multiChoice": 1
}