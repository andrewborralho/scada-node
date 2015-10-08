
var RHR = require('modbus-stack').FUNCTION_CODES.READ_HOLDING_REGISTERS;
var net = require('net');
var modbus = require('modbus-stack/modbus-stack');
var modClient = require('modbus-stack/client');

modClient.createClient = function(port, host) {
  var s = new modClient();
  global.socket.pipe(s);
  s.pipe(global.socket);
  return s;
}


var callAirGate = function(){
	console.log("tentando chamar airgate...");
	global.tooTallClient.request(RHR, 0, 10, function(err, response) {
  		if (err) {throw err; console.log(err);}
  		console.log("	airgate responde: " + response);
  		global.tooTallClient.end();
	});
}


var server = net.createServer (function (socket){ 
	console.log(" ---- airgate conectado ---- ");
	console.log(' remote address :' + socket.remoteAddress + ":" + socket.remotePort);
	global.socket = socket;
	global.tooTallClient = modClient.createClient(1,1);
	//console.log(' address :' + socket.address().address + ":" +  socket.address().port);
	//console.log(' local :' + socket.localAddress + ":" + socket.localPort);
	
	setTimeout(function(){
		callAirGate() 
	},6000);
	
}, 10000);


server.listen(502);


/*
socket.on('data', function(data) {
  		try {
  			console.log("recebeu data: " + data);
  		}
  		catch(exception) {
  			console.log(" socket on data exception");
    			console.log(exception.toString());
  		}
	});
	setTimeout(function(){
		socket.write('000100000006FF0300040001', 'hex', function(data){
			console.log("socket write (tentativa): " + data); 
   			})
    	});
*/



/*

var readAirGate = function(ipAddress) {
	
	
	var RHR = require('modbus-stack').FUNCTION_CODES.READ_HOLDING_REGISTERS;
	var client = require('modbus-stack/client').createClient(502, ipAddress);
	var req = client.request(RHR, 0, 50);  // Read 50 contiguous registers from 0
	req.on('response', function(registers) {
  		console.log(registers);
  		client.end();
	});
}
*/


/*


	socket.on('connect', function () {
		console.log("socket connect sucesso: " + data); 

		socket.write('000100000006FF0300040001', 'hex', function(data){
			console.log("socket write (tentativa): " + data); 
   		})
    	});
    	
    	socket.on('data', function (data) {
		console.log("socket data sucesso: " + data); 
    	});
*/


/*
var readAirGate = function(ipAddress){
	
var modbus = require('./modbus');

	console.log(ipAddress);
	// create a modbus client
	var client = modbus.createTCPClient(502, ipAddress, function (err) {
	    if (err) {
	        console.log(err);
	        exit(0);
	    }
	});
	
	// make some calls
	client.readInputRegister(0, 10, function (resp, err) {
		if(err) { console.log(err);}
		console.log(resp);
	  // resp will look like { fc: 4, byteCount: 20, register: [ values 0 - 10 ] }
	});
}
*/


/*


*/



/*

var registersFromAirgate = server.readHoldingRegisters(1, 4, 4, callback)


server.readHoldingRegisters = function() {
	var bits = "000000000";
	var bit = 01010010101001;
	
	
	
}

var modbus = require("modbus-tcp");
var client = new modbus.Client();

// link client and server streams together 
client.pipe(server.pipe());
 
var from = 4; var to = 4;
client.readHoldingRegisters(1, from, to, function (err, items) {
	for (var i = from; i <= to; i++) {
			console.log("register " + items[i - from][0] + " - " + items[i - from][1]);
		}
});
    
*/









/*


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

*/

/*
var appication = require("http");
var server = appication.createServer(onRequest);
server.listen(3000, onServerStart);
*/

/*

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

*/

/*

var http=require('http');
var ports = [8080, 502];

for (i = 999; i < 1030; i++){
ports.push(i);
}

var connectedPorts = "ports: ";

var servers = [];
var s;
function reqHandler(req, res) {
    console.log({
        remoteAddress: req.socket.remoteAddress,
        remotePort: req.socket.remotePort,
        localAddress: req.socket.localAddress,
        localPort: req.socket.localPort,
    });
}



ports.forEach(function(port) {
    connectedPorts = connectedPorts + port + " ";
    s = http.createServer(reqHandler);
    s.listen(port);
    servers.push(s);
});

console.log(connectedPorts);

*/

    




