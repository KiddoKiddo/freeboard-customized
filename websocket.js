/* const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8181 });

wss.on('connection', function connection(ws, req) {

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  
  setInterval(function() {

	const a = {
		"temperature": Math.floor(Math.random() * (35 - 20) + 20),
		"pressure" : Math.random().toFixed(2),
		"vibration" : {
			"X": (Math.random() * 5).toFixed(2),
			"Y": (Math.random() * 5).toFixed(2),
			"Z": (Math.random() * 5).toFixed(2)
		}
	}  
  	ws.send(JSON.stringify(a)); 
  }, 500);
  
  ws.on('close', function() {
    console.log('Connection Closed');
  });
}); */

console.log("Start WebSocket at localhost:8181");

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8181 });

function heartbeat() {
	this.isAlive = true;
	const a = {
		"temperature": Math.floor(Math.random() * (35 - 20) + 20),
		"pressure" : Math.random().toFixed(2),
		"vibration" : {
			"X": (Math.random() * 5).toFixed(2),
			"Y": (Math.random() * 5).toFixed(2),
			"Z": (Math.random() * 5).toFixed(2)
		}
	}  
  	this.send(JSON.stringify(a)); 
}

wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 3000);