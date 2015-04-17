var ffi = require('ffi')

var libm = ffi.Library('libm', {
	'ceil': ['double', ['double']]
});

//获得特征
libm.getFeatures = function(rgb) {
	return new Array(400);
}
//特征比较
libm.compare = function(feature1, feature2) {
	return 1;
}

module.exports = libm;