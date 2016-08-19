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
        this.base = '';
    };
    
    /**
     * Opens the path in an iframe
     * 
     * @param {string} path - Path or CORS-enabled URL
     * @returns {Promise}
     */
    this.visit = function(path) {
        var self = this;
        return new Promise(function (resolve) {
            // add frame
            if (!self.frame) {
                self.frame = $('<iframe></iframe>')
                    .css({
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height:'100%',
                        border: 'none'
                    })
                    .appendTo('body')
                ;
            }
            // handle load
            self.frame.one('load', function() {
                self.window = self.frame.prop('contentWindow');
                self.document = self.window.document;
                resolve();
            });
            // trigger load
            self.frame.attr('src', self.base + path);
        });
    };
    
    /**
     * Cleans up
     */
    this.close = function() {
        if (this.frame) {
            this.frame.remove();
            this.frame = null;
            this.window = null;
            this.document = null;
        }
    };
    
    // init browser
    this.init.apply(this, arguments);
    
};
