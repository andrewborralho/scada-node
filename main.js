var net = require('net');
var RHR = require('modbus-stack').FUNCTION_CODES.READ_HOLDING_REGISTERS;
var clientModule = require('modbus-stack/client');

console.log("");
console.log(" ---- ----------------------------- ---- ");


var callAirGate = function(socket){
	var port = 1024;
	console.log("tentando conexao com: " + socket.remoteAddress + ":" + port);
	var client = new modbus.ModbusResponseStack(socket);
	var gotRequest = false;
	var req = client.request(RHR, 0, 10);
	req.on('error', function(err) { console.log("	erro client: " + err);});
	req.on('response', function(err,registers) {
		if (err) {
			console.log('	erro client response: ' + err);
			throw err;
		}
		console.log("	response client: " + registers);
		gotRequest = true;
		console.log('	end socket server');
		socket.end();
	});
	socket.on('close', function() {
    		assert.ok(gotRequest, "The 'request' event was never fired")
	});
}


var server = net.createServer (function (socket){ 
	console.log("");
	console.log(" -------- primeira conexao com airgate -------- ");
	console.log('	remote address :' + socket.remoteAddress + ":" + socket.remotePort);
	
	socket.on('error', function(err) { console.log("	erro socket 1: " + err);});
	socket.on('end', function() { console.log("	end socket 1");});
	socket.on('data', function(data) { console.log("	data socket 1: " + data);});
	socket.on('timeout', function() { console.log("	timeout socket 1");});
	socket.on('close', function() { console.log("	close socket 1");});

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




























