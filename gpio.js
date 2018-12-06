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

function parseDataFromAdafruitDHT(data) {
	let split = data.split(' ');
	let ret = {
		temp: split[0].slice(5),
		hum: split[2].slice(9)
	};
	return ret;
};

function setState(nPin, i) {
	let mode = nPin.mode.toString().toLowerCase();
	let number = parseInt(nPin.number);
	let n = nPin.state ? 1 : 0;
	PinActive[i] = nPin;
	PinActive[i].gpio = new Gpio(number, mode);

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
		PinActive[i].data = parseDataFromAdafruitDHT(exec.shellSync(__dirname + '/bin/adafruit.py 22 ' + number).stdout);
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
				console.log('out read');
				ret.data[pin.name] = pin.gpio.readSync();
			} else if (pin.mode === 'in') {
				console.log('in read');
				ret.data[pin.name] = parseDataFromAdafruitDHT(exec.shellSync(__dirname + '/bin/adafruit.py 22 ' + pin.number).stdout);
			} else {
				console.log('other read');
				ret.data[pin.name] = pin.mode;
			}
			ret.tested++;
		});
		return ret;
	},
	getPinActive: function() {
		return PinActive;
	}
};