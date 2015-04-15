//还是考虑用官方的api吧，monk功能还是太弱了

var config = require('../host-config.js');
var mongodb = require('mongodb');
var db;

(function() {
	var host = (config.db && config.db.host) || 'localhost';
	var port = (config.db && config.db.port) || 27017;
	var name = (config.db && config.db.name) || 'mpr';
	var url = 'mongodb://' + host + ':' + port + '/' + name;

	var MongoClient = mongodb.MongoClient;
	MongoClient.connect(url, function(err, Db) {
		db = Db;
	});
})();

function Model(collectionName) {
	this.db = db;
	this.collection = db.collection(collectionName);
}

Model.prototype.insert = function(data, callback) {
	if (data && data.length) {
		this.collection.insertMany(data, function(err, doc) {
			callback(err, doc);
		});
		return;
	}
	this.collection.insertOne(data, function(err, doc) {
		callback(err, doc);
	});
}
Model.prototype.find = function(data, callback) {
	this.collection.find(data).toArray(function(err, docs) {
		callback(err, docs);
	});
}
Model.prototype.findOne = function(data, callback) {
	this.collection.findOne(data, function(err, doc) {
		callback(err, doc);
	});
}
Model.prototype.update = function(query, setVal, callback) {
	this.collection.update(query, setVal, function(err, doc) {
		callback(err, doc);
	});
}
Model.prototype.remove = function(data, callback) {
	this.collection.remove(data, function(err, doc) {
		callback(err, doc);
	})
}
Model.prototype.close = function() {
	this.db.close();
}

module.exports = Model;