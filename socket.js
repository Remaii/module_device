'use strict';

let io = require('socket.io-client');
let exec = require('execa');
let gpio = require('./gpio');

module.exports = function(c) {
	console.log("Socket connect to", c.socketUrl);
	let socket = io.connect(c.socketUrl);

	let easyData = {
		room: null,
		action: "",
		deviceId: c.deviceId
	};
	let identifyMe = {
		action: "identifyDevice",
		deviceId: c.deviceId,
	};
	console.log("identifyMe =", identifyMe);
	socket.emit('initial', identifyMe);


	socket.on('link', function(data) {
		console.log(data, 'link receive');
		switch (data.action) {
			case "SayHi":
				easyData.room = data.room;
				easyData.action = "ready";
				gpio.initial(data.device);
				socket.emit('initial', easyData);
				break;
			case "changeState":
				if (data.pin && data.uniq === c.deviceId) {
					easyData.action = "stateChanged";
					gpio.changeState(data);
					socket.emit('infos', easyData);
				}
				break;
			case 'errored':
				console.log(data, "error");
				break;
			case 'reload_me':
				exec.shell('pm2 reload all').then((out) => {
					console.log(out, "out after pm2 reload");
					return;
				}).catch((err) => {
					console.log(err, "err after pm2 reload");
					return;
				});
				break;
			case 'update_me':
				exec.shell("cd " + __dirname + "; git pull").then((out) => {
					if (out.stdout !== "Already up-to-date." && out.stdout !== "Déjà à jour." && out.stdout !== "D?j? ? jour.") {
						console.log("Restart by pull-request and change detect", out.stdout);
						process.exit(0);
					} else {
						console.log("no change detect");
					}
					return;
				}).catch((err) => {
					console.log(err, "Exit by error");
					process.exit(1);
					return;
				});
				break;
			default:
				socket.emit('connector', easyData);
				break;
		}
	});

	socket.on('disconnect', function() {
		setTimeout(function() {
			socket.emit("initial", identifyMe);
		}, 10000);
	});

	process.on('SIGINT', function () {
		easyData.action = "shutdown";
		socket.emit('initial', easyData);
	});
};