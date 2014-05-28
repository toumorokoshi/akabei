var logger = require('./logger.js');
var PhantomInstance = require('./phantom_instance.js');

function PhantomCluster(config) {
    config = config || {};

    // a dictionary holding all phantomjs instances
    // the key is the port, with the value being a phantom object
    this._phantomInstances = {};

    // the total number of ports available is maxPort - minPort
    // the minimum port number that can be used
    this._minPort = config.minPort || '31000';
    // the maximum port number that can be used
    this._maxPort = config.maxPort || '32000';
}

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

module.exports = PhantomCluster;
