const express = require('express');
const router = express.Router();
const config = require('../env');
const jsonfile = require('jsonfile');
const pathConf =  __dirname + "/../env/device.config";
const gpio = require('../gpio');
const pageData = {
	title: 'Domotique',
	texte: "This device works with remaii.tk website," +
	"to use and configure this device you need to register on website",
	link: "https://remaii.tk",
	deviceId: config.deviceId
};

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', pageData);
});

router.get('/getData', function(req, res) {
	return res.send({ data : gpio.getData()});
});

router.post('/', function(req, res) {
	if (req.body.deviceId) {
		jsonfile.writeFile(pathConf, {
			deviceId: req.body.deviceId,
		}).then(() => {
			pageData.deviceId = req.body.deviceId;
		}).catch(err => console.log(err, 'err'));
	}
	return res.render('index', pageData);
});

module.exports = router;
