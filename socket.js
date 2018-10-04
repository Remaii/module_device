'use strict';

let io = require('socket.io-client');
let exec = require('execa');
let gpio = require('./gpio');

module.exports = function(c) {
	console.log("Socket connect to", c.socketUrl);
	let socket = io.connect(c.socketUrl);

	let identifyMe = {
		action: "identifyDevice",
		deviceId: c.deviceId,
	};
	console.log("identifyMe =", identifyMe);
	socket.emit('link', identifyMe);

	let easyData = {
		room: null,
		action: "",
		deviceId: c.deviceId
	};

	socket.on('link', function(data) {
		console.log(data, 'link receive, is for me?', data.device.uniq === c.deviceId ? "yes" : "no");
		if (data.device.uniq === c.deviceId) {
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
					console.log(data);
					break;
				case 'reload_me':
					exec.shell('pm2 reload all').then((out) => {
						console.log(out);
						return;
					}).catch((err) => {
						console.log(err);
						return;
					});
					break;
				case 'update_me':
					exec.shell('git pull').then((out) => {
						console.log(out, "Out of update, restart");
						process.exit(1);
						return;
					}).catch((err) => {
						console.log(err);
						return;
					});
					break;
				default:
					socket.emit('connector', easyData);
					break;
			}
		}
	});
};