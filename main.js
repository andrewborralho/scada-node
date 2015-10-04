
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
	/*
	var net = require("net");
	var client = net.connect(502, '182.100.67.113', function(){
		console.log("conexao estabelecida");
	});
	*/
}
/*

var net = require('net');

var socketServer = net.createServer(function(socket) {
	// socket.write('Echo server\r\n');
	// socket.pipe(socket);
});

server.listen(1337, '127.0.0.1');

var socket = io.listen(socketServer);
socket.on('connection', function (client) {
  var client_ip_address = socket.request.connection.remoteAddress;
}

var server = http.createServer(onRequest);
server.listen(3000, onServerStart);

*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  var client_ip_address = socket.request.connection.remoteAddress;
  console.log(client_ip_address);
});

io.listen(502, function(){
	console.log("io escutando 502");
})


http.listen(3000, function(){
  console.log('listening on *:3000');
});


