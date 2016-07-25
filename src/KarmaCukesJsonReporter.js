
var fs = require('fs');
var path = require('path');

/**
 * Karma-Cukes JSON Reporter
 * 
 * Generates reports compatible with Cucumber's built-in JSON reporter
 *  
 * @author Benjamin Nowack <mail@bnowack.de>
 * @param {module:karma/reporter/base} baseReporterDecorator - Karma base reporter
 * @param {module:log4js} logger - Karma logger
 * @param {module:karma/helper} helper - Karma helper
 * @param {Object} config - Karma config
 * @returns {KarmaCukesJsonReporter} Cucumber JSON Reporter
 */
KarmaCukesJsonReporter = function (baseReporterDecorator, logger, helper, config) {
    // extend base reporter
    baseReporterDecorator(this);
    
    /**
     * Initializes the reporter
     */
    this.init = function () {
        // create a custom logger
        this.logger = logger.create('reporter:karma-cukes-json');
        
        // block console
        this.adapters = [];
        
        // init report
        this.report = [];
        
        // init helper variables
        this.feature = null;
        this.scenario = null;
    };
    
    /**
     * Processes cucumber step results and fills the report with features, scenarios and steps
     * 
     * @param {module:karma/browser} browser - Browser object
     * @param {Object} result - Step result from KarmaCukesListener
     */
    this.onSpecComplete = function (browser, result) {
        // step belongs to new feature
        if (!this.feature || this.feature.uri !== result.feature.uri) {
            this.feature = result.feature;
            this.feature.browser = browser.name;
            this.feature.elements = [];
            this.report.push(this.feature);
            this.scenario = null;
        }
        // step belongs to new scenario
        if (!this.scenario || this.scenario.id !== result.scenario.id) {
            this.scenario = result.scenario;
            this.scenario.steps = [];
            this.feature.elements.push(this.scenario);
        }
        // add step result
        this.scenario.steps.push(result.step);
    };
    
    /**
     * Writes or dumps the report
     * 
     * @param {module:karma/browser} browser - Browser object
     */
    this.onBrowserComplete = function(browser) {
        var reporterConfig = config.kcJsonReporter || {};
        var fileName = reporterConfig.outputFile || null;
        if (fileName) {
            this.writeReport(browser, this.init);
        } else {
            this.logReport();
            // reset cache and stats
            this.init();
        }
    };

    /**
     * Prevents Karma from exiting with code 1
     * 
     * @param {module:karma/browser_collection} browsers - Browser collection
     * @param {Object} results - Final runner results
     */
    this.onRunComplete = function (browsers, results) {
        // prevent node.js npm ERR
        results.exitCode = 0;
    };

    /**
     * Writes the report to the configured file
     * 
     * @param {module:karma/browser} browser - Browser object
     */
    this.writeReport = function (browser, callback) {
        var self = this;
        var reporterConfig = config.kcJsonReporter || {};
        // create filename
        var fileName = reporterConfig.outputFile;
        var browserName = browser.name;
        var shortBrowserName = browser.name.replace(/^([^\(\.]+).*$/, '$1');// cut off before OS or sub-version info;
        fileName = fileName
            // replace placeholders in outputFile template with actual names (w/o WS and dots)
            .replace(/\{browserName\}/, browserName.replace(/[\s\.\(\)]+/g, '-'))
            .replace(/\{shortBrowserName\}/, shortBrowserName.replace(/[\s\.]+/g, '-'))
            .replace(/-+/g, '-')
        ;
        // create path
        var outputDir = reporterConfig.outputDir || '.';
        outputDir = helper.normalizeWinPath(path.resolve(config.basePath, outputDir)) + path.sep;
        var fullPath = path.join(outputDir, fileName);
        // create directory
        helper.mkdirIfNotExists(path.dirname(fullPath), function () {
            var output = JSON.stringify(self.report, null, 4);
            fs.writeFile(fullPath, output, function (err) {
                if (err) {
                    self.logger.error(err.message);
                } else {
                    self.logger.debug('JSON report written to "%s".', fullPath);
                }
                callback.call(self);
            });
        });
    };
    
    /**
     * Writes the report to stdout
     */
    this.logReport = function () {
        this.logger.info(JSON.stringify(this.report, null, 2).cyan);
    };

    // initialize reporter
    this.init();
};

KarmaCukesJsonReporter.$inject = ['baseReporterDecorator', 'logger', 'helper', 'config'];

module.exports = KarmaCukesJsonReporter;
