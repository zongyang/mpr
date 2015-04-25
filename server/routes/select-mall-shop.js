var express = require('express');
var multer = require('multer');
var router = express.Router();
var Mall = require('../model/mall.js');
var Shop = require('../model/shop.js');
var serverUtil = require('../server-util');

//查询商场
router.get('/query-mall/:query', function(req, res, next) {
	var mall = new Mall();
	var reg = new RegExp(req.param('query'));
	var query = {
		name: reg
	};
	mall.find(query, function(err, docs) {
		var results = [];
		for (var i = 0; i < docs.length; i++) {
			results.push({
				title: docs[i].name,
				description: docs[i].address,
				id: docs[i]._id
			});
		}
		res.send({
			success: true,
			results: results
		});
	});
});
//查询店铺
router.get('/query-shop/:mallId/:name', function(req, res, next) {
	var shop = new Shop();
	var reg = new RegExp(req.param('name'));
	var query = {
		name: reg,
		mallId: req.param('mallId')

	};
	shop.find(query, function(err, docs) {
		var results = [];
		for (var i = 0; i < docs.length; i++) {
			results.push({
				title: docs[i].name,
				description: docs[i].address,
				id: docs[i]._id
			});
		}
		res.send({
			success: true,
			results: results
		});
	});
});

//添加商场
router.get('/add-mall', function(req, res) {
	var name = req.query.name;
	var address = req.query.address;
	if (serverUtil.isNull(name, address)) {
		res.send({
			success: false,
			info: '商场名和地址不能为空！'
		})
		return;
	}
	(new Mall).insertUnique({
			name: name,
			address: address
		},
		function(err, doc) {
			if (err) {
				res.send({
					success: false,
					info: err
				})
				return;
			}
			res.send({
				success: true,
				id: doc._id

			})

		})
});

//添加商店
router.get('/add-shop', function(req, res) {
	var name = req.query.name;
	var address = req.query.address;
	var mallId = req.query.mallId;
	if (serverUtil.isNull(name, address, mallId)) {
		res.send({
			success: false,
			info: '店铺名、店铺地址不能为空或者没有选择商场！'
		})
		return;
	}
	(new Mall).insertUnique({
			name: name,
			address: address
		},
		function(err, doc) {
			if (err) {
				res.send({
					success: false,
					info: err
				})
				return;
			}
			res.send({
				success: true,
				id: doc._id

			})

		})
});


module.exports = router;