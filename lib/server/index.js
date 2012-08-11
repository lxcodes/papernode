var express = require('express');
var fs = require('fs');
var connect = require('connect');

var server = function(options){
    this.options = options;

    this._server = express.createServer();
    this._server.use( connect.favicon(this.options.dir+'/public/favicon.ico') );
    this._server.use( connect.static(this.options.dir+'/public') );
    this._server.use( connect.bodyParser() );
    this._server.use( connect.cookieParser(this.options.secret) );
    this._server.use( connect.query() );

    //load api
    var api = require('../api').createAPI(this.options);
    this._server.all(api.path+'*', api.route);


    //all plugins are appended to the api path

    //load plugins from settings
    if( this.options.plugins.length ){
        for( var i in this.options.plugins ){
            var plugin = null;

            //try global
            try{
                plugin = require(this.options.plugins[i]);
            //force project local
            }catch(e){
                plugin = require(this.options.dir+'/node_modules/'+this.options.plugins[i]);
            }
            this._server.all(api.path+plugin.path+'*', plugin.route);
        }
    }

    //autoload plugins from 'plugins' directory
    if( fs.existsSync(this.options.dir + '/plugins') ){
        var plugins = fs.readdirSync(this.options.dir + '/plugins');
        for( var i in plugins ){
            var plugin = require(this.options.dir+'/plugins/'+plugins[i]);
            this._server.all(api.path+plugin.path+'*',plugin.route);
        }
    }
};


server.prototype.addInterface = function(iface){
    if( this._server ){
        this._server.all( iface.path, iface.route );
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
        interfaces: [],
        plugins: [],
        secret: 'papernode'
    };

    for( var key in args ){
	options[key] = args[key];
    }

    if( !fs.existsSync(options.dir) ){
        throw 'Project Directory ' + dir + ' Does Not Exist';
    }

    options.dir = fs.realpathSync(options.dir);

    var srv = new server(options);

    //load interfaces from options
    if( options.interfaces.length > 0 ){
        for( var i in options.interfaces ){
            //try global
            try{
                srv.addInterface( require(options.interfaces[i]) );
            
            //force project local
            }catch(e){
                srv.addInterface( require(options.dir+'/node_modules/'+options.interfaces[i]) );
            }
        }
    }

    //auto load interfaces from project directory
    if( fs.existsSync(options.dir + '/interfaces') ){
        var interfaces = fs.readdirSync(options.dir+'/interfaces');
        for( var i in interfaces ){
            var iface = options.dir+'/interfaces/'+interfaces[i];
            srv.addInterface( require(iface) );
        }
    }

    return srv;
};