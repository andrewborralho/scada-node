var http = require("http");
var atendeRequisicao = function(request, response) {
    response.writeHead(200, {"Content-Type": "text/html"}); // HTML??
    if (request.url == "/") {
        response.write("nada acontece");
    }
    else if(request.url != "/") {
        response.write("<h1>Hello Silveira!</h1>");
        response.end();
    }
}
var rotinaInicialDoServidor = function() {
    console.log("Servidor X rodando");
}
var server = http.createServer(atendeRequisicao);
server.listen(3000, rotinaInicialDoServidor);