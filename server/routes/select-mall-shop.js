var express = require('express');
var multer = require('multer');
var router = express.Router();

router.use('/query-mall/:query', function(req, res, next) {
	var query = req.param('query');
	var obj = {
		"success": true,
		"results": [{
			"title": "222222",
			"description": "Used <b>791</b> times"
		}, {
			"title": "2222",
			"description": "Used <b>663</b> times"
		}, {
			"title": "22222222",
			"description": "Used <b>227</b> times"
		}, {
			"title": "22222",
			"description": "Used <b>197</b> times"
		}, {
			"title": "223344",
			"description": "Used <b>91</b> times"
		}, {
			"title": "2222222",
			"description": "Used <b>80</b> times"
		}, {
			"title": "222333",
			"description": "Used <b>68</b> times"
		}, {
			"title": "2233",
			"description": "Used <b>67</b> times"
		}, {
			"title": "2277",
			"description": "Used <b>60</b> times"
		}, {
			"title": "2211",
			"description": "Used <b>59</b> times"
		}]
	};
	res.send(obj);
});

module.exports = router;