#!/usr/bin/env node

var akabeiServer = require('./lib/akabei_server.js');
var PhantomSeleniumGrid = require('./lib/phantom_selenium_grid.js');

var hostname = '0.0.0.0',
    port = 8000,
    seleniumServerJar = './bin/selenium-server-standalone-2.42.0.jar';

var phantomSeleniumGridConfig = {
    'initialCount': 10
};

var seleniumGridConfig = {
    'seleniumServerJar': seleniumServerJar
};

var akabeiServerConfig = {
};

var grid = new PhantomSeleniumGrid(
    phantomSeleniumGridConfig,
    seleniumGridConfig
);

grid.start();


var app = akabeiServer(akabeiServerConfig, grid);
app.listen(port, function () {
    console.log('Started server at ' + hostname + ':' + port);
});
