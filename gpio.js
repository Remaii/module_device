// 'use strict';

const _ = require('lodash');
const exec = require('execa');
const Gpio = require('onoff').Gpio;
let PinActive = [];

function changeState(nPin) {
	console.log("changeState");
	let pin = new gpio(nPin.port, nPin.mode);
	// do change

	pin.writeSync(!pin.readSync());
	return ;
};

function parseIt(data) {
	let split = data.split(' ');
	console.log(split, "Split");
	let ret = {
		temp: split[0],
		hum: split[1]
	};
	console.log(ret, "ret!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	return ret;
};

function setState(nPin, i) {
	let mode = nPin.mode.toString().toLowerCase();
	let number = parseInt(nPin.number);
	let n = nPin.state ? 1 : 0;
	PinActive[i] = nPin;
	PinActive[i].gpio = new Gpio(number, mode);

	console.log('mode =', mode, 'n =', n, 'number =', number);
	if (mode === "out") {
		setTimeout(() => {
			PinActive[i].gpio.writeSync(0);
		}, 500);
		setTimeout(() => {
			PinActive[i].gpio.writeSync(1);
		}, 1000);
		setTimeout(() => {
			PinActive[i].gpio.writeSync(n);
		}, 1500);
	} else if (mode === "in") {
		PinActive[i].data = parseIt(exec.shellSync(__dirname + '/bin/adafruit.py 22 ' + number).stdout);
		console.log(PinActive[i].data);
	} else {
		console.log("mode pwm ?", mode==="pwm"?"yes is :":"no is :", mode);
	}
};

process.on('SIGINT', function () {
	_.each(PinActive, (p) => {
		console.log('Unexport GPIO pin:', p.name);
		p.gpio.unexport();
	});
});

module.exports = {
	initial: function(device) {
		console.log("init pins", device.pins.length);
		if (device.pins.length > 0) {
			_.each(device.pins, function (p, i) {
				if (PinActive[i]) {
					PinActive[i].gpio.unexport();
				}
				setState(p, i);
			});
		}
	},
	changeState: function(data) {
		let found = _.find(PinActive, {name: data.pin.name, number: data.pin.number });
		if (found) {
			found.state = !found.state;
			let n = found.state ? 1 : 0;
			found.gpio.writeSync(n);
		}
	},
	getPinActive: function() {
		return PinActive;
	}
};