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
var fs = require('fs');
var SQL = require('sql.js');

var filebuffer = fs.readFileSync('db.sqlite');
var db = new SQL.Database(filebuffer);
/*
console.log('criando table');
db.run("CREATE TABLE modhistory (unitid, value);");
db.run("INSERT INTO modhistory VALUES (?,?), (?,?);", [1,3000,2,6000]);

console.log('ve valores inseridos');
var res = db.exec("SELECT * FROM modhistory;");
console.log("[0].columns " + res[0].columns);
console.log("[0].values " + res[0].values);

*/
console.log('agora apaga tudo');
db.run("DELETE FROM modhistory;");

console.log('nao eh pra vir nada');
var res = db.exec("SELECT * FROM modhistory;");
console.log("[0].columns " + res[0].columns);
console.log("[0].values " + res[0].values);

console.log('reinsere');
db.run("INSERT INTO modhistory VALUES (?,?), (?,?);", [1,3000,2,6000]);

console.log('ve valores inseridos');
var res = db.exec("SELECT * FROM modhistory;");
console.log("[0].columns " + res[0].columns);
console.log("[0].values " + res[0].values);

// var data = db.export();
// var buffer = new Buffer(data);
// fs.writeFileSync("db.sqlite", buffer);

    


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
