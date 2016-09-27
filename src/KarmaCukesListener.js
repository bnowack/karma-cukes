/**
 * Karma Listener listening for CucumberJS events
 *
 * @author Benjamin Nowack <mail@bnowack.de>
 *
 * @param {module:karma} karma - Karma
 * @returns {KarmaCukesListener}
 */
var KarmaCukesListener = function(karma) {

    /**
     * Initialises the listener
     */
    this.init = function() {
        this.karma = karma;
        this.feature = null;
        this.scenario = null;
        this.step = null;
        this.stepCount = 0;
        // don't let errors cause Karma to exit
        window.onerror = $.proxy(this.onError, this);
    };

    /*
     * Registers event handlers for cucumber events
     *
     * Available events:
     *
     *  * BeforeFeatures
     *  * BeforeFeature
     *  * Background
     *  * BeforeScenario
     *  * BeforeStep
     *  * StepResult
     *  * AfterStep
     *  * ScenarioResult
     *  * AfterScenario
     *  * AfterFeature
     *  * FeaturesResult
     *  * AfterFeatures
     *
     * @param {module:cucumber/runtime/ast_tree_walker/event.js} event - Cucumber event
     * @param {function} callback - Callback for cucumber's AST walker
     */
    this.hear = function (event, defaultTimeout, callback) {
        var eventName = event.getName();
        var methodName = 'on' + eventName;
        if (this[methodName]) {
            this[methodName](event);
        }
        callback();
    };

    /**
     * Initializes the listener before any features are run
     *
     * @param {module:cucumber/runtime/ast_tree_walker/event.js} event - Cucumber event
     */
    this.onBeforeFeatures = function(event) {
        this.init();
    };

    /**
     * Sets the current feature reference
     *
     * @param {module:cucumber/runtime/ast_tree_walker/event.js} event - Cucumber event
     */
    this.onBeforeFeature = function(event) {
        var feature = event.getPayload();
        this.feature = {
            id: feature.getName().toLowerCase().replace(/\s+/g, '-'),
            uri: feature.getUri().replace(/^(.*\/(base)\/)/, ''), // remove leading path noise
            name: feature.getName(),
            description: feature.getDescription(),
            line: feature.getLine(),
            keyword: feature.getKeyword(),
            tags: feature.getTags().map(function(tag) {
                return { name: tag.getName(), line: tag.getLine() };
            })
        };
    };

    /**
     * Sets the current scenario reference
     *
     * @param {module:cucumber/runtime/ast_tree_walker/event.js} event - Cucumber event
     */
    this.onBeforeScenario = function(event) {
        var scenario = event.getPayload();
        this.scenario = {
            id: this.feature.id + ';' + scenario.getName().toLowerCase().replace(/\s+/g, '-'),
            name: scenario.getName(),
            line: scenario.getLine(),
            keyword: 'Scenario',
            description: scenario.getDescription(),
            type: 'scenario',
            tags: scenario.getTags().map(function(tag) {
                return { name: tag.getName(), line: tag.getLine() };
            }),
            examples: []// does not seem to be fillable via CucumberJS as outlines are split into individual scenarios
        };
    };

    /**
     * Sets the current step reference
     *
     * @param {module:cucumber/runtime/ast_tree_walker/event.js} event - Cucumber event
     */
    this.onBeforeStep = function(event) {
        var step = event.getPayload();
        this.step = {
            keyword: step.getKeyword(),
            name: step.getName(),
            line: step.getLine(),
            //hidden: step.isHidden(),
            match: {
                location: step.getUri() + ':' + step.getLine()
            },
            result: {
                status: null,
                error_message: '',
                duration: 0
            }
        };
    };

    /**
     * Creates a step/spec result and passes it to karma (which passes it to registered reporters)
     *
     * @param {module:cucumber/runtime/ast_tree_walker/event.js} event - Cucumber event
     */
    this.onStepResult = function(event) {
        var stepResult = event.getPayload();
        // don't report hook results
        if (this.isHook(stepResult.getStep())) {
            return;
        }
        var karmaResult = {
            feature: this.feature,
            scenario: this.scenario,
            step: this.step,
            // add some standard props for other reporters that rely on them (e.g. karma-junit-reporter)
            suite: [this.feature.name + ': ' + this.scenario.name],
            description: this.step.keyword + this.step.name,
            log: [],
            time: (stepResult.getDuration() || 0) / 1000000
        };
        // match.location
        var stepDefinition = stepResult.getStepDefinition();
        if (stepDefinition && stepDefinition.getUri() !== 'unknown') {
            karmaResult.step.match.location = stepDefinition.getUri() + ':' + stepDefinition.getLine();
        }
        karmaResult.step.match.location = karmaResult.step.match.location
            .replace(/^(.*\/(base)\/)/, '') // remove leading path noise
            .replace(/^(.*\/(absolute)\/)/, '/') // remove leading path noise
            .replace(/\?[^\:]+/g, '') // remove query strings
        ;
        // result.status
        karmaResult.step.result.status = stepResult.getStatus();
        // result.duration
        karmaResult.step.result.duration = stepResult.getDuration() || 0;
        // error message
        if (karmaResult.step.result.status === 'failed') {
            var failureException = stepResult.getFailureException();
            if (failureException) {
                karmaResult.step.result.error_message += (failureException.stack || failureException)
                    .replace(/^(.*\/(base)\/)/gm, '') // remove leading path noise
                    .replace(/^(.*\/(absolute)\/)/gm, '/') // remove leading path noise
                    .replace(/^(.*\/release\/cucumber.js.*$)/gm, '') // cucumberjs entries
                    .replace(/\?[^\:]+/g, '') // remove query strings
                    .replace(/\n*$/, '') // remove trailing line-breaks
                ;
            }
        }
        // attachments
        var attachments = stepResult.getAttachments();
        if (attachments && attachments.length) {
            karmaResult.step.embeddings = [];
            attachments.forEach(function (attachment) {
                karmaResult.step.embeddings.push({
                    mime_type: attachment.getMimeType(),
                    data: base64encode(attachment.getData())
                });
            });
        }
        // report step count to karma
        this.karma.info({ total: ++this.stepCount });
        // inject karma result keywords to trigger correct exit code
        karmaResult.success = (karmaResult.step.result.status.match(/(passed)/));
        karmaResult.skipped = (karmaResult.step.result.status.match(/(skipped|pending|undefined|ambiguous)/));
        // pass result to all registered karma reporters
        this.karma.result(karmaResult);// triggers `reporter.onSpecComplete(browser, karmaResult)`
    };

    /**
     * Cleans up object references
     */
    onAfterFeatures = function() {
        this.feature = null;
        this.scenario = null;
        this.step = null;
        this.stepCount = 0;
    };

    /**
     * Adds script errors to step's error message
     *
     * @param {string} message - Error message
     * @param {string} source - Error source/file
     * @param {number} line - Error line
     * @param {number} column - Error column
     */
    this.onError = function (message, source, line, column) {
        var fullMessage = message + ' at ' + source.replace(/\?.*$/, '') + ':' + line + ':' + column;
        console.error(fullMessage);
        this.step.result.error_message += fullMessage + "\n";
    };

    /**
     * Checks if a step is a hook
     *
     * @param {module:cucumber/step} step - Step object
     * @returns {boolean} TRUE for hooks, FALSE otherwise
     */
    this.isHook = function(step) {
        return step.getKeyword().match(/^(Before|After)/);
    };

};
