'use strict';

let port = process.env.PORT || 3000;

let deviceId = "dvs_kqq4c7t889041"; // devras disparaitre ou etre charger a partir du doc de conf

require('exec')("ifconfig | grep 'inet 192' | cut -d: -f2 | awk '{ print $2  }'", function(err, out, code) {
	if (err instanceof Error) { throw err; }
	if (code !== 0) { console.log(code, err, out)}
	console.log("The configuration page is available on \nhttp://" + out.trim() + ":" + port.toString() + "\nwith another pc on same network");
});

let all = {
	frontUrl: "http://localhost:" + port,
	socketUrl: process.env.NODE_ENV === "production" ? "http://remaii.tk" : "http://192.168.0.18:4000",
	deviceId: deviceId
};

module.exports = all;