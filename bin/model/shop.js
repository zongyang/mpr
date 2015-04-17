var Model = require('./model.js');
var util = require('util');

function Shop(mallId) {
	Model.call(this, 'shop');
	//子类定义的非原型属性放在这个后面，不然会被覆盖

}
util.inherits(Shop, Model);
//子类定义的原型属性放在这个后面，不然会被覆盖

//有mall的ID才能插入
Shop.prototype.insert=function(mallId,data,callback){

}


module.exports = Shop;