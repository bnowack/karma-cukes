
require('colors');

/**
 * Karma-Cukes Progress Reporter
 * 
 * Generates reports compatible with Cucumber's built-in "Progress" reporter
 *
 * ...F--U..
 * 
 * 1 scenario (1 passed)
 * 2 steps (2 passed)
 * 0m1.23s
 *      
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 * @param {module:karma/reporter/base} baseReporterDecorator - Karma base reporter
 * @param {module:karma/helper} helper - Karma helper
 * @returns {KarmaCukesProgressReporter} Cucumber Pretty Reporter
 */
KarmaCukesProgressReporter = function (baseReporterDecorator, helper) {
    // extend base reporter
    baseReporterDecorator(this);
    
    /**
     * Initializes the reporter
     */
    this.init = function () {
        // init helper variables
        this.outputLength = 0;
        this.stats = {};// 1 entry per scenario with passed/skipped/failed-counters and a summary prop
        this.startTime = (new Date()).getTime();
        this.endTime = (new Date()).getTime();
    };
    
    /**
     * Processes cucumber step results
     * 
     * @param {module:karma/browser} browser - Browser object
     * @param {Object} result - Step result from KarmaCukesListener
     */
    this.onSpecComplete = function (browser, result) {
        // update stats
        this.updateSpecStats(result);
        // report step
        this.reportStep(result.step);
    };
    
    /**
     * Sets the end time and calls stats printer
     */
    this.onRunComplete = function () {
        this.endTime = (new Date()).getTime();
        this.reportStats();
    };
    
    /**
     * Updates scenario and step statistics
     * 
     * @param {Object} result - Step result from KarmaCukesListener
     */
    this.updateSpecStats = function (result) {
        if (!this.stats[result.scenario.id]) {
            this.stats[result.scenario.id] = { count: 0, passed: 0, skipped: 0, failed: 0, summary: 'passed' };
        }
        this.stats[result.scenario.id].count++;
        if (result.success) {
            this.stats[result.scenario.id].passed++;
        } else if (result.skipped) {
            this.stats[result.scenario.id].skipped++;
            if (this.stats[result.scenario.id].summary === 'passed') {
                this.stats[result.scenario.id].summary = 'incomplete';
            }
        } else {
            this.stats[result.scenario.id].failed++;
            this.stats[result.scenario.id].summary = 'failed';
        }
    };
    
    /**
     * Prints the statistics
     */
    this.reportStats = function () {
        var self = this;
        var scenarioSummary = { count: 0, passed: 0, incomplete: 0, failed: 0 };
        var stepSummary = { count: 0, passed: 0, skipped: 0, failed: 0 };
        Object.keys(this.stats).forEach(function(scenarioId) {
            var data = self.stats[scenarioId];
            // scenarios
            scenarioSummary.count++;
            scenarioSummary[data.summary]++;
            // steps
            stepSummary.count += data.count;
            stepSummary.passed += data.passed;
            stepSummary.skipped += data.skipped;
            stepSummary.failed += data.failed;
        });
        process.stdout.write([
            "\n",
            scenarioSummary.count + ' Scenario' + (scenarioSummary.count === 1 ? '' : 's'),
            " (",
                (scenarioSummary.passed + " passed").green + ", ",
                (scenarioSummary.incomplete + " incomplete").cyan + ", ",
                (scenarioSummary.failed + " failed").red,
            ")\n",
            stepSummary.count + ' Step' + (stepSummary.count === 1 ? '' : 's'),
            " (",
                (stepSummary.passed + " passed").green + ", ",
                (stepSummary.skipped + " skipped").cyan + ", ",
                (stepSummary.failed + " failed").red,
            ")\n",
            helper.formatTimeInterval(this.endTime - this.startTime),
            "\n"
        ].join(""));
    };
    
    /**
     * Reports a step
     * 
     * @param {Object} step - Step object
     */
    this.reportStep = function (step) {
        if (this.outputLength % 80 === 0) {
            process.stdout.write("\n");
        }
        var chars = {
            'ambiguous': 'A'.red,
            'failed': 'F'.red,
            'passed': '.'.green,
            'pending': 'P'.yellow,
            'skipped': '-'.cyan,
            'undefined': 'U'.yellow
        };
        var char = chars[step.result.status];
        process.stdout.write(char);
        this.outputLength++;
    };
    
    // initialise reporter
    this.init();
};

KarmaCukesProgressReporter.$inject = ['baseReporterDecorator', 'helper'];

module.exports = KarmaCukesProgressReporter;
