'use strict';

let port = process.env.PORT || 3000;
// let deviceId = "dvs_kqq4c7t889041";
let exec = require('execa');

let all = {
	frontUrl: "http://" + exec.shellSync("ifconfig | grep 'inet 192' | cut -d: -f2 | awk '{ print $2  }'").stdout + ":" + port,
	socketUrl: "https://api.remaii.tk",
	deviceId: exec.shellSync('cat ' + __dirname + '/device.conf').stdout,
};

module.exports = all;