#!/usr/bin/env node

var doc = "\
akabei, a phantomjs cluster manager \n\
Usage:                              \n\
  akabei [<config_file>]            \n\
  akabei -h | --help                \n\
";

docopt = require('docopt');

var args = docopt.docopt(doc),
    config_file = args['<config_file>'] || './config.js';

console.log('loading config file from ' + config_file + '...');
var config = require(config_file);

var akabeiServer = require('./lib/akabei_server.js');
var PhantomSeleniumGrid = require('./lib/phantom_selenium_grid.js');

var hostname = config.akabeiServerConfig.hostname || '0.0.0.0',
    port = config.akabeiServerConfig.port || 8000;

var grid = new PhantomSeleniumGrid(config);

grid.start();
// not stopping the grid will cause orphaned phantom processes
process.on('uncaughtException', function(err) {
    grid.stop();
    console.log(err.stack);
    process.exit(1);
});

var app = akabeiServer(config.akabeiServerConfig, grid);
app.listen(port, function () {
    console.log('Started server at ' + hostname + ':' + port);
});
