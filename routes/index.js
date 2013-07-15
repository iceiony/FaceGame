exports.index = function(req,res){
    var anonymousName = 'anonymous.'+Math.ceil(Math.random()*10000);
    res.redirect ( "/quiz/" + anonymousName + "/" );
};

