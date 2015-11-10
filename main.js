var net = require('net');
var http = require("http");
var fs = require('fs');
//var SQL = require('sql.js');
const POOLING_INTERVAL = 2000;
const SIGNAL_LEVEL_POOLING_INTERVAL = 6000;



var express = require("express");
var app = express();
var airgateHistory = [];
var signalLevel = "";

app.get("/", function(req, res) {
	res.sendfile('index.html')
});

app.get("/api/status", function(req, res) { 
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(airgateHistory));
});

app.get("/api/signal", function(req, res) { 
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(signalLevel));
});


 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendfile( __dirname + req.params[0]); 
 });

 var port = process.env.PORT || 3000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });
 
 
var getRegisterValue = function(hexString){
	if(hexString.length > 23) return 0;
	var result = parseInt("0x" + hexString.substr(18,hexString.length));
	if(result == 64536) { return undefined;}
	return result;
}

var extractSignalLevel = function(signalInHex){
	signalLevel = 0 - (parseInt("0x10000") - parseInt("0x" + signalInHex.substr(18,signalInHex.length)));
	return signalLevel;
}

var counter = 0;
setInterval(setNewTime, 1000);
function setNewTime(){
   ++counter;
}
var saveResults = function(parsedData){
	if (airgateHistory.length > 40) airgateHistory = airgateHistory.slice(-1);
	airgateHistory.push([new Date(),parsedData]);
  	//console.log(airgateHistory);
}


var modbusServer = net.createServer (function (socket){ 
	console.log(" ------- recebeu conexão de " + socket.remoteAddress + ":" + socket.remotePort);
	socket.on('data', function(data) {
			data = data.toString('hex');
			if(data.length == 22){
				if("1".indexOf(data.substring(3,4)) > -1){
	  				console.log(" --- data on hex: " + data);
	  				var parsedData = getRegisterValue(data);
	  				// console.log(" --- register value: " + parsedData);
	  				saveResults(parsedData);
				}
				if("2".indexOf(data.substring(3,4)) > -1){
	  				console.log(" ------- data on hex: " + data);
	  				extractSignalLevel(data);
				}
			}
	});
	
	setInterval(function(){
		socket.write('000100000006FF0300040001', 'hex');
    	}, POOLING_INTERVAL);
    	setInterval(function(){
		socket.write('000200000006FF03002E0001', 'hex');
    	}, SIGNAL_LEVEL_POOLING_INTERVAL);
});
modbusServer.listen(502, function(){console.log("\n --------------- modbus server listening --------------- ");});
