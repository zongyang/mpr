var Model = require('./model.js');
var util = require('util');

function Shop(mallId) {
	Model.call(this, 'shop');
	//子类定义的非原型属性放在这个后面，不然会被覆盖

}
util.inherits(Shop, Model);
//子类定义的原型属性放在这个后面，不然会被覆盖

Shop.prototype.insertUnique = function(data, callback) {
	var that = this;
	that.find({
		name: data.name,
		mallId:data.mallId
	}, function(err, docs) {
		if (docs.length > 0) {
			callback('该商店已存在！');
			return;
		}
		that.insert(data, function(err, doc) {
			callback(err, doc);
		})
	});
}


module.exports = Shop;