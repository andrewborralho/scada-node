// socket.write('000100000006FF0300040001', 'hex', function(data){console.log("socket write (tentativa): " + data); })
var net = require('net');
var netStream = require('net').Stream;
var RHR = require('modbus-stack').FUNCTION_CODES.READ_HOLDING_REGISTERS;
var clientModule = require('modbus-stack/client');
var fs = require('fs');
var modbus = require('modbus-stack');
var ModbusRequestStack = require('modbus-stack').ModbusRequestStack;
function printObject(o) {var out = '';for (var p in o) {out += p + ': ' + o[p] + '\n';}console.log(out);}
function copyStreamParameters(source, destiny) {destiny._handle = source._handle ;destiny._hadError = source._hadError ;destiny._readableState = source._readableState ;destiny.readable = source.readable ;destiny._events = source._events ;destiny._eventsCount = source._eventsCount ;destiny._writableState = source._writableState ;destiny.writable = source.writable ;destiny.allowHalfOpen = source.allowHalfOpen ;destiny.destroyed = source.destroyed ;destiny.bytesRead = source.bytesRead ;destiny._bytesDispatched = source._bytesDispatched ;destiny._pendingEncoding = source._pendingEncoding ;destiny._peername = source._peername ;destiny._unrefTimer = source._unrefTimer ;}
console.log("");console.log(" ---- ----------------------------- ---- ");
var holdOn = function(seconds){setTimeout(function(){},seconds*1000);}
var conn;

var secondServer = net.createServer (function (secondConnection){ 
	console.log('	second server address :' + secondConnection.remoteAddress + ":" + secondConnection.remotePort);
	secondConnection.on('close', function(){console.log('	closed second socket');});
	conn = secondConnection;
}, 10000);

secondServer.listen(35000, function(){console.log("	second server bound");});

holdOn(3);

var callAirGate = function(socket){
	try {
		holdOn(3);
		console.log('	conn writable: ' + conn.writable);
		console.log('	conn readable: ' + conn.readable);
		try {
			
			socket.pipe(conn);
			conn.pipe(socket);
			holdOn(3);
			try{
				// var conn = require('net').createConnection(port, socket.remoteAddress, function(){console.log('	conn connected !!!');});
				conn.on('timeout', function(){console.log('	conn timeout');});
				conn.on('error', function(error){console.log('	conn error: ' + error);});
				
				//console.log("tentando enviar RHR para: " + socket.remoteAddress + ":" + port);
				console.log("tentando enviar RHR para: " + conn.remoteAddress + ":" + conn.remotePort);
			
				var client = new ModbusRequestStack(conn);
				holdOn(3);

				var gotResponse = false;
				// copyStreamParameters(socket, client);
				
				console.log('	client writable: ' + client.writable);
				console.log('	client readable: ' + client.readable);
			
				client.on('timeout', function(){console.log('	client timeout');});
				client.on('error', function(error){console.log('	client error: ' + error);});
			
				client.request(RHR, 0, 5, function(err, response) {
			  		if (err) {console.log(err);throw err;};
					console.log("	airgate response OK: " + response);
			  		client.end();
				});
			}
			catch(err) {
				console.log("	modbus client error: " + err)
			}
		}
		catch(err) {
			console.log("	pipe socket and conn error: " + err)
		}
	}
	catch(err) {
		console.log("	conn error: " + err)
	}
}




var server = net.createServer (function (socket){ 
	console.log("");
	console.log(" -------- recebeu conexao do airgate -------- ");
	console.log('	remote address :' + socket.remoteAddress + ":" + socket.remotePort);
	
	socket.on('close', function(){console.log('	closed socket');});
	setTimeout(function(){
		try {
			console.log('	socket writable: ' + socket.writable);
			console.log('	socket readable: ' + socket.readable);
    			callAirGate(socket) 	
		}
		catch(err) {
			console.log("callAirGate error: " + err)
		}
	},3000);
	
}, 10000);


server.listen(502);







