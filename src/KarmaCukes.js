/**
 * Karma Cukes - CucumberJS adapter for Karma
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 * 
 * @returns {KarmaCukes}
 */
var KarmaCukes = function () {
    
    /**
     * Initializes the adapter
     * 
     * @constructor
     * @param {module:karma} karma - Karma
     * @param {jQuery} $ - jQuery
     */
    this.init = function (karma, $) {
        this.karma = karma;
    };
    
    /**
     * Starts cucumber when Karma is started
     */
    this.start = function () {
        var features = this.getFeatures();
        var options = this.getOptions();
        var cucumber = new Cucumber(features, this.initSupportCode, options);
        cucumber.attachListener(new KarmaCukesListener(this.karma));
        cucumber.start($.proxy(this.complete, this));
    };

    /**
     * Calls `karma.complete` when cucumber is done
     */
    this.complete = function () {
        return this.karma.complete({
            coverage: window.__coverage__ || null // code coverage plugin
        });
    };
    
    /**
     * Initializes support code (world, step definitions, etc.)
     * 
     * @see `cucumber/support_code/library.js`
     */
    this.initSupportCode = function() {
        var supportCodeHelper = this;
        var exports = window.module ? window.module.exports : [];
        exports.forEach(function(module) {
            if (typeof module === 'function') {
                module.call(supportCodeHelper);
            }
        });
    };
    
    /**
     * Generates a list of feature file locations and contents
     * 
     * @returns {Array} Feature list with each entry in the form `[location, contents]`
     */
    this.getFeatures = function() {
        var self = this;
        var features = [];
        $.each(this.karma.files, function(file) {
            if (file.match(/\.feature$/)) {
                self.getFileContents(file, function(response) {
                    features.push([file, response]);
                });
            }
        });
        return features;
    };
    
    /**
     * Loads a path or URL and returns the response
     * 
     * @param {string} path - Local path or URL
     * @param {function} callback - Receiving function of the file contents
     */
    this.getFileContents = function(path, callback) {
        $.ajax({
            url: path,
            async: false,
            success: callback
        });
    };
    
    /**
     * Builds a cucumber.js options array, e.g. from `--tags @tag1 @tag2` on the command line
     * 
     * @returns {Array} Options array
     */
    this.getOptions = function() {
        var args = this.karma.config.args;
        var options = {};
        var argName = null;
        args.forEach(function(arg) {
            if (arg.match(/^--/)) {
                argName = arg.substr(2);
            }
            else if (argName) {
                if (!options[argName]) {
                    options[argName] = [arg];
                } else {
                    options[argName].push(arg);
                }
            }
        });
        return options;
    };
    
    // init KarmaCukes
    this.init.apply(this, arguments);
    
};

// init KarmaCukes when Karma starts
__karma__.start = function() {
    var karmaCukes = new KarmaCukes(__karma__, jQuery);
    karmaCukes.start();
};
