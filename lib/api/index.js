var fs = require('fs');

var api = function( args ){
    this.options = {
        api: {
            path: '/api/'
        }
    };

    for( var key in args ){
        this.options[key] = args[key];
    }

    //make sure there is a trailing slash
    if( this.options.api.path[ this.options.api.path.length-1 ] != '/' ){
        this.options.api.path += '/';
    }
};

api.prototype = {
    get path(){
        return this.options.api.path;
    }
};

api.prototype.route = function(req,res,next){
    //global api logic

    //setup req.request variable
    //posted data overrides any/all query string variables
    req.request = {};
    for( var key in req.query ){
        req.request[key] = req.query[key];
    }
    for( var key in req.body ){
        req.request[key] = req.body[key];
    }


    //let other plugins handle requests
    next();
};


module.exports = {
    createAPI: function( options ){
        return new api(options);
    }
};