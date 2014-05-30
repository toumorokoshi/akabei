var logger = require('./logger.js');
var timers = require('timers');
var PhantomInstance = require('./phantom_instance.js');

function PhantomCluster(config) {
    config = config || {};

    // this is the maximum number of
    // phantoms allowed to spawn at any given time
    this._maxInstances = config.maxInstances || 10;
    // the total number of ports available is maxPort - minPort
    // the minimum port number that can be used
    this._minPort = config.minPort || '31000';
    // the maximum port number that can be used
    this._maxPort = config.maxPort || '32000';
    // this is the rate at which the PhantomCluster will clean up
    // older phantom processes and replace them.
    // this is performed due to the memory leaks in phantomjs
    // default is 10 minutes
    // this._refreshRate = config.refreshRate || 10 * 60 * 1000;
    this._refreshRate = config.refreshRate || 1000;

   // where the refresh interval object is held
    this._refreshIntervalObject = null;
    // a dictionary holding all phantomjs instances
    // the key is the port, with the value being a phantom object
    this._phantomInstances = {};
}

PhantomCluster.prototype.getStatus = function () {
    return {
        'phantomInstancesStatus': this._getInstancesStatus()
    };
};

PhantomCluster.prototype.getInstances = function () {
    return this._phantomInstances;
};

// spawn a phantomjs instance
PhantomCluster.prototype.spawnPhantom = function (
    phantomInstanceConfig,
    errorCallback
) {
    errorCallback = errorCallback || function () {};
    phantomInstanceConfig = phantomInstanceConfig || {};

    var port = this._getUnusedPort();
    if (port === null) {
        errorCallback(Error("Unable to retrieve any ports!"));
    }

    phantomInstanceConfig.port = port;
    if (!phantomInstanceConfig.hasOwnProperty('doRefresh')) {
        phantomInstanceConfig.doRefresh = true;
    }

    var phantomInstance = new PhantomInstance(phantomInstanceConfig);
    // TODO: error handling here if phantomInstance is an error
    phantomInstance.start();
    this._phantomInstances[port] = phantomInstance;

    return phantomInstance;
};

// shut down everything
PhantomCluster.prototype.stopAll = function () {
    for (var port in this._phantomInstances) {
        this._phantomInstances[port].stop();
    }
    this._phantomInstances = [];
};

PhantomCluster.prototype._getInstancesStatus = function () {
    var returnValue = {};
    for (var port in this._phantomInstances) {
        if (this._phantomInstances.hasOwnProperty(port)) {
            returnValue[port] = this._phantomInstances[port].getStatus();
        }
    }
    return returnValue;
};

PhantomCluster.prototype._getUnusedPort = function () {
    var port = this._minPort;
    while (port < this._maxPort) {
        if (!this._phantomInstances[port]) {
            return port;
        }
        port++;
    }
    return null;
};

PhantomCluster.prototype._refreshPhantomProcesses = function () {
    logger.info('refreshing phantom processes...');
    for (var port in this._phantomInstances) {
    }
};

// start a timer that will periodically query and regenerate
// phantomjs instances
PhantomCluster.prototype.startTimer = function () {
    if (this._refreshIntervalObject === null) {
        logger.info('starting timer for refreshing phantomjs objects...');
        this._refreshIntervalObject =
            timers.setInterval(this._refreshPhantomProcesses.bind(this),
                               this._refreshRate);
    }
};

PhantomCluster.prototype.stopTimer = function () {
    if (this._refreshIntervalObject !== null) {
        logger.info('stopping timer for refreshing phantomjs objects...');
        this._refreshIntervalObject.clearInterval();
        this._refreshIntervalObject = null;
    }
};

module.exports = PhantomCluster;
