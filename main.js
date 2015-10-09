var net = require('net');
var netStream = require('net').Stream;
var RHR = require('modbus-stack').FUNCTION_CODES.READ_HOLDING_REGISTERS;
var clientModule = require('modbus-stack/client');
var fs = require('fs');
var modbus = require('modbus-stack');
var ModbusRequestStack = require('modbus-stack').ModbusRequestStack;


console.log("");
console.log(" ---- ----------------------------- ---- ");

function printObject(o) {
  var out = '';
  for (var p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  console.log(out);
}

function copyStreamParameters(source, destiny) {
	destiny._handle = source._handle ;
	destiny._hadError = source._hadError ;
	destiny._readableState = source._readableState ;
	destiny.readable = source.readable ;
	destiny._events = source._events ;
	destiny._eventsCount = source._eventsCount ;
	destiny._writableState = source._writableState ;
	destiny.writable = source.writable ;
	destiny.allowHalfOpen = source.allowHalfOpen ;
	destiny.destroyed = source.destroyed ;
	destiny.bytesRead = source.bytesRead ;
	destiny._bytesDispatched = source._bytesDispatched ;
	destiny._pendingEncoding = source._pendingEncoding ;
	destiny._peername = source._peername ;
	destiny._unrefTimer = source._unrefTimer ;
}

var callAirGate = function(socket){
	console.log("tentando enviar HRH para: " + socket.remoteAddress + ":" + socket.remotePort);
	//printObject(socket);
	var client = new ModbusRequestStack(socket);

	var gotResponse = false;
	copyStreamParameters(socket, client);
	
	client.request(RHR, 0, 5, function(err, response) {
  		if (err) {console.log(err);throw err;};
		console.log("	airgate response OK: " + response);
  		client.end();
	});
	/*
	var req = client.request(RHR, 0, 10);
	req.on('error', function(err) { console.log("	airgate error: " + err);});
	req.on('response', function(err,registers) {
		if (err) {
			console.log('	airgate error response: ' + err);
			throw err;
		}
		console.log("	airgate response OK: " + registers);
		gotResponse = true;
		console.log('	ending socket server');
		socket.end();
	});
	*/
	socket.on('close', function() {
    		assert.ok(gotResponse, " airgate not send 'response'")
	});
}


var server = net.createServer (function (socket){ 
	console.log("");
	console.log(" -------- recebeu conexao do airgate -------- ");
	console.log('	remote address :' + socket.remoteAddress + ":" + socket.remotePort);
	
	socket.on('error', function(err) { console.log("	erro socket: " + err);});
	socket.on('end', function() { console.log("	end socket");});
 	socket.on('close', function() { console.log("	close socket");});

	setTimeout(function(){
		try {
    			callAirGate(socket) 	
		}
		catch(err) {
			console.log("airgate error: " + err)
		}
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
  		};
	});
	setTimeout(function(){
		socket.write('000100000006FF0300040001', 'hex', function(data){
			console.log("socket write (tentativa): " + data); 
   			})
    	});
*/




























