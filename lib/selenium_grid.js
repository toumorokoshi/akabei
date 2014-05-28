var child_process = require('child_process');
var logger = require('./logger.js');

var requiredConfigParams = ['seleniumServerJar'];
// the message that prints when the socket is connected
var gridStartedMessage = 'Started SocketConnector@0.0.0.0:4444';

// a wrapper over a selenium grid
function SeleniumGrid(config) {

    requiredConfigParams.forEach(function (requiredParam) {
        if (config[requiredParam] === null) {
            return Error(
                'parameter ' + requiredParam + ' is required for SeleniumGrid!'
            );
        }
        return null;
    });

    this.seleniumServerJar = config.seleniumServerJar;
    this.port = config.port || '4444';
    this._process = null;
    this._ready = false;
    // the log, as a string
    this._log = "";
}

SeleniumGrid.prototype.start = function () {
   if (this._process === null) {
       this._process = child_process.spawn('java', this._buildArguments());
       this._process.stderr.on('data', function (data) {
           if (('' + data).indexOf(gridStartedMessage) && !this._ready) {
               logger.info("SeleniumGrid (:" + this.port + ") is ready!");
               this._ready = true;
           }
       }.bind(this));
       logger.info('Starting Selenium Grid instance on port ' + this.port
                   + ' and pid ' + this.getPID());
   }
};

SeleniumGrid.prototype.stop = function () {
    if (this._process !== null) {
        // TODO: this doesn't send a SIGKILL, so it might not
        // shut down processes cleanly. Make sure it does that
        var pid = this.getPID();
        this._process.kill();
        this._process = null;
        logger.info('Stopping Selenium Grid instance on port ' + this.port
                    + ' and pid ' + pid);
    }
};

SeleniumGrid.prototype.getPID  = function () {
    if (this._process === null) {
        return null;
    }
    return this._process.pid;
};

SeleniumGrid.prototype._buildArguments = function () {
    return ['-jar', this.seleniumServerJar,
            '-role', 'hub',
            '-port', this.port];
};

module.exports = SeleniumGrid;
