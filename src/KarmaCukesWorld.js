/**
 * Karma-Cukes World constructor
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */

function World() {

        
        
    };
    
    // init browser object
    this.browser = new KarmaCukesBrowser();

    /**
     * Shortcut for browser.visit
     * 
     * @param {string} path - URL or local path
     * @param {function} callback - Cucumber runner callback
     */
    this.visit = function(path, callback) {
        this.browser.visit(path, callback);
    };

}

module.exports = function() {
    this.World = World;
};
