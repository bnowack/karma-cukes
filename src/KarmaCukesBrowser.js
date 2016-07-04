/**
 * Browser interface for end-to-end tests using Karma
 * 
 * @returns {KarmaCukesBrowser}
 */
var KarmaCukesBrowser = function() {
    
    /**
     * Initializes a browser instance
     * 
     * @constructor
     * @returns {undefined}
     */
    this.init = function() {
        this.xhr = null;
        this.response = null;
        this.statusCode = null;
        this.window = $('<iframe></iframe>').css({width: 1200, height: 900}).appendTo('body');
        this.document = null;
    };
    
    this.visit = function(path, callback) {
        var self = this;
        var url = path.match(/:\/\//) ? path : this.baseUrl + path;
        url = path;
        $(self.window).one('load', function() {
            callback();
        });
        self.window.attr('src', url);
    };
    
    // init browser
    this.init.apply(this, arguments);
    
};
