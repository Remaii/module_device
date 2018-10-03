'use strict';

let fs = require('fs');
let port = process.env.PORT || 3000;
let deviceId = "dvs_kqq4c7t889041";

let all = {
	frontUrl: "http://localhost:" + port,
	socketUrl: "http://192.168.0.18:4000",
	deviceId: deviceId
};

module.exports = all;