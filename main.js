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
var http = require("http");


var fs = require("fs");
var file = process.env.CLOUD_DIR + "/" + "test.db";
var exists = fs.existsSync(file);

if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
	if(!exists) {
		db.run("CREATE TABLE Stuff (thing TEXT)");
	}
	
	var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");
	
	//Insert random data
	var rnd;
	for (var i = 0; i < 10; i++) {
		rnd = Math.floor(Math.random() * 10000000);
		stmt.run("Thing #" + rnd);
	}
	
	stmt.finalize();
	db.each("SELECT rowid AS id, thing FROM Stuff", function(err, row) {
		console.log(row.id + ": " + row.thing);
	});
});
db.close()


var fillDataOnHtml = function(formattedData){
	airGateData = "<p> Valor:" + formattedData[0] + " Identificador: " + formattedData[1] + "</p>"; 
	var html = "<html><body><h1> Dado do AirGate </h1><br>" + airGateData + "</body></html>";
	return html;
};


var onHttpRequest = function(request, response) {
	console.log("    requested from " + request.connection.remoteAddress);
    response.writeHead(200, {"Content-Type": "text/html"}); // HTML??
    if (request.url == "/") {
    	var html = fillDataOnHtml(['2', '3']);
    	response.write(html);
    	response.end();
    }
    else if(request.url != "/") {
        response.write("<h1>Pagina principal em ~/</h1>");
        response.end();
    }
}

var onServerStart = function() {
	require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  	console.log('\n --------------- web server bound: ' + add);
	});
};

var webServer = http.createServer(onHttpRequest);
webServer.listen(3000, onServerStart);




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
