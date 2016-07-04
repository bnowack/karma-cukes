
/* global __dirname */

/**
 * Registers the Karma-Cukes plugin (`cukes`) and a JSON Reporter (`cukes-json`)
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */
"use strict";

var path = require('path');
var KarmaCukesJsonReporter = require('./KarmaCukesJsonReporter');
var KarmaCukesPrettyReporter = require('./KarmaCukesPrettyReporter');
var KarmaCukesProgressReporter = require('./KarmaCukesProgressReporter');

var KarmaCukesPlugin = function(files) {
    files.unshift(
        { pattern: path.dirname(require.resolve('jquery')) + '/jquery.min.js', included: true, served: true },
        { pattern: path.dirname(require.resolve('cucumber')) + '/../release/cucumber.js', included: true, served: true },
        { pattern: __dirname + "/error-patch.js", included: true, served: true },
        { pattern: __dirname + "/module-patch.js", included: true, served: true },
        { pattern: __dirname + "/base64encode.js", included: true, served: true },
        { pattern: __dirname + "/KarmaCukesBrowser.js", included: true, served: true },
        { pattern: __dirname + "/KarmaCukesListener.js", included: true, served: true },
        { pattern: __dirname + "/KarmaCukesWorld.js", included: true, served: true },
        { pattern: __dirname + "/KarmaCukes.js", included: true, served: true }
    );
};

KarmaCukesPlugin.$inject = ['config.files'];

module.exports = {
    "framework:karma-cukes": ['type', KarmaCukesPlugin],
    "reporter:kc-json": ['type', KarmaCukesJsonReporter],
    "reporter:kc-pretty": ['type', KarmaCukesPrettyReporter],
    "reporter:kc-progress": ['type', KarmaCukesProgressReporter]
};