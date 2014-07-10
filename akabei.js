#!/usr/bin/env node

var doc = "\
akabei, a phantomjs cluster manager               \n\
Usage:                                            \n\
  akabei [-v -l <log_file>] [<config_file>]       \n\
  akabei -h | --help                              \n\
                                                  \n\
Options:                                          \n\
  -v, --verbose  will output debug info           \n\
  -l, --log      path to a file to log output to  \n\
";

var docopt = require('docopt');
var logger = require('./lib/logger');
var winston = require('winston');

var args = docopt.docopt(doc),
    config_file = args['<config_file>'] || './config.js',
    loggingLevel = args['-v'] ? 'debug' : 'info';

logger.transports.console.level = loggingLevel;

console.log(args);
if (args['--log']) {
    logger.add(winston.transports.File, {
        filename: args['<log_file>'],
        level: loggingLevel
    });
}

console.log('loading config file from ' + config_file + '...');
var config = require(config_file);

var akabeiServer = require('./lib/akabei_server.js');
var PhantomSeleniumGrid = require('./lib/phantom_selenium_grid.js');

var hostname = config.akabeiServerConfig.hostname || '0.0.0.0',
    port = config.akabeiServerConfig.port || 8000;

var grid = new PhantomSeleniumGrid(config);

console.log('starting akabei with pid ' + process.pid);

grid.start();
// not stopping the grid will cause orphaned phantom processes
process.on('uncaughtException', function(err) {
    grid.stop();
    console.log(err.stack);
    process.exit(1);
});

['SIGINT', 'SIGTERM'].forEach(function (signal) {
    process.on(signal, function() {
        console.log("Caught " + signal + ", exiting...");
        grid.stop();
        process.exit(0);
    });
});


var app = akabeiServer(config.akabeiServerConfig, grid);
app.listen(port, function () {
    console.log('Started server at ' + hostname + ':' + port);
});
