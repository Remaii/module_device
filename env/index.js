'use strict';

const exec = require('execa');
const jsonfile = require('jsonfile');
const pathConf = __dirname + "/device.config";
const port = process.env.PORT || 3000;

let deviceConf = { deviceId: "", maj_auto: false };

try {
	deviceConf = jsonfile.readFileSync(pathConf);
} catch (e) {
	deviceConf = (() => { jsonfile.writeFile(pathConf, { deviceId:"", maj_auto:false }); return { deviceId:"", maj_auto:false };	})();
}

let all = {
	frontUrl: "http://" + exec.shellSync("ifconfig | grep 'inet 192' | cut -d: -f2 | awk '{ print $2  }'").stdout + ":" + port,
	socketUrl: "https://api.remaii.tk",
	maj_auto: deviceConf.maj_auto,
	device: deviceConf,
	deviceId: deviceConf.deviceId,
};

module.exports = all;