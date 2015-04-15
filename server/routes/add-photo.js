var express = require('express');
var multer = require('multer');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var getter = require("pixel-getter");
var Photo = require('../model/photo.js');


//test
router.get('/', function(req, res, next) {
	getter.get("base_images/1428895909436.jpg", function(err, pixels) {
		res.send(pixels);
	})

});



router.post('/', function(req, res, next) {
	res.send('this is in add-photo');
});

router.post('/uploads', multer({
	dest: 'base_images',
	putSingleFilesInArray: true,
	rename: function(fieldname, filename) {
		return Date.now();
	},
	changeDest: function(dest, req, res) {
		var obj = req.body;
		//dest = path.join(dest, obj.mall);
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}
		return dest;
	},
	limits: {
		files: 10,
		fileSize: 10 * 1024 * 1024 //10MB
	},
	onFileUploadComplete: function(file, req, res) {
		var photo = new Photo();
		var data = {
			dir: this.dest,
			name: file.name,
			features: []
		};
		//插入数据库记录
		photo.insert(data, function(err, doc) {});
		photo.find({}, function() {

		})
	},
	onFilesLimit: function() {
		console.log('files limits');
		res.send('files limits');
	},
	onFileSizeLimit: function(file) {
		console.log('file size limits');
		res.send('file size limits');
	},
	onError: function(error, next) {
		console.log(error);
		next(error);
	},
	onParseEnd: function(req, next) {
		next();
	}
}));

router.post('/uploads', function(req, res, next) {
	res.send('complete');
});

module.exports = router;