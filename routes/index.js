var express = require('express');
var router = express.Router();
var socket = require('../socket');
var config = require('../env');

const pageData = {
	title: 'Domotique',
	texte: "This device works with remaii.tk website," +
	"to use and configure this device you need to register on website",
	link: "https://remaii.tk",
	deviceId: config.deviceId || null
};

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', pageData);
});

router.post('/', function(req, res) {
	if (req.body.deviceId) {
		pageData.deviceId = req.body.deviceId;
	} else {
		pageData.deviceId = null;
	}
	return res.render('index', pageData);
});

module.exports = router;
