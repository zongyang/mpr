var Model = require('./model.js');
var util = require('util');

function Photo(shopId, address) {
	/*this.mall = mall;
	this.shop = shop;
	this.address = address;
	Model.call(this, 'photo');*/
	//子类定义的非原型属性放在这个后面，不然会被覆盖

}
util.inherits(Photo, Model);
//子类定义的原型属性放在这个后面，不然会被覆盖


module.exports = Photo;