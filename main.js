/* https://github.com/ariya/phantomjs/blob/master/examples/netsniff.js */

var url = 'http://127.0.0.1:9003/pages.html';
var page = require('webpage').create();
var system = require('system');
var resources = [];
var resourcesSucceeded = [];
var resourcesFailed = [];
var resourcesHtml = []; //text/html
var resourcesJS = []; // application/javascript
var resourcesCSS = []; //text/css
var resourcesImage = []; //image/svg+xml
var resourcesFonts = []; //application/x-font-ttf 
var resourcesJson = []; //application/json
// contentType

function organizeByContentType(resource) {
	if (resource.contentType.indexOf('html') > -1) {
		resourcesHtml.push(resource);
	} else if (resource.contentType.indexOf('javascript') > -1) {
		resourcesJS.push(resource);
	} else if (resource.contentType.indexOf('css') > -1) {
		resourcesCSS.push(resource);
	} else if (resource.contentType.indexOf('svg+xml') > -1) {
		resourcesImage.push(resource);
	} else if (resource.contentType.indexOf('font') > -1) {
		resourcesFonts.push(resource);
	} else if (resource.contentType.indexOf('json') > -1) {
		resourcesJson.push(resource);
	}
}

function checkMinSize(resourceArray) {
	var prevBodySize = null;
	var prevFoundItem = null;
	resourceArray.forEach(function(item) {
		var status = item.status;
		if (status < 400) {
			var bodySize = item.bodySize;
			if (bodySize && prevBodySize === null) {
				prevBodySize = bodySize;
			}
			if (bodySize && bodySize < prevBodySize) {
				prevBodySize = bodySize;
				prevFoundItem = item;
			}
		}
	});
	return prevFoundItem;
}

function checkMaxSize(resourceArray) {
	var prevBodySize = null;
	var prevFoundItem = null;
	resourceArray.forEach(function(item) {
		var status = item.status;
		if (status < 400) {
			var bodySize = item.bodySize;
			if (bodySize && prevBodySize === null) {
				prevBodySize = bodySize;
			}
			if (bodySize && bodySize > prevBodySize) {
				prevBodySize = bodySize;
				prevFoundItem = item;
			}
		}
	});
	return prevFoundItem;
}

page.onError = function(msg) {
	console.log(msg);
}

page.onConsoleMessage = function(msg) {
	console.log(msg);
 }

page.onResourceRequested = function(request) {
	//console.log( JSON.stringify(request, undefined, 4) );
 }

page.onResourceReceived = function(resource) {
	resources.push(resource);
	if (resource.status >= 400) {
		resourcesFailed.push(resource);
	} else {
		resourcesSucceeded.push(resource);
	}
	//var resourceSize = resource.bodySize;
	//console.log(resourceSize);
	console.log( JSON.stringify(resource, undefined, 4) );
 }

page.open(url, function(status) {
	if (status !== 'success') {
		console.log('failed to load the address');
	}
	var largestResource = checkMaxSize(resources);
	var smallestResource  = checkMinSize(resources);
	console.log(JSON.stringify(largestResource));
	console.log(JSON.stringify(smallestResource));
	resourcesFailed.forEach(function(resource) {
		console.log('Resource failed to load: ' + resource.url + ' with a ' + resource.status);
	});
	phantom.exit();
});