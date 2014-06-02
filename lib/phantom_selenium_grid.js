var logger = require('./logger.js');
var SeleniumGrid = require('./selenium_grid.js');
var PhantomCluster = require('./phantom_cluster.js');
var requiredConfigParams = ['seleniumGridConfig',
                            'phantomClusterConfig'];

function errorCallback(error) {
    logger.info('' +  error);
}

function PhantomSeleniumGrid(config)
{
    requiredConfigParams.forEach(function (requiredParam) {
        if (config[requiredParam] === null) {
            return Error(
                'parameter ' + requiredParam + ' is required for SeleniumGrid!'
            );
        }
        return null;
    });

    this._seleniumGrid = new SeleniumGrid(config.seleniumGridConfig);

    var phantomClusterConfig = config.phantomClusterConfig;
    phantomClusterConfig.defaultPhantomConfig.seleniumGridHub =
        'http://' + this._seleniumGrid.getURL();
    phantomClusterConfig.errorCallback = errorCallback;
    this._phantomCluster = new PhantomCluster(phantomClusterConfig);
}


PhantomSeleniumGrid.prototype.start = function () {
    this._seleniumGrid.start();
    this._seleniumGrid.on('ready', function () {
        this._phantomCluster.start();
    }.bind(this));
};

PhantomSeleniumGrid.prototype.stop = function () {
    this._seleniumGrid.stop();
    this._phantomCluster.stopAll();
};

PhantomSeleniumGrid.prototype.getPhantomCluster = function () {
    return this._phantomCluster;
};

PhantomSeleniumGrid.prototype.getSeleniumGrid = function () {
    return this._seleniumGrid;
};

module.exports = PhantomSeleniumGrid;
