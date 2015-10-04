
var http = require("http");


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

var io = require('socket.io').listen(502);
io.sockets.on('connection', function (socket) {
  var endpoint = socket.manager.handshaken[socket.id].address;
  console.log('    Client connected from: ' + endpoint.address + ":" + endpoint.port);
});

var server = http.createServer(onRequest);
server.listen(3000, onServerStart);


