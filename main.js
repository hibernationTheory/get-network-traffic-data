/* https://github.com/ariya/phantomjs/blob/master/examples/netsniff.js */

var page = require('webpage').create();
var system = require('system');
var resources = [];
var resourcesSucceeded = [];
var resourcesFailed = [];
// contentType
//text/html
// application/javascript
//text/css
//image/svg+xml
//application/x-font-ttf 
//application/json
var TARGET_ARRAYS = {
	"html":[],
	"javascript":[],
	"css":[],
	"image":[],
	"json":[],
	"svg_xml":[],
	"font":[]
};

function organizeByContentType(resource) {
	if (resource.contentType.indexOf('html') > -1) {
		TARGET_ARRAYS['html'].push(resource);
	} else if (resource.contentType.indexOf('javascript') > -1) {
		TARGET_ARRAYS['javascript'].push(resource);
	} else if (resource.contentType.indexOf('css') > -1) {
		TARGET_ARRAYS['css'].push(resource);
	} else if (resource.contentType.indexOf('svg+xml') > -1) {
		TARGET_ARRAYS['svg_xml'].push(resource);
	} else if (resource.contentType.indexOf('font') > -1) {
		TARGET_ARRAYS['font'].push(resource);
	} else if (resource.contentType.indexOf('json') > -1) {
		TARGET_ARRAYS['json'].push(resource);
	}
};

function sortContentData() {
	/* not working */
	for (var data in TARGET_ARRAYS) {
		console.log(TARGET_ARRAYS[data].length);
		TARGET_ARRAYS[data] = TARGET_ARRAYS[data].sort(function(item1, item2) {
			var size1 = item1.bodySize || 0;
			var size2 = item2.bodySize || 0;
			return size1-size2;
		});
	};
};

function calculateTotalContentSize(resourceArray) {
	var total = 0;
	resourceArray.forEach(function(item) {
		var size = item.bodySize;
		if (size) {
			total += size;
		}
	});
	return total;
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
	organizeByContentType(resource);
 }

function getPageNetworkData(url, callback) {
	var results = {
		"resources":
			{
				"amount":0,
				"smallest":"",
				"largest":"",
				"succeeded":[],
				"failed":[],
				"javascript":TARGET_ARRAYS['js'],
				"css":TARGET_ARRAYS['css'],
				"html":TARGET_ARRAYS['html'],
				"json":TARGET_ARRAYS['json'],
				"all":[],
				"size_javascript":0,
				"size_css":0,
				"size_html":0,
				"size_json":0,
				"size_all":0
			}
	};
	var res_res = results["resources"];
	page.open(url, function(status) {
		if (status !== 'success') {
			console.log('failed to load the address');
			phantom.exit();
		}
		var largestResource = checkMaxSize(resources);
		var smallestResource  = checkMinSize(resources);
		res_res["amount"] = resources.length;
		res_res["smallest"] = smallestResource;
		res_res["largest"] = largestResource;
		res_res["succeeded"] = resourcesSucceeded;
		res_res["all"] = resources;
		res_res["size_all"] = calculateTotalContentSize(resources);

		sortContentData();
		res_res["html"] = TARGET_ARRAYS['html'];
		res_res["size_html"] = calculateTotalContentSize(res_res["html"]);
		res_res["css"] = TARGET_ARRAYS['css'];
		res_res["size_css"] = calculateTotalContentSize(res_res["css"]);
		res_res["json"] = TARGET_ARRAYS['json'];
		res_res["size_json"] = calculateTotalContentSize(res_res["json"]);
		res_res["javascript"] = TARGET_ARRAYS['javascript'];
		res_res["size_javascript"] = calculateTotalContentSize(res_res["javascript"]);


		resourcesFailed.forEach(function(resource) {
			res_res["failed"].push(resource);
			console.log('Resource failed to load: ' + resource.url + ' with a ' + resource.status);
		});

		var resultsStr = JSON.stringify(results, null, '\t');
		callback(resultsStr);
		phantom.exit();
	});
}

function main(url, callback) {
	getPageNetworkData(url, callback);
}

module.exports = main;