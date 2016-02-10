var casper = require('casper').create();
var main = require('./main.js');

var result = main('./config.json');
result.then(function() {
	casper.exit();
})