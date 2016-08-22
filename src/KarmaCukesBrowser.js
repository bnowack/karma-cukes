/* globals $ */
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
        this.initFrame();
    };

    /**
     * Adds the browser iframe and registers load handler
     */
    this.initFrame = function () {
        var self = this;
        this.frame = $('<iframe></iframe>')
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
        // handle load
        this.frame.on('load', function() {
            self.window = self.frame.prop('contentWindow');
            self.document = self.window.document;
            self.frame.trigger('loaded');
        });
    }

    /**
     * Opens the path in an iframe
     *
     * @param {string} path - Path or CORS-enabled URL
     * @returns {Promise}
     */
    this.visit = function(path) {
        var self = this;
        return new Promise(function (resolve) {
            // handle load
            self.frame.one('loaded', function() {
                resolve();
            });
            // trigger load
            self.frame.attr('src', self.base + path);
        });
    };

    /**
     * Waits until a CSS selector matches
     *
     * @param selector - CSS selector
     * @param maxWaitTime - How long to wait for the selector to appear, default: 5 seconds
     * @returns {Promise}
     */
    this.waitFor = function(selector, maxWaitTime) {
        var self = this;
        var resolved = function (resolve) {
            if ($(self.document).find(selector).length) {
                resolve();
                return true;
            } else {
                return false;
            }
        }
        return new Promise(function (resolve, reject) {
            if (!resolved(resolve)) {
                var start = (new Date()).getTime();
                maxWaitTime = maxWaitTime || 5000;
                var interval = setInterval(function () {
                    if (resolved(resolve)) {
                        clearInterval(interval);
                    } else if ((new Date()).getTime() - start >= maxWaitTime) {
                        clearInterval(interval);
                        reject();
                    }
                }, 100);
            }
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
