var child_process = require('child_process');
var httpsync = require('httpsync');
var events = require('events');
var timers = require('timers');
var logger = require('./logger.js');
var fs = require('fs');

var instanceStartMessage = 'GhostDriver - Main - running on port';

function PhantomInstance(config) {

    if (config.port === null) {
        return new Error('port value is required!');
    }

    /* USER CONFIGURABLE OPTIONS */
    this._port = parseInt(config.port, 10); // the port the phantom process runs on
    // the selenium grid to connect the phantomjs instance to
    this.seleniumGridHub = config.seleniumGridHub;
    // additional arguments to pass into the phantomjs instance
    this._additionalArguments = config.additionalArguments || [];
    // if set to true, phantomjs instances will restart automatically
    this._doRefresh = config.doRefresh || false;
    // the rate at which the phantomjs instances will restart
    // default is 1 hour
    this._refreshRate = config.refreshRate || 60 * 60 * 1000;
    this.executablePath = config.executablePath;
    // when attempting a stop, the phantomjs instance will wait a certain
    // period of time for the process to become inactive before
    // killing the process. This is failsafe to unsafely kill the process
    // after a certain period of time (e.g. hanging, unresponsiveness)
    this._stopTimeoutDuration = config.stopTimeoutDuration || 5 * 60 * 1000;

    /* END USER CONFIGURABLE OPTIONS */

    this._process = null; // the handle to the process
    // holds the refesh interval object
    this._refreshIntervalObject = null;
    // the time this current phantomjs subprocess was started.
    this._startDate = null;
    this._isReady = false;

    this._validateConfig();

    if (this._doRefresh) {
        this.startRefreshTimer();
    }
}

// SeleniumGrid fires events
PhantomInstance.prototype.__proto__ = events.EventEmitter.prototype;


PhantomInstance.prototype.getStatus = function () {
    return {
        'running': this._process !== null,
        'ready': this._isReady,
        'pid': this.getPID(),
        'port': this._port,
        'startDate': this._startDate,
        'isActive': this.isActive()
    };
};

PhantomInstance.prototype.restart = function () {
    if (this._process === null) {
        this.start();
    } else {
        this.stop(function (code, signal) {
            this._log('info', 'stopped process, restarting...');
            this.start();
        }.bind(this));
    }
};

PhantomInstance.prototype.start = function () {
    if (this._process === null) {
        this._process = child_process.spawn(this.executablePath,
                                            this._buildArguments());

        this._process.on('error', function(err) {
            this._log('error', '\n' + err.stack);
            this.emit(
                'error',
                new Error("Unable to spawn phantomjs instance")
            );
        }.bind(this));

        this._process.stdout.on('data', function (data) {
           this._log(data);
           if (('' + data).indexOf(instanceStartMessage) && !this._isReady) {
               this._log('info', "PhantomJS is ready!");
               this.emit('ready');
               this._isReady = true;
           }
        }.bind(this));
        this._process.on('end', function() {
            // if the process died, restart it
            if (this._process) {
                this.restart();
            }
        }.bind(this));
        this._startDate = new Date();
        logger.info('Starting PhantomJS instance on port ' + this._port
                    + ' and pid ' + this.getPID());
    }
};

PhantomInstance.prototype.stop = function (stopCallback) {
    if (this._process) {
        logger.info('Stopping PhantomJS instance on port ' + this._port
                    + ' and pid ' + this.getPID());
        // TODO: this doesn't send a SIGKILL, so it might not
        // shut down processes cleanly. Make sure it does that
        this._process.on('exit', function() {
            this._process = null;
            if(stopCallback) {
                stopCallback();
            }
        }.bind(this));

        this._inactiveCallBack(function (isInactive) {

            if (!isInactive) {
                this._process.kill();
                this._log('warn', 'process has been active beyond the timeout of ' + this._stopTimeoutDuration + ' ms. killing instead.');
                return;
            }

            var url = 'http://127.0.0.1:' + this._port + '/shutdown';
            try {
                var result = httpsync.get({
                    url: url
                }).end();
                if (result.statusCode >= 400) {
                    this.emit('error',
                              'Unable to stop phantomjs instance!' +
                              'received response code of ' + result.statusCode);
                }
            } catch(err) {
                this._log('debug', '\n' + err.stack);
                this._log('info', url + ' did not load. assuming process is not active.');
            }

        }.bind(this), this._stopTimeoutDuration);
    }
};

// poll the system for inactivity, and call callback with true
// when no longer active, or callback with false if
// the timeout (in ms) was reached
PhantomInstance.prototype._inactiveCallBack = function (callback, timeout) {
    if (!this.isActive()) {
        callback(true);
        return;
    }

    if (timeout < 0) {
        callback(false);
        return;
    }

    setTimeout(function () {
        this._inactiveCallBack(callback, timeout - 100);
    }.bind(this), 100);
};

// returns true or false if the current phantom process is
// running and is handling a request
PhantomInstance.prototype.isActive = function () {
    if (this._process === null || !this._isReady) {
        return false;
    }
    var url = 'http://127.0.0.1:' + this._port + '/sessions';
    try {
        var result = httpsync.get({
            url: url
        }).end();
        return JSON.parse(result.data).value.length > 0;
    } catch(err) {
        this._log('info', url + ' did not load. assuming process is not active.');
        return false;
    }
};

PhantomInstance.prototype.getPID  = function () {
    if (this._process === null) {
        return null;
    }
    return this._process.pid;
};

PhantomInstance.prototype.startRefreshTimer = function () {
    if (this._refreshIntervalObject === null) {
        this._log('debug', 'starting timer for refreshing phantomjs instance...');
        this._refreshIntervalObject =
            timers.setInterval(this.restart.bind(this),
                               this._refreshRate);
    }
};

PhantomInstance.prototype.stopRefreshTimer = function () {
    if (this._refreshIntervalObject === null) {
        this._log('debug', 'stopping timer for refreshing phantomjs instance...');
        this._refreshIntervalObject.clearInterval();
        this._refreshIntervalObject = null;
    }
};

// build the start string to pass to exec
PhantomInstance.prototype._buildArguments = function () {
    var startString = ['--webdriver=127.0.0.1:' + this._port];
    if (this.seleniumGridHub !== null) {
        startString.push('--webdriver-selenium-grid-hub=' + this.seleniumGridHub);
    }
    return startString.concat(this._additionalArguments);
};

PhantomInstance.prototype._validateConfig = function () {

    // make sure the phantomjs executable exists
    if (!fs.existsSync(this.executablePath)) {
        this.emit(
            'error',
            new Error("File at " + this.executablePath + " does not exist!")
        );
    }
};



PhantomInstance.prototype._log = function (level, message) {
    var prefix = '<PhantomJS :' + this._port + '> ';
    logger.log(level, prefix + message);
};

module.exports = PhantomInstance;
