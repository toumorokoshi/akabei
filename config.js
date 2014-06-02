module.exports = {
    // configuration for the server that reports information
    // about akabei
    'akabeiServerConfig': {
        'hostname': '0.0.0.0',
        'port': 8000
    },
    // configuration explicitely for the SeleniumGrid
    // this is the service that delegates selenium requests to
    // phantom instances
    'seleniumGridConfig': {
        // path to the selenium serve jar
        'seleniumServerJar': './bin/selenium-server-standalone-2.42.0.jar'
    },
    // configuration for the phantom cluster
    // the phantom cluster manages the phantom
    // instances
    // look at ./lib/phantom_cluster.js for all options
    'phantomClusterConfig': {
        'initialCount': 15,
        'maxInstances': 100,
        'desiredLoad': 0.7,
        'minPort': 31000,
        'maxPort': 32000,
        // this configuration is applied to every phantomjs
        // instances as it's created
        'defaultPhantomConfig': {
            // the path to the phantomjs executable to use
            'executablePath': './node_modules/.bin/phantomjs'
        }
    }
};
