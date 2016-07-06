/**
 * Karma-Cukes World constructor
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */

function World() {

        
        this.When('I go to "$path"', function (path, callback) {
            this.visit(path, callback);
        });
        
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
