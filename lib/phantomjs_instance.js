var child_process = require('child_process');
var logger = require('./logger.js');

function PhantomJSInstance(config) {

    if (config.port === null) {
        return new Error('port value is required!');
    }

    this.port = config.port; // the port the phantom process runs on
    // the selenium grid to connect the phantomjs instance to
    this.seleniumGridHub = config.seleniumGridHub;
    // additional arguments to pass into the phantomjs instance
    this.additionalArguments = config.additionalArguments || '';
    this.executablePath = './node_modules/.bin/phantomjs';
    this._process = null; // the handle to the process
}

PhantomJSInstance.prototype.start = function () {
    if (this._process === null) {
        this._process = child_process.exec(this._buildStartString());
        logger.info('Starting PhantomJS instance on port ' + this.port
                    + ' and pid ' + this.getPID());
    }
};

PhantomJSInstance.prototype.stop = function () {
    if (this._process !== null) {
        // TODO: this doesn't send a SIGKILL, so it might not
        // shut down processes cleanly. Make sure it does that
        this._process.kill();
        this._process = null;
        logger.info('Stopping PhantomJS instance on port ' + this.port
                    + ' and pid ' + this.getPID());
    }
};

PhantomJSInstance.prototype.getPID  = function () {
    if (this._process === null) {
        return null;
    }
    return this._process.pid;
};

// build the start string to pass to exec
PhantomJSInstance.prototype._buildStartString = function () {
    var startString = this.executablePath
            + ' --webdriver=0.0.0.0:' + this.port
            + ' ' + this.additionalArguments;
    if (this.seleniumGridHub !== null) {
        startString += ' --webdriver-selenium-grid-hub=' + this.seleniumGridHub;
    }
    return startString;
};

module.exports = PhantomJSInstance;
