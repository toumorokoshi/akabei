var logger = require('./logger.js');
var SeleniumGrid = require('./selenium_grid.js');

function PhantomSeleniumGrid(seleniumGridConfig) {
    this._seleniumGrid = new SeleniumGrid(seleniumGridConfig);
};


PhantomSeleniumGrid.prototype.start = function () {
    this._seleniumGrid.start();
};

PhantomSeleniumGrid.prototype.stop = function () {
    this._seleniumGrid.stop();
};

module.exports = PhantomSeleniumGrid;
