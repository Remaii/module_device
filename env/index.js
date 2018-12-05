'use strict';

const exec = require('execa');
const jsonfile = require('jsonfile');
const pathConf = __dirname + "/device.config";
const port = process.env.PORT || 3000;

let deviceConf = "";

try {
	deviceConf = jsonfile.readFileSync(pathConf);
} catch (e) {
	deviceConf = (() => { jsonfile.writeFile(pathConf, { deviceId:"" }); return { deviceId:"" };	})();
}

let all = {
	frontUrl: "http://" + exec.shellSync("ifconfig | grep 'inet 192' | cut -d: -f2 | awk '{ print $2  }'").stdout + ":" + port,
	socketUrl: "https://api.remaii.tk",
	device: deviceConf,
	deviceId: deviceConf.deviceId,
};

module.exports = all;