/*
todo: 
- implementar reconnect no caso timeout
- organizar pipeline do procedimento
- criar webserver
- display da info no html do webserver
- display do grafico
- salvar info
*/
var net = require('net');

var getRegisterValue = function(hexString){
	return parseInt("0x" + hexString.substr(18,hexString.length));
}

var modbusServer = net.createServer (function (socket){ 
	console.log(" ------- recebeu conexão de " + socket.remoteAddress + ":" + socket.remotePort);
	socket.on('data', function(data) {
			data = data.toString('hex');
  			// console.log(" --- data on hex: " + data);
  			console.log(" --- register value: " + getRegisterValue(data));
	});
	
	setInterval(function(){
		socket.write('000100000006FF0300040001', 'hex');
    	}, 5000);
});
modbusServer.listen(502, function(){console.log("\n --------------- modbus server listening --------------- ");});
