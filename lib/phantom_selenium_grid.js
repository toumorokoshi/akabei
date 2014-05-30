var logger = require('./logger.js');
var SeleniumGrid = require('./selenium_grid.js');
var PhantomCluster = require('./phantom_cluster.js');

function errorCallback(error) {
    logger.info('' +  error);
}

function PhantomSeleniumGrid(config,
                             seleniumGridConfig,
                             phantomClusterConfig)
{
    this._initialCount = config.initialCount || 0;
    this._seleniumGrid = new SeleniumGrid(seleniumGridConfig);
    this._phantomCluster = new PhantomCluster({
        'defaultPhantomConfig': {
            'seleniumGridHub': 'http://' + this._seleniumGrid.getURL()
        },
        'errorCallback': errorCallback
    });
}


PhantomSeleniumGrid.prototype.start = function () {
    this._seleniumGrid.start();
    this._seleniumGrid.on('ready', function () {
        this._startPhantomCluster();
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

PhantomSeleniumGrid.prototype._startPhantomCluster = function () {
    logger.info('Spawning ' + this._initialCount + ' phantom instances...');
    for (var i = 0; i < this._initialCount; i++) {
        this._phantomCluster.spawnPhantom();
    }
};

module.exports = PhantomSeleniumGrid;
