var express = require('express');
var fs = require('fs');

var server = function(options){
    this.options = options;

    this._server = express.createServer();
    this._server.all('/api/*', function(req,res){
        res.send('api');
    });
};


server.prototype.addPlugin = function(plugin){
    if( this._server ){
        this._server.all( plugin.path, plugin.route );
    }
}

server.prototype.start = function(){
    if( this._server ){
        this._server.listen(this.options.port);
    }
};


module.exports = function( args ){
    var options = {
	port: 8080,
	dir: './',
        plugins: []
    };

    for( var key in args ){
	options[key] = args[key];
    }

    if( !fs.existsSync(options.dir) ){
        throw 'Project Directory ' + dir + ' Does Not Exist';
    }

    options.dir = fs.realpathSync(options.dir);

    var srv = new server(options);

    //load plugins from options
    if( options.plugins.length > 0 ){
        for( var i in options.plugins ){
            //try global
            try{
                srv.addPlugin( require(options.plugins[i]) );
            
            //force project local
            }catch(e){
                srv.addPlugin( require(options.dir+'/node_modules/'+options.plugins[i]) );
            }
        }
    }

    //auto load plugins from project directory
    if( fs.existsSync(options.dir + '/plugins') ){
        var plugins = fs.readdirSync(options.dir+'/plugins');
        for( var i in plugins ){
            var plugin = options.dir+'/plugins/'+plugins[i];
            srv.addPlugin( require(plugin) );
        }
    }

    return srv;
};