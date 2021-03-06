/* globals $ */
/**
 * Browser interface for end-to-end tests using Karma
 *
 * @author Benjamin Nowack <mail@bnowack.de>
 * @returns {KarmaCukesBrowser}
 */
var KarmaCukesBrowser = function () {

    /**
     * Initializes a browser instance
     *
     * @constructor
     */
    this.init = function () {
        this.frame = null;
        this.window = null;
        this.base = '';
        this.$ajax = null;
        this.hasShadowDom = this.detectShadowDom();
        this.initFrame();
    };

    /**
     * Checks if `::shadow` selectors are supported
     *
     * @returns {boolean} TRUE if detected, FALSE otherwise
     */
    this.detectShadowDom = function () {
        try {
            document.querySelector('::shadow');
            return true;
        } catch (error) {
            return false;
        }
    };

    /**
     * Adds the browser iframe and registers a load handler
     */
    this.initFrame = function () {
        var self = this;
        $('body iframe#karma-cukes-browser').remove();
        this.frame = $('<iframe></iframe>')
            .attr('id', 'karma-cukes-browser')
            .css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
            })
            .appendTo('body')
        ;
        // handle load
        this.frame.on('load', function () {
            self.window = self.frame.prop('contentWindow');
            self.document = self.window.document;
            self.frame.trigger('loaded');
        });
    };

    /**
     * Opens the given URL or path in the iframe
     *
     * @param {string} url - Path or CORS-enabled URL
     * @returns {Promise}
     */
    this.url = function (url) {
        var self = this;
        if (!url.match(/\/\//)) {
            url = this.base + url;
        }
        return new Promise(function (resolve) {
            // handle load
            self.frame.one('loaded', function () {
                resolve();
            });
            // clear AJAX object (=> reset header cache)
            self.$ajax = null;
            // trigger load
            self.frame.attr('src', url);
        });
    };

    /**
     * Issues an HTTP request and returns the response
     *
     * @param {string} url - Path or CORS-enabled URL
     * @param {string} method -  HTTP method, e.g. GET
     * @param {Object} data -  Request data
     * @returns {Promise}
     */
    this.http = function (url, method, data) {
        var self = this;
        if (!url.match(/\/\//)) {
            url = this.base + url;
        }
        return new Promise(function (resolve, reject) {
            self.$ajax = $.ajax({
                url: url,
                method: method || 'GET',
                data: data || null,
                dataType: 'text',
                success: resolve,
                error: reject
            });
        });
    };

    /**
     * Waits until a CSS selector matches
     *
     * @param selector - CSS selector
     * @param maxWaitTime - How long to wait for the selector to appear, default: 5 seconds
     * @returns {Promise}
     */
    this.waitFor = function (selector, maxWaitTime) {
        var self = this;
        selector = this.hasShadowDom ? selector : selector.replace(/::shadow/g, '');
        var resolved = function (resolve) {
            var matches = $(self.document).find(selector);
            if (matches.length) {
                resolve(matches);
                return true;
            } else {
                return false;
            }
        };
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
     * Fetches the given URL (or the browser's current one) and stores the associated XHR object for later access
     *
     * @param url
     * @returns {Promise}
     */
    this.fetchHeaders = function (url) {
        return this.http(url || this.window.location.pathname, 'GET');
    };

    /**
     * Returns the status code of the latest request
     *
     * Refreshes headers if not present
     *
     * @returns {Promise}
     */
    this.getStatusCode = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (self.$ajax) {
                resolve(self.$ajax.status);
            } else {
                self
                    .fetchHeaders()
                    .then(function () {
                        resolve(self.$ajax.status);
                    })
                    .catch(function() {
                        resolve(self.$ajax.status);
                    });
            }
        });
    };

    /**
     * Returns a response header of the latest request
     *
     * Refreshes headers if not present
     *
     * @param {string} headerName
     * @returns {Promise}
     */
    this.getResponseHeader = function (headerName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            if (self.$ajax) {
                resolve(self.$ajax.getResponseHeader(headerName));
            } else {
                self
                    .fetchHeaders()
                    .then(function () {
                        resolve(self.$ajax.getResponseHeader(headerName));
                    })
                    .catch(function() {
                        resolve(self.$ajax.status);
                    });
            }
        });
    };

    /**
     * Cleans up
     */
    this.close = function () {
        if (this.frame) {
            this.frame.remove();
            this.frame = null;
            this.window = null;
            this.document = null;
            this.$ajax = null;
        }
    };

    // init browser
    this.init.apply(this, arguments);

};
