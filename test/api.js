var assert = require('assert');
var http = require('http');
var api = require('../').api;


describe('API', function(){
	var testAPI = api.createAPI();

	it('should have proper path', function(){
		var path = testAPI.path;

		assert.ok( path[0]==='/', 'api path does not start with a slash' );
		assert.ok( path[path.length-1]==='/', 'api path does not end with a slash' );
	    });
    });