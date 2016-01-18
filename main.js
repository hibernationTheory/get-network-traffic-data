/*
	MODULES
*/
var casper = require('casper').create({
	logLevel:'debug',
	verbose:false
});
var fs = require('fs');
var getPageNetworkData = require('./getPageNetworkData.js');

/*
	GLOBALS & CONFIG
*/

var DATA_ALL = {};
var URL_DATA_ALL = [];
var COUNTER_REPEAT = 0;

var config_file = './config.json';
var config_data_json = fs.read(config_file);
var config_data = JSON.parse(config_data_json);

var URL_ALL = config_data["urls"]
var TARGET_FILE = config_data["output_file"]

function getMinMax(dataArray, attr) {
	dataArray.sort(function(item1, item2) {
		var size1 = item1.data.resources[attr];
		var size2 = item2.data.resources[attr];
		return size1 - size2;
	});
	return [dataArray[0].data.resources[attr], dataArray[dataArray.length-1].data.resources[attr]];
};

function delayedLoop(maxLoops) {
	var counter = 0;
	(function next() {
	    if (counter > maxLoops) {
			end();
			return;
	    }
	    
	    setTimeout(function() {
	    	casper.start();
	        console.log(counter);
	        repeat(counter);
	        counter++;
	        casper.wait(1000, next);
	    }, 2000);
	})();
}

function repeat(index) {
	console.log('repeat');
	url = URL_ALL[index];
	getPageNetworkData(url, function(data) {
		var currentData = {};
		currentData["url"] = url;
		currentData["data"] = data;
		currentData["_id"] = index;
		URL_DATA_ALL.push(currentData);
	});
}

function end() {
	console.log('end');
	var amountMinMax = getMinMax(URL_DATA_ALL, "amount");
	var sizeMinMax = getMinMax(URL_DATA_ALL, "size_all");
	DATA_ALL["pageDataGeneral"] = {}
	DATA_ALL["pageDataGeneral"]["amountMin"] = amountMinMax[0];
	DATA_ALL["pageDataGeneral"]["amountMax"] = amountMinMax[1];
	DATA_ALL["pageDataGeneral"]["sizeMin"] = sizeMinMax[0];
	DATA_ALL["pageDataGeneral"]["sizeMax"] = sizeMinMax[1];
	DATA_ALL["pageDataAll"] = URL_DATA_ALL

	DATA_ALL = JSON.stringify(DATA_ALL, null, '\t');
	fs.write(TARGET_FILE, DATA_ALL, 'w');
	casper.exit();
}
delayedLoop(URL_ALL.length-1);

