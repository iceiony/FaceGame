exports.QuizEngine = (function () {
    return{
        generateQuestion: function () {
            return  {
                imageName: "Koala.jpg",
                options: ['Koala', 'Kooala', 'Cooala']
            };
        }
    };
}());

exports.QuizRule = function () {
}

exports.QuizType = {
    "multiChoice": 1
}