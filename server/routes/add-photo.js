var express = require('express');
var multer = require('multer');
var router = express.Router();
var path = require('path');
/* GET users listing. */
router.post('/', function(req, res, next) {
	res.send('hello with a resource');
});

router.use('/uploads', multer({
	dest: 'base_images',
	rename: function(fieldname, filename) {
		return filename;
	},
	changeDest: function(dest, req, res) {
		return 
	},
	limits: {
		files: 20,
		fileSize: 10 * 1024 * 1024 //10MB
	},
	onFileUploadComplete: function(file, req, res) {
		console.log('complete:' + file.name);
		res.send('complete:' + file.name);
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
		res.send(error);
	}
}));



module.exports = router;