var child_process = require('child_process');
var events = require('events');
var logger = require('./logger.js');

var instanceStartMessage = 'GhostDriver - Main - running on port';

function PhantomInstance(config) {

    if (config.port === null) {
        return new Error('port value is required!');
    }

    this.port = config.port; // the port the phantom process runs on
    // the selenium grid to connect the phantomjs instance to
    this.seleniumGridHub = config.seleniumGridHub;
    // additional arguments to pass into the phantomjs instance
    this._additionalArguments = config.additionalArguments || [];
    this.executablePath = './node_modules/.bin/phantomjs';
    this._process = null; // the handle to the process
    this._isReady = false;
}

// SeleniumGrid fires events
PhantomInstance.prototype.__proto__ = events.EventEmitter.prototype;

PhantomInstance.prototype.start = function () {
    if (this._process === null) {
        this._process = child_process.spawn(this.executablePath,
                                            this._buildArguments());
        this._process.stderr.on('data', function (data) {
           if (('' + data).indexOf(instanceStartMessage) && !this._isReady) {
               logger.info("PhantomJS (:" + this.port + ") is ready!");
               this.emit('ready');
               this._isReady = true;
           }
        }.bind(this));
        logger.info('Starting PhantomJS instance on port ' + this.port
                    + ' and pid ' + this.getPID());
    }
};

PhantomInstance.prototype.stop = function () {
    if (this._process !== null) {
        // TODO: this doesn't send a SIGKILL, so it might not
        // shut down processes cleanly. Make sure it does that
        this._process.kill();
        this._process = null;
        logger.info('Stopping PhantomJS instance on port ' + this.port
                    + ' and pid ' + this.getPID());
    }
};

PhantomInstance.prototype.getPID  = function () {
    if (this._process === null) {
        return null;
    }
    return this._process.pid;
};

// build the start string to pass to exec
PhantomInstance.prototype._buildArguments = function () {
    var startString = ['--webdriver=127.0.0.1:' + this.port];
    if (this.seleniumGridHub !== null) {
        startString.push('--webdriver-selenium-grid-hub=' + this.seleniumGridHub);
    }
    return startString.concat(this._additionalArguments);
};

module.exports = PhantomInstance;
