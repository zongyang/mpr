var Model = require('./model.js');
var util = require('util');

function Mall() {
	Model.call(this, 'mall');
	//子类定义的非原型属性放在这个后面，不然会被覆盖

}
util.inherits(Mall, Model);
//子类定义的原型属性放在这个后面，不然会被覆盖
Mall.prototype.insertUnique = function(data, callback) {
	var that=this;
	that.find({
		name: data.name
	}, function(err, docs) {
		if (docs.length > 0) {
			callback('该商场已存在！');
			return;
		}
		that.insert(data, function(err, doc) {
			callback(err, doc);
		})
	});
}

module.exports = Mall;