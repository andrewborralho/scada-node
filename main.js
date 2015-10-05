


var onFirstConectionWithAirGate = function(){
	// salvar ip
}

var getDevicesStatusFromAirGate = function(UnitId){ 
	// query pelo modbus
};
var saveDevicesStatus = function(){
	// ou db ou cache (global);
};

var getRawDataFromDb = function(){
	return [3333, 1]; // [valor, unitId]
};

var formatRawDataFromDb = function(rawData){
	// A ideia eh traduzir o 3333 pra alguma porcentagem
	var formattedData = rawData;
	return formattedData;
};

var fillDataOnHtml = function(formattedData){
	airGateData = "<p> Valor:" + formattedData[0] + " Identificador: " + formattedData[1] + "</p>"; 
	var html = "<html><body><h1> Dado do AirGate </h1><br>" + airGateData + "</body></html>";
	return html;
};

var onRequest = function(request, response) {
	console.log("    requested from " + request.connection.remoteAddress);
    response.writeHead(200, {"Content-Type": "text/html"}); // HTML??
    if (request.url == "/") {
    	var rawData = getRawDataFromDb();
    	var formattedData = formatRawDataFromDb(rawData);
    	var html = fillDataOnHtml(formattedData);
    	response.write(html);
    }
    else if(request.url != "/") {
        response.write("<h1>Pagina principal em ~/</h1>");
        response.end();
    }
}
var onServerStart = function() {
	require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  	console.log('---- servidor rodando em: '+add);
	});
}


/*
var appication = require("http");
var server = appication.createServer(onRequest);
server.listen(3000, onServerStart);
*/



var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
io.on('connection', function(socket){
  console.log('    8080 connection :', socket.request.connection._peername);
});

server.listen(8080, onServerStart);

var server2  = require('http').createServer(app);
var io2      = require('socket.io').listen(server2);
io2.on('connection', function(socket){
  console.log('    502 connection :', socket.request.connection._peername);
});

server2.listen(502, onServerStart);

var server3  = require('http').createServer(app);
var io3      = require('socket.io').listen(server3);
io3.on('connection', function(socket){
  console.log('    1025 connection :', socket.request.connection._peername);
});

server3.listen(1025, onServerStart);

    
    




