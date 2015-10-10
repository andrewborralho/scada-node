// socket.write('000100000006FF0300040001', 'hex', function(data){console.log("socket write (tentativa): " + data); })
var net = require('net');
var Put = require('put');
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

function putTwoWord16be(first, second) {
    return Put()
      .word16be(first)
      .word16be(second)
      .buffer();
}

var formatRequest = function(functionCode, start, end){
	
	var pdu = putTwoWord16be(start, end);
	console.log(' start:' start + '\n end:' + end + '\n hex:' + pdu);
	/*
	var buf = Put()
		.word16be(this.stream._reqNum)
		.word16be(this.protocolVersion)
		.word16be(pdu.length+2)
		.word8(this.unitIdentifier)
		.word8(functionCode)
		.put(pdu)
		.buffer();
	return this.stream.write(buf);
	*/
}

formatRequest(2, 5, 10);






var server = net.createServer (function (socket){ 
	console.log("");
	console.log(" -------- recebeu conexao do airgate -------- ");
	console.log('	remote client address :' + socket.remoteAddress + ":" + socket.remotePort);
	socket.pipe(socket);
	socket.on('timeout', function(){console.log('	server timeout');});
	socket.on('error', function(error){console.log('	server error: ' + error);});
	socket.on('close', function(){console.log('	server closed');});
	setTimeout(function(){
		try {
			console.log('	server writable: ' + socket.writable);
			console.log('	server readable: ' + socket.readable);
    			callAirGate(socket) 	
		}
		catch(err) {
			console.log("callAirGate error: " + err)
		}
	},3000);
	
}, 10000);


server.listen(502);







