var net = require('net');
var http = require("http");
var fs = require('fs');
var SQL = require('sql.js');
const POOLING_INTERVAL = 10000;

var express = require("express");
var app = express();

app.get("/", function(req, res) {
	res.sendfile('index.html')
});

app.post("/user/add", function(req, res) { 
	/* some server side logic */
	res.send("OK");
});

 var port = process.env.PORT || 3000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });
 
 
 
 


var filebuffer = fs.readFileSync('db.sqlite');
var db = new SQL.Database(filebuffer);
db.run("CREATE TABLE modhistory (value);");


var saveResultOnDb = function(data){
	db.run("INSERT INTO modhistory VALUES (?)", [data]);
}

var queryDb = function(){
	var res = db.exec("SELECT * FROM modhistory;");
	resArray = res[0].values; // 1,1111,1,2222,1,3333,1,4444
	
	console.log("res: " + res.toString());
	console.log("resarray: " + resArray.toString());
	return resArray;
}

saveResultOnDb(1111);
saveResultOnDb(2222);
saveResultOnDb(3333);
saveResultOnDb(4444);
queryDb();
    

/*

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

*/


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
    	}, POOLING_INTERVAL);
});
modbusServer.listen(502, function(){console.log("\n --------------- modbus server listening --------------- ");});
