/**
 * Karma-Cukes Step Definitions
 * 
 * @author Benjamin Nowack <mail@bnowack.de>
 */

module.exports = function() {
    
    this.When('I go to "$path"', function (path, callback) {
        this.visit(path, callback);
    });

    this.Then('I should see "$html" in the $element', function (html, element, callback) {
        var $element = $(this.browser.window.document).find('html ' + element);
        var haystack = $element.html();
        this.assert.contain(haystack, html, callback, 'should have ' + html + ' in ' + haystack);
    });

    this.Then('the $element should be "$expected"', function (element, expected, callback) {
        var $element = $(this.browser.window.document).find('html ' + element);
        var actual = $element.html();
        this.assert.equal(actual, expected, callback, actual + ' should be ' + expected);
    });

    this.After(function () {
        this.browser.close();
    });

};