//还是考虑用官方的api吧，monk功能还是太弱了

var config = require('../host-config.js');
var mongojs = require('mongojs');
var db;

(function() {
	var host = (config.db && config.db.host) || 'localhost';
	var port = (config.db && config.db.port) || 27017;
	var name = (config.db && config.db.name) || 'mpr';
	var url = 'mongodb://' + host + ':' + port + '/' + name;

	
	db = mongojs(url);

	/*var MongoClient = mongodb.MongoClient;
	MongoClient.connect(url, function(err, Db) {
		db = Db;
	});*/
})();

function Model(collectionName) {
	this.db = db;
	this.collection = db.collection(collectionName);
}

['insert','find', 'findOne','remove'].forEach(function(method){
	Model.prototype[method] = function(){
		this.collection[method].apply(this.collection, arguments);
	}
})

Model.prototype.update = function(query, setVal, callback) {
	this.collection.update(query, setVal, function(err, doc) {
		callback(err, doc);
	});
}
Model.prototype.close = function() {
	this.db.close();
}

module.exports = Model;
