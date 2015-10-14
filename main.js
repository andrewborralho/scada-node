var net = require('net');
var http = require("http");
var fs = require('fs');
var SQL = require('sql.js');
const POOLING_INTERVAL = 3000;
const SIGNAL_LEVEL_POOLING_INTERVAL = 6000;


var express = require("express");
var app = express();
var airgateHistory = [];

app.get("/", function(req, res) {
	res.sendfile('index.html')
});

app.get("/api/status", function(req, res) { 
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(airgateHistory));
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
var counter = 0;
var saveResults = function(parsedData){
	if (airgateHistory.length > 24) airgateHistory = airgateHistory.slice(-1);
	airgateHistory.push([counter,parsedData]);
  	//console.log(airgateHistory);
  	counter = counter + 3;
}



var modbusServer = net.createServer (function (socket){ 
	console.log(" ------- recebeu conexão de " + socket.remoteAddress + ":" + socket.remotePort);
	socket.on('data', function(data) {
			data = data.toString('hex');
			if("1".indexOf(data.substring(3,4)) > -1){
  				console.log(" --- data on hex: " + data);
  				var parsedData = getRegisterValue(data);
  				// console.log(" --- register value: " + parsedData);
  				saveResults(parsedData);
			}
			if("2".indexOf(data.substring(3,4)) > -1){
  				console.log(" --- data on hex: " + data);
  				var parsedData = getRegisterValue(data);
  				// console.log(" --- register value: " + parsedData);
  				// saveResults(parsedData);
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
