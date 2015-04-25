var getPixels = require("get-pixels");

module.exports = {
	isNull: function() {
		var len = arguments.length;
		var str;
		for (var i = 0; i < len; i++) {
			str = arguments[i];

			if (str === null)
				return true;
			if (str.trim() === '')
				return true;

		}

		return false

	},
	//获得图片的rgb值
	getRgba: function(url, callback, alpha) {
		getPixels(url, function(err, pixels) {
			if (err) {
				callback(err);
				return;
			}
			var r = [];
			var g = [];
			var b = [];
			var a = [];
			var result = [];

			for (var i = 0; i < pixels.data.length; i = i + 4) {
				r.push(pixels.data[i]);
				g.push(pixels.data[i + 1]);
				b.push(pixels.data[i + 2]);
				a.push(pixels.data[i + 3]);
			}

			if (alpha)
				result.push(r, g, b, a);
			else
				result.push(r, g, b);

			callback(err, result);
		})
	},
	//获得与图片最相近的三个结果
	getSimilarities: function(data, mall) {
		mall = (!mall) ? mall : '正佳';
		return [{
			url: 'base_images/1429163885276.jpg',
			name: '兰记',
			address: '在杨晓贤旁边'
		}, {
			url: 'base_images/1429163885276.jpg',
			name: '臭豆腐',
			address: '在兰记旁边'
		}, {
			url: 'base_images/1429163885276.jpg',
			name: '猪脚饭',
			address: '在臭豆腐旁边'
		}];
	}
}