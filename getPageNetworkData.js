function main(casper, url, callback) {
	var RESOURCES = [];
	var RESOURCES_FAILED = [];
	var TARGET_ARRAYS = {
		"html":[],
		"javascript":[],
		"css":[],
		"image":[],
		"json":[],
		"svg_xml":[],
		"font":[]
	};
	var END = false;

	/*
		Event Listeners
	*/

	casper.on('resource.received', function(resource) {
		if (resource.stage === 'end' && !END) {
			RESOURCES.push(resource);
			if (resource.status >= 400) {
				RESOURCES_FAILED.push(resource);
			}
			organizeByContentType(resource);
		}
	});

	/*
		Utility Functions
	*/

	function calculateTotalContentSize(resourceArray) {
		var total = 0;
		resourceArray.forEach(function(item) {
			var size = item["_contentLength"];
			if (size && size > 0) {
				total += size;
			}
		});
		return total;
	}

	function promoteAndSortContentLengthData(resourceArray) {
		var contentLengthAttr = "_contentLength";

		resourceArray.forEach(function(item) {
			var status = item.status;
			var contentLength = -1;
			item.headers.forEach(function(header) {
				if (header.name === 'Content-Length' || header.name === 'content-length')  {
					contentLength = parseInt(header.value, 10);
				}
			});
			item[contentLengthAttr] = item[contentLengthAttr] || contentLength;
		});

		resourceArray.sort(function(item1, item2) {
			var size1 = item1["_contentLength"];
			var size2 = item2["_contentLength"];
			return size1 - size2;
		});
	};

	function organizeByContentType(resource) {
		// gets a html response and categorizes it into an array according to the content

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
		} else if (resource.contentType.indexOf('image') > -1) {
			TARGET_ARRAYS['image'].push(resource);
		}
	};

	function getPageNetworkData(url, callback) {
		casper.thenOpen(url, function() {
			var results = {
				"resources":
					{
						"amount":0,
						"smallest":"",
						"largest":"",
						"failed_ids":[],
						"javascript":TARGET_ARRAYS['javascript'],
						"css":TARGET_ARRAYS['css'],
						"html":TARGET_ARRAYS['html'],
						"json":TARGET_ARRAYS['json'],
						"image":TARGET_ARRAYS['image'],
						"all":[],
						"size_javascript":0,
						"size_css":0,
						"size_html":0,
						"size_json":0,
						"size_image":0,
						"size_all":0
					}
			};
			var res_res = results["resources"];
			promoteAndSortContentLengthData(RESOURCES);
			res_res["amount"] = RESOURCES.length;
			res_res["largest"] = RESOURCES.slice(-1)[0];
			res_res["smallest"] = RESOURCES.filter(function(item) { if (item["_contentLength"] > 0 ) { return item }})[0];
			res_res["all"] = RESOURCES;
			res_res["size_all"] = calculateTotalContentSize(RESOURCES);

			res_res["html"] = TARGET_ARRAYS['html'];
			res_res["size_html"] = calculateTotalContentSize(res_res["html"]);
			res_res["css"] = TARGET_ARRAYS['css'];
			res_res["size_css"] = calculateTotalContentSize(res_res["css"]);
			res_res["json"] = TARGET_ARRAYS['json'];
			res_res["size_json"] = calculateTotalContentSize(res_res["json"]);
			res_res["javascript"] = TARGET_ARRAYS['javascript'];
			res_res["size_javascript"] = calculateTotalContentSize(res_res["javascript"]);
			res_res["image"] = TARGET_ARRAYS['image'];
			res_res["size_image"] = calculateTotalContentSize(res_res["image"]);

			RESOURCES_FAILED.forEach(function(i) {
				res_res["failed_ids"].push(i.id);
				console.log('Resource failed to load: ' + i.url + ' with a ' + i.status);
			});
			END = true; // stop resource collection. would be better if I can just kill the event listener
			callback(results);
		});
		casper.run(function() {
		});
	}
	getPageNetworkData(url, callback);
};

module.exports = main;