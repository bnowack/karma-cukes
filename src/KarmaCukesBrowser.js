/**
 * Browser interface for end-to-end tests using Karma
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 * @returns {KarmaCukesBrowser}
 */
var KarmaCukesBrowser = function() {
    
    /**
     * Initializes a browser instance
     * 
     * @constructor
     */
    this.init = function() {
        this.frame = null;
        this.window = null;
        this.instanceId = Math.random();
    };
    
    /**
     * Opens the path in an iframe
     * 
     * @param {string} path - Path or CORS-enabled URL
     * @param {function} callback - CucumberJS callback
     */
    this.visit = function(path, callback) {
        var self = this;
        if (!this.frame) {
            this.frame = $('<iframe></iframe>')
                .css({position: 'fixed', top: 0, left: 0, right: 0, bottom: 0})
                .appendTo('body')
            ;
        }
        this.frame.one('load', function() {
            self.window = self.frame.prop('contentWindow');
            callback();
        });
        this.frame.attr('src', path);
    };
    
    /**
     * Cleans up
     */
    this.close = function() {
        if (this.frame) {
            this.frame.remove();
            this.frame = null;
            this.window = null;
        }
    };
    
    // init browser
    this.init.apply(this, arguments);
    
};
