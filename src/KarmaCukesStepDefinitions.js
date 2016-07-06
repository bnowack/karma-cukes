/**
 * Karma-Cukes Step Definitions
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */

module.exports = function() {
    
    this.When('I go to "$path"', function (path, callback) {
        this.visit(path, callback);
    });

};
