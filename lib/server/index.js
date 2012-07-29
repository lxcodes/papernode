var express = require('express');


module.exports = function( args ){
    var options = {
	port: 8080,
	dir: './',
    };

    for( var key in args ){
	options[key] = args[key];
    }

    return options;
};