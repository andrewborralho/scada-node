/*
todo: 
- implementar reconnect no caso timeout
- organizar pipeline do procedimento
- criar webserver
- display da info no webserver
- display do grafico
- salvar info
*/
var net = require('net');

var modbusServer = net.createServer (function (socket){ 
	console.log(" - recebeu conexão de " + socket.remoteAddress + ":" + socket.remotePort);
	socket.on('data', function(data) {
  			console.log(" - data on hex: " + data.toString('hex'));
	});
	
	setInterval(function(){
		socket.write('000100000006FF0300040001', 'hex');
    	}, 5000);
});
modbusServer.listen(502, function(){console.log("\n ----------- modbus server listening ----------- ");});

/*

var formatRequest = function(functionCode, start, end){
	
	var pdu = putTwoWord16be(start, end);
	console.log(' start:' + start + '\n end:' + end + '\n hex:' + pdu);
}

formatRequest(2, 12102, 11120);

*/



