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

function parseDhtFromAdafruit(data) {
	let split = data.split(' ');
	let ret = {
		temp: split[0].slice(5).slice(0,4),
		hum: split[2].slice(9).slice(0,4)
	};
	return ret;
};

function setState(nPin, i) {
	let mode = nPin.mode.toString().toLowerCase();
	let number = parseInt(nPin.number);
	PinActive[i] = nPin;
	PinActive[i].gpio = new Gpio(number, mode);

	if (mode === "out") {
		let n = nPin.state ? nPin.reverse ? 0 : 1 : nPin.reverse ? 1 : 0;
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
		PinActive[i].data = parseDhtFromAdafruit(exec.shellSync(__dirname + '/bin/adafruit.py ' + nPin.sensorType + ' ' + number).stdout);
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
		console.log(device.pins.length, "pin to init");
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
	getData: function() {
		let ret = {
			configured: PinActive.length,
			tested: 0,
			data: {}
		};
		console.log('getData from all input configured');
		_.each(PinActive, function(pin) {
			if (pin.mode === 'out') {
				ret.data[pin.name] = {
					defaultState: pin.state,
					mode: pin.mode,
					number: pin.number,
					reverse: pin.reverse ? "yes":"no",
					active: pin.gpio.readSync()
				};
				console.log('out read', ret.data[pin.name]);
			} else if (pin.mode === 'in') {
				ret.data[pin.name] = parseDhtFromAdafruit(exec.shellSync(__dirname + '/bin/adafruit.py ' + pin.sensorType + ' ' + pin.number).stdout);
				console.log('in read', ret.data[pin.name]);
			} else {
				ret.data[pin.name] = {
					defaultState: pin.state,
					mode: pin.mode,
					number: pin.number,
					reverse: pin.reverse ? "yes":"no",
					active: pin.gpio.readSync()
				};
				console.log('other read', ret.data[pin.name]);
			}
			ret.tested++;
		});
		return ret;
	},
	getPinActive: function() {
		return PinActive;
	}
};