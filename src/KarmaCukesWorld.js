/**
 * Karma-Cukes World constructor
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */

function World() {

    // minimalistic assertion utils
    this.assert = {

        ok: function (condition, callback, message) {
            if (condition) {
                callback();
            } else {
                callback(new Error(message || 'should meet condition'));
            }
        },

        equal: function (actual, expected, callback, message) {
            return this.ok(actual === expected, callback, message || 'should be equal');
        },

        contain: function (haystack, needle, callback, message) {
            return this.ok(haystack.indexOf(needle) !== -1, callback, message || 'should contain ' + JSON.stringify(actual));
        }

    };

    // init browser object
    this.browser = new KarmaCukesBrowser();

    /**
     * Shortcut for browser.visit
     * 
     * @param {string} path - URL or local path
     * @returns {Promise}
     */
    this.visit = function(path) {
        return this.browser.visit(path);
    };

}

module.exports = function() {
    this.World = World;
};
