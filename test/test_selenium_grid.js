var assert = require('assert');
var SeleniumGrid = require('../lib/selenium_grid.js');

describe('SeleniumGrid', function () {
    describe('#start()', function () {
        it('should start the selenium grid server', function () {
            var sg = new SeleniumGrid({
                'seleniumServerJar': './extbin/selenium-server-standalone-2.42.0.jar'
            });
            sg.start();
            console.log('sleeping...');
            sg.stop();
        });
    });
});
