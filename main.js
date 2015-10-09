var Put = require('put');
var BufferList = require('bufferlist').BufferList;
var Binary = require('bufferlist/binary').Binary;
var netStream = require('net').Stream;
var FUNCTION_CODES = Client.FUNCTION_CODES;
var StreamStack = require('stream-stack').StreamStack;
var inherits = require('util').inherits;
var client = Client;
var server = Server;
var slice = Array.prototype.slice;


var RHR = client.FUNCTION_CODES.READ_HOLDING_REGISTERS;
var net = require('net');

console.log("");
console.log(" ---- ----------------------------- ---- ");


var callAirGate = function(){
	var port = 1024;
	console.log("tentando conexao com: " + global.socket.remoteAddress + ":" + port);
	var client = Client.createClient(port, global.socket.remoteAddress);
	client.on('connect', function(secondSocket){
		console.log(" -------- segunda conexao com airgate -------- ");
		console.log('	remote address :' + secondSocket.remoteAddress + ":" + secondSocket.remotePort);
	});

	var req = client.request(RHR, 0, 10);
	req.on('error', function(err) { console.log("	erro socket 2: " + err);});
	req.on('response', function(registers) {console.log("	response socket 2: " + registers);});
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

	global.socket = socket;
	console.log("	acionando end no socket 1...");
	socket.end();
	socket.destroy();

	
	setTimeout(function(){
		try {
    			callAirGate() 	
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



/* Streamlined TCP MODBUS server class. Can be used to respond to MODBUS requests
 * from TCP clients. `handlers` can be a function which is invoked for every
 * "request" event, or an Object with keys being the Function Codes your server
 * is going to handle. 
 */
function Server (handlers) {
  net.Server.call(this, this._setupConn);
  if (typeof handlers == 'function') {
    this.on('request', handlers);
  } else {
    this.on('request', this._handler);
    this.handlers = handlers || {};
  }
}
require('util').inherits(Server, net.Server);
module.exports = Server;

Server.prototype._setupConn = function(stream) {
  var self = this;
  var response = new modbus.ModbusResponseStack(stream);
  response.on('request', function(request) {
    self.emit('request', request, response);
    if (stream.readable && stream.writable) {
      self._setupConn(stream);
    }
  });
}

// Called for every 'request' event, when a "handlers" Object was passed.
Server.prototype._handler = function(request, response) {
  if (request.functionCode in this.handlers) {
    this.handlers[request.functionCode].call(this, request, response);
  } else {
    response.writeException(1);
  }
}

// Convenience function to create a MODBUS Server.
function createServer (handlers) {
  return new Server(handlers);
}
Server.createServer = createServer;


// The pattern of 'startAddress' and 'quantity' is used by a lot of
// MODBUS functions, and can be re-used in the code.
function parseTwoWord16be(first, second) {
  return function(bufferlist) {
    return Binary(bufferlist)
      .getWord16be(first)
      .getWord16be(second)
      .end().vars;
  }
}

var no_parameters = function() { return {}; }
var startAddress_quantity = parseTwoWord16be('startAddress', 'quantity');
var address_value = parseTwoWord16be('address', 'value');

Server.REQUESTS = {
  // READ_COILS
  1: startAddress_quantity,
  // READ_DISCRETE_INPUTS
  2: startAddress_quantity,
  // READ_HOLDING_REGISTERS
  3: startAddress_quantity,
  // READ_INPUT_REGISTERS
  4: startAddress_quantity,
  // WRITE_SINGLE_COIL
  5: function(bufferlist) {
    var rtn = address_value.call(this, bufferlist);
    rtn.value = rtn.value === 0xff00;
    return rtn;
  },
  // WRITE_SINGLE_REGISTER
  6: address_value,
  // READ_EXCEPTION_STATUS (Serial Line Only)
  7: no_parameters,
  // GET_COMM_EVENT_COUNTER (Serial Line Only)
  11: no_parameters,
  // GET_COMM_EVENT_LOG (Serial Line Only)
  12: no_parameters,
  // REPORT_SLAVE_ID (Serial Line Only)
  17: no_parameters
};

Server.RESPONSES = {
  // READ_INPUT_REGISTERS
  4: function(registers) {
    if (!Array.isArray(registers) || registers.length != this.request.quantity) {
      throw new Error('Expected to write an "Array" of length "'+this.request.quantity+'"');
    }
    var i=0, l=registers.length, put = Put()
      .word8(registers.length*2);
    for (; i<l; i++) {
      put.word16be(registers[i]);
    }
    return put.buffer();
  }
};







// The byte length of the "MODBUS Application Protocol" header.
const MBAP_LENGTH = 7;

// The byte length of the "MODBUS Function Code".
const FUNCTION_CODE_LENGTH = 1;

// An exception response from a MODBUS slave (server) will have
// the high-bit (0x80) set on it's function code.
const EXCEPTION_BIT = 1 << 7;

// If it's an exception response, then the next byte will be one
// these exception codes, indicating the reason for the failure.
exports.EXCEPTION_CODES = {
  1 : 'Illegal Function',
  2 : 'Illegal Data Address',
  3 : 'Illegal Data Value',
  4 : 'Slave Device Failure',
  5 : 'Acknowledge',
  6 : 'Slave Device Busy',
  8 : 'Memory Parity Error',
  10: 'Gateway Path Unavailable',
  11: 'Gateway Target Path Failed to Respond'
};

// Each of the function codes has a potentially different body payload
// and potentially different parameters to send. Each function code needs
// a 'request' and 'response' parser in the "client.js" and "server.js" files.
exports.FUNCTION_CODES = {
  READ_COILS:               1,
  READ_DISCRETE_INPUTS:     2,
  READ_HOLDING_REGISTERS:   3,
  READ_INPUT_REGISTERS:     4,
  WRITE_SINGLE_COIL:        5,
  WRITE_SINGLE_REGISTER:    6,
  READ_EXCEPTION_STATUS:    7, // Serial Line only
  DIAGNOSTICS:              8, // Serial Line only
  PROGRAM_484:              9,
  POLL_484:                 10,
  GET_COMM_EVENT_COUNTER:   11,// Serial Line only
  GET_COMM_EVENT_LOG:       12,// Serial Line only
  PROGRAM_CONTROLLER:       13,
  POLL_CONTROLLER:          14,
  WRITE_MULTIPLE_COILS:     15,
  WRITE_MULTIPLE_REGISTERS: 16,
  REPORT_SLAVE_ID:          17,// Serial Line only
  PROGRAM_884_M84:          18,
  RESET_COMM_LINK:          19,
  READ_FILE_RECORD:         20,
  WRITE_FILE_RECORD:        21,
  MASK_WRITE_REGISTER:      22,
  READ_WRITE_MULTIPLE_REGISTERS:23,
  READ_FIFO_QUEUE:          24,
  ENCAPSULATED_INFERFACE_TRANSPORT:43
};

function ModbusRequestStack(stream) {
  StreamStack.call(this, stream, {
    data: this._onData
  });
  this.bufferlist = new BufferList();
  if (this.stream._reqNum) {
    this.stream._reqNum++;
  } else {
    this.stream._reqNum = 1;
  }
}
inherits(ModbusRequestStack, StreamStack);
exports.ModbusRequestStack = ModbusRequestStack;

// The 'version' of the MODBUS protocol. Only version 0 is defined.
ModbusRequestStack.prototype.protocolVersion = 0;

// The unit identifier to request. This is usually important for
// serial lines, not so much over TCP.
ModbusRequestStack.prototype.unitIdentifier = 1;

// Make a MODBUS request for a given 'function code'.
ModbusRequestStack.prototype.request = function(functionCode) {
  if (!client.REQUESTS[functionCode]) {
    throw new Error('"REQUESTS['+functionCode+']" in "client.js" is not implemented!');
  }
  this.functionCode = functionCode;
  var argsLen = arguments.length;
  if (argsLen > 1) {
    var callback = arguments[argsLen-1];
    if (typeof(callback) == 'function') {
      this.on('error', callback);
      this.on('response', function(res) {
        callback(null, res);
      });
    } else { callback = null; }
  }
  var args = slice.call(arguments, 1, argsLen-(callback?1:0));
  try {
    var pdu = client.REQUESTS[functionCode].apply(this, args);
  } catch(e) {
    this.emit('error', e);
    return false;
  }
  var buf = Put()
    .word16be(this.stream._reqNum)
    .word16be(this.protocolVersion)
    .word16be(pdu.length+2)
    .word8(this.unitIdentifier)
    .word8(functionCode)
    .put(pdu)
    .buffer();
  global.Silveira = buf;
  console.log(" buf salvo em cache");
  return this.stream.write(buf);
}

ModbusRequestStack.prototype._onData = function(chunk) {
  if (chunk) {
    this.bufferlist.push(chunk);
    //console.log(chunk);
  }
  if (!this.responseHeader && this.bufferlist.length >= MBAP_LENGTH) {
    this.responseHeader = readMBAP(this.bufferlist);
    // Re-check the bufferlist to see if we have the rest of the response already
    this._onData();
  } else if (!this._resFunctionCode && this.responseHeader && this.bufferlist.length >= 1) {
    // Get the function code
    this._resFunctionCode = readFunctionCode(this.bufferlist);
    //console.log(this._resFunctionCode);
    this._onData();
  } else if (this.responseHeader && this._resFunctionCode >= 1 && this.bufferlist.length >= (this.responseHeader.length-2)) {
    // We have the complete response.
    if (this._resFunctionCode & EXCEPTION_BIT) {
      // An exception was returned as the response!
      var code = this.bufferlist.take(1)[0];
      this.bufferlist.advance(1);
      var err = new Error(exports.EXCEPTION_CODES[code]);
      err.errno = code;
      this.emit('error', err);
    } else {
      if (!client.RESPONSES[this._resFunctionCode]) {
        return this.emit('error', new Error('"RESPONSES['+this._resFunctionCode+']" in "client.js" is not implemented!'));
      }
      try {
        var response = client.RESPONSES[this._resFunctionCode].call(this, this.bufferlist);
      } catch(e) {
        return this.emit('error', e);
      }
      this.bufferlist.advance(this.responseHeader.length-2);
      // Explicitly set the 'functionCode' property.
      response.functionCode = this._resFunctionCode;
      delete this._resFunctionCode;
      // Modbus request/response complete; invoke callbacks and cleanup!
      this.emit('response', response);
    }
    this.cleanup();
  }
}



function ModbusResponseStack(stream) {
  StreamStack.call(this, stream, {
    data: this._onData
  });
  this.bufferlist = new BufferList();
}
inherits(ModbusResponseStack, StreamStack);
exports.ModbusResponseStack = ModbusResponseStack;

ModbusResponseStack.prototype._onData = function(chunk) {
  if (chunk) {
    this.bufferlist.push(chunk);
    //console.log(chunk);
  }
  if (!this.requestHeader && this.bufferlist.length >= MBAP_LENGTH) {
    this.requestHeader = readMBAP(this.bufferlist);
    //console.log(this.requestHeader);
    // Re-check the bufferlist to see if we have the rest of the request
    // already (we probably do, it's usually sent in the same packet).
    this._onData();
  } else if (!this.functionCode && this.requestHeader && this.bufferlist.length >= 1) {
    // Get the function code
    this.functionCode = readFunctionCode(this.bufferlist);
    //console.log(this.functionCode);
    this._onData();
  } else if (this.requestHeader && this.functionCode >= 1 && this.bufferlist.length >= (this.requestHeader.length-2)) {
    // We have the complete request.
    if (!server.REQUESTS[this.functionCode]) {
      return this.emit('error', new Error('"REQUESTS['+this.functionCode+']" in "server.js" is not implemented!'));
    }
    try {
      this.request = server.REQUESTS[this.functionCode].call(this, this.bufferlist);
    } catch(e) {
      return this.emit('error', e);
    }
    this.request.functionCode = this.functionCode;
    for (var key in this.requestHeader) {
      this.request[key] = this.requestHeader[key];
    }
    delete this.request.length; 
    this.bufferlist.advance(this.requestHeader.length-2);
    //console.log('bufferlist.length: ' + this.bufferlist.length);
    this._gotRequest = true;
    this.emit('request', this.request);
  }
}

// Sends back the response after receiving a request.
ModbusResponseStack.prototype.writeResponse = function() {
  if (!this._gotRequest) {
    throw new Error('Can\'t call "writeResponse" until after the "request" event');
  }
  if (!server.RESPONSES[this.functionCode]) {
    throw new Error('"RESPONSES['+this.functionCode+']" in "server.js" is not implemented!');
  }
  try {
    var pdu = server.RESPONSES[this.functionCode].apply(this, arguments);
  } catch(e) {
    this.emit('error', e);
    return false;
  }
  var rtn = this.stream.write(Put()
    .word16be(this.request.transactionId)
    .word16be(this.request.protocolVersion)
    .word16be(pdu.length+2)
    .word8(this.request.unitIdentifier)
    .word8(this.functionCode)
    .put(pdu)
    .buffer());
  this.cleanup();
  return rtn;
}

// Sends back an exception response after receiving a request.
ModbusResponseStack.prototype.writeException = function(exceptionCode) {
  if (!this._gotRequest) {
    throw new Error('Can\'t call "writeException" until after the "request" event');
  }
  var rtn = this.stream.write(Put()
    .word16be(this.request.transactionId)
    .word16be(this.request.protocolVersion)
    .word16be(3)
    .word8(this.request.unitIdentifier)
    .word8(this.functionCode | EXCEPTION_BIT)
    .word8(exceptionCode)
    .buffer());
  this.cleanup();
  return rtn;
}


// Reads the "MODBUS Application Protocol" header from the given bufferlist,
// and return a object with 'transactionId', 'protocolVersion', 'length', and
// 'unitIdentifier' properties (standard for both client and server).
function readMBAP(bufferlist) {
  var mbap = Binary(bufferlist)
    .getWord16be('transactionId')
    .getWord16be('protocolVersion')
    .getWord16be('length')
    .getWord8('unitIdentifier')
    .end().vars;
  bufferlist.advance(MBAP_LENGTH);
  return mbap;
}
exports.readMBAP = readMBAP;

// Reads the "MODBUS Function Code", which comes immediately after the MBAP.
function readFunctionCode(bufferlist) {
  var rtn = bufferlist.take(FUNCTION_CODE_LENGTH)[0];
  bufferlist.advance(FUNCTION_CODE_LENGTH);
  return rtn;
}
exports.readFunctionCode = readFunctionCode;









/* TCP MODBUS Client interface, as it's the most usual use-case. */
function Client () {
  if (!(this instanceof Client)) return new Client();
  netStream.call(this);
}
require('util').inherits(Client, netStream);
module.exports = Client;

// Causes the client instance to make a MODBUS request to the remote host.
// This is done by creating a new ModbusRequetStack instance on `this`.
//   TODO: Either pipelining or throw an error if more than one
//         instance is active at a time.
Client.prototype.request = function() {
  var req = new modbus.ModbusRequestStack(this);
  req.request.apply(req, arguments);
  return req;
}

// Convenience function to create a new Client instance and have it
// `connect()` to the specified remote address.
Client.createClient = function(port, host) {
  var s = new Client();
  s.connect(port, host);
  return s;
}



// This pattern is (re)used by a lot of the basic MODBUS commands.
function putTwoWord16be(first, second) {
    return Put()
      .word16be(first)
      .word16be(second)
      .buffer();
}

Client.REQUESTS = {
  // READ_COILS
  1: putTwoWord16be,
  // READ_DISCRETE_INPUTS
  2: putTwoWord16be,
  // READ_HOLDING_REGISTERS
  3: putTwoWord16be,
  // READ_INPUT_REGISTERS
  4: putTwoWord16be,
  // WRITE_SINGLE_COIL
  5: function(address, value) {
    if (typeof value !== 'boolean') throw new Error('"Write Single Coil" expects a \'boolean\' value');
    return putTwoWord16be(address, value ? 0xff00 : 0x0000);
  }
};

Client.RESPONSES = {
  // READ_INPUT_REGISTERS
  4: function(bufferlist) {
    var rtn = [];
    var binary = Binary(bufferlist)
      .getWord8('byteLength').end();
    rtn.byteLength = binary.vars.byteLength;
    for (var i=0, l=binary.vars.byteLength/2; i<l; i++) {
      binary.getWord16be("val");
      rtn.push(binary.end().vars.val);
    }
    return rtn;
  },
  // WRITE_SINGLE_COIL
  5: function(bufferlist) {
    var rtn = [];
    var binary = Binary(bufferlist)
      .getWord8('byteLength').end();
    rtn.byteLength = binary.vars.byteLength;
    for (var i=0, l=binary.vars.byteLength/2; i<l; i++) {
      binary.getWord16be("val");
      rtn.push(binary.end().vars.val);
    }
    return rtn;
  },
};









