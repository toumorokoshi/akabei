#!/usr/bin/env node

var http = require('http');
var PhantomSeleniumGrid = require('./lib/phantom_selenium_grid.js');

var hostname = '0.0.0.0',
    port = 8000,
    seleniumServerJar = './extbin/selenium-server-standalone-2.42.0.jar';

/*
 http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
 }).listen(port, hostname);
*/

var grid = new PhantomSeleniumGrid({
    'seleniumServerJar': seleniumServerJar
});

grid.start();

setTimeout(function() {
    console.log('hello!');
}, 5000);
// sg.stop();



// console.log('Started server at ' + hostname + ':' + port);
