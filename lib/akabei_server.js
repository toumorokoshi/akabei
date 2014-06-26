var express = require('express');

module.exports = function (config,
                           phantomSeleniumGridInstance)
{
    if (config === null || phantomSeleniumGridInstance == null) {
        return new Error("config and phantomSeleniumGridInstance are required!");
    }

    var akabeiServer = express();
    akabeiServer.get('/', function(req, res) {
        status(config, phantomSeleniumGridInstance, res);
    });

    return akabeiServer;
};


// return the status of the phantomGrid
function status(config, phantomGrid, res) {
    var grid = phantomGrid.getSeleniumGrid(),
        cluster = phantomGrid.getPhantomCluster();
   res.send({
       'config': config,
       'seleniumGridServer': grid.getStatus(),
       'phantomInstancesStatus': cluster.getStatus()
    });
};
