import express from 'express';
import { readFile } from 'fs/promises';
import http from 'http';
import https from 'https';
import process from 'process';
import { WebSocketServer } from 'ws';

function logger(name, obj) {
	console.dir({
		date: new Date(),
		[name]: obj
	});
}

async function newOptions() {
	const argv = process.argv.slice(2);
	if (argv[0] && argv[1]) {
		logger('options', {
			key: argv[0],
			cert: argv[1]
		});
		return {
			key: await readFile(argv[0]),
			cert: await readFile(argv[1])
		};
	}
}

async function newApp() {
	const app = express();

	const html = await readFile('index.html', 'utf-8');

	app.get('/', (req, res) => {
		logger('app:get', {
			ip: req.ip,
			method: req.method,
			path: req.path,
			body: req.body
		});
		res.send(html);
	});

	return app;
}

function newServer(options) {
	const server = options ? https.createServer(options) : http.createServer();
	const wsServer = new WebSocketServer({ server: server });
	let connection = 0;

	function broadcast(message) {
		logger('ws:broadcast', {
			message: message
		});
		wsServer.clients.forEach(client => {
			client.send(`${message} on ${new Date()}`);
		});
	}

	wsServer.on('connection', (ws, req) => {
		connection++;
		const ip = req.socket.remoteAddress;

		logger('ws:connect', {
			ip: ip
		});
		broadcast(`welcome ${ip}`);

		ws.send(`welcome from ${ip}, ${connection} connection`);

		ws.on('message', data => {
			data = data.toString('utf-8');
			logger('ws:message', {
				ip: ip,
				message: data
			});
			broadcast(`${ip}: ${data}`);
		});

		ws.on('close', () => {
			logger('ws:close', {
				ip: ip
			});
			broadcast(`good-bye ${ip}`);
			connection--;
		});
	});

	return server;
}

const options = await newOptions();
const app = await newApp();

const ip = '0.0.0.0';
const port = options ? '8443' : '8080';

const server = newServer(options);
server.on('request', app);
server.listen(port, ip, function () {
	console.log(`Listening at ${ip}:${port}`);
});
