
require('colors');

/**
 * Karma-Cukes Pretty Reporter
 * 
 * Generates reports compatible with Cucumber's built-in "Pretty" reporter
 *
 *     Feature: A feature
 *         In order to do A
 *         As a user
 *         I can do B
 *          
 *     @tag1
 *     Scenario: A scenario                # /path/to/a.feature:7
 *         Given I do B                    # /path/to/step-definitions.js:12
 *         Then A should happen            # /path/to/step-definitions.js:19
 *          
 *     1 scenario (1 passed)
 *     2 steps (2 passed)
 *     0m1.23s
 *      
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 * @param {module:karma/reporter/base} baseReporterDecorator - Karma base reporter
 * @param {module:karma/helper} helper - Karma helper
 * @param {Object} config - Karma config
 * @returns {KarmaCukesPrettyReporter} Cucumber Pretty Reporter
 */
KarmaCukesPrettyReporter = function (baseReporterDecorator, helper, config) {
    // extend base reporter
    baseReporterDecorator(this);
    
    /**
     * Initializes the reporter
     */
    this.init = function () {
        var self = this;
        // configure base reporter
        this.adapters = [ function (msg) { self.bufferStdOut(msg); } ];
        
        // init helper variables
        this.feature = null;
        this.scenario = null;
        this.steps = [];
        this.step = null;
        this.stepLog = [];
        this.stats = {};// 1 entry per scenario with passed/skipped/failed-counters and a summary prop
        this.startTime = (new Date()).getTime();
        this.endTime = (new Date()).getTime();
    };
    
    /**
     * Bufferes system messages so that they can be rendered inline during step reporting
     * 
     * @param {string} msg
     */
    this.bufferStdOut = function (msg) {
        this.stepLog.push(msg);
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
        // step belongs to new scenario
        if (!this.scenario || this.scenario.id !== result.scenario.id) {
            // report previous scenario and steps
            if (this.scenario) {
                this.reportScenario(this.feature, this.scenario, this.steps);
            }
            // cache new scenario
            this.scenario = result.scenario;
            // reset step cache
            this.steps = [];
        }
        // step belongs to new feature
        if (!this.feature || this.feature.uri !== result.feature.uri) {
            this.feature = result.feature;
            // report feature immediately
            this.reportFeature(this.feature);
        }
        // cache step
        this.step = result.step;
        this.step.log = this.stepLog;
        this.steps.push(this.step);
        // clear step log for next step
        this.stepLog = [];
    };
    
    /**
     * Reports any remaining scenario and steps
     */
    this.onBrowserComplete = function() {
        if (this.scenario) {
            this.reportScenario(this.feature, this.scenario, this.steps);
        }
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
     * Reports a feature
     * 
     * @param {Object} feature - Feature object
     */
    this.reportFeature = function (feature) {
        this.writePadded("Feature".bold + ": " + feature.name, 0, true, true);
        this.writePadded(feature.description, 2, false, true);
    };
    
    /**
     * Reports a scenario
     * 
     * @param {Object} feature - Feature object
     * @param {Object} scenario - Scenario object
     * @param {Array} steps - List of step objects
     */
    this.reportScenario = function (feature, scenario, steps) {
        var self = this;
        var sourcePadding = this.getScenarioSourcePadding(scenario, steps);
        // tags
        this.reportTags(scenario.tags, 2);
        // scenario
        var scenarioLabel = 'Scenario'.bold + ": " + scenario.name;
        var scenarioLabelLength = ('Scenario: ' + scenario.name).length;
        this.writePadded(scenarioLabel, 2, true, false);
        // scenario source
        var scenarioSource = this.getSourceString(feature.uri + ':' + scenario.line);
        this.writePadded(scenarioSource, sourcePadding - scenarioLabelLength, false, true);
        // steps
        steps.forEach(function(step) {
            self.reportStep(step, sourcePadding);
        });
    };
    
    /**
     * Reports an indented tag string
     * 
     * @param {Array} tags - List of tags
     * @param {number} padding - Indentation
     */
    this.reportTags = function (tags, padding) {
        if (tags.length) {
            var tagString = tags.map(function(tag) { return tag.name; }).join(" ");
            this.writePadded(tagString.cyan, padding, true);
        }
    };
    
    /**
     * Reports a step
     * 
     * @param {Object} step - Step object
     * @param {number} sourcePadding - Padding of the source string column
     */
    this.reportStep = function (step, sourcePadding) {
        var stepLabel = step.keyword.bold + step.name;
        var stepLabelLength = (step.keyword + step.name).length;
        switch (step.result.status) {
            case 'undefined':
            case 'skipped':
            case 'pending':
                stepLabel = stepLabel.cyan;
                break;
            case 'failed':
                stepLabel = stepLabel.red;
                break;
            case 'passed':
                stepLabel = stepLabel.green;
                break;
        };
        this.writePadded(stepLabel, 4, false, false);
        // step source
        var stepSource = this.getSourceString(step.match.location);
        this.writePadded(stepSource, sourcePadding - stepLabelLength - 2, false, true);
        // log
        if (step.log.length) {
            this.writePadded(step.log.join("").bold.dim, 4, false, true);
        }
        // error message
        if (step.result.error_message) {
            this.writePadded(step.result.error_message.red, 4, false, true);
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
     * Calculates the maximum length of scenario and step names so that source strings can be aligned
     * 
     * @param {Object} scenario - Scenario object
     * @param {Array} steps - List of step objects
     */
    this.getScenarioSourcePadding = function (scenario, steps) {
        var result = 2 + (scenario.keyword + ': ' + scenario.name).length;
        steps.forEach(function(step) {
            result = Math.max(result, 4 + (step.keyword + step.name).length);
        });
        return result;
    };
    
    /**
     * Builds a cleaned-up scenario or step source string
     * 
     * @param {string} source - Full source path
     */
    this.getSourceString = function(source) {
        return source
            ? ' # ' + source
                .replace(new RegExp('^.*' + config.urlRoot + '(base|absolute)/'), '/') // remove leading path noise
                .replace(/\?[^\:]+/, '') // remove query string
            : ''
        ;
    };
    
    /**
     * Writes a padded string to stdout
     * 
     * @param {string} str - Output
     * @param {number} padWidth - Padding width
     * @param {boolean} breakBefore - Add line break before output
     * @param {boolean} breakAfter - Add line break after output
     */
    this.writePadded = function (str, padWidth, breakBefore, breakAfter) {
        var padding = (new Array(padWidth + 1)).join(" ");
        str = str
            .replace(/(^|\n)/g, '\n' + padding) // prepend padding to each line
            .replace(/\s+$/gm, '')// remove trailing WS of each line
        ;
        if (!breakBefore) {
            str = str.replace(/^\n+/, '');
        }
        if (breakAfter) {
            str += "\n";
        } else {
            str = str.replace(/\n+$/, '');
        }
        process.stdout.write(str);
    };
    
    // initialise reporter
    this.init();
};

KarmaCukesPrettyReporter.$inject = ['baseReporterDecorator', 'helper', 'config'];

module.exports = KarmaCukesPrettyReporter;
