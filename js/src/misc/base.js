

var twoPi = Math.PI * 2;
var formatInt = d3.format('f0');
var formatPercent = d3.format('.00%');
var DEFAULT_DURATION = 750;
var DEFAULT_EASE = 'cubic-in-out';

function toCssStyle(style) {
	if (typeof style === 'object') {
		for ( var key in style) {
			if (style.hasOwnProperty(key)) {
				var newKey = toCssStyle(key);
				if (newKey !== key) {
					style[newKey] = style[key];
					style[key] = null;
					delete style[key];
				}
			}
		}
		return style;
	} else {
		return style ? style.replace(/([A-Z])/g, function(m, s) {
			return '-' + s.toLowerCase();
		}) : style;
	}
}

function adaptSize(sizeOpt, refSize) {
	var type = typeof sizeOpt;
	if (type === 'string' && sizeOpt.indexOf('%') >= 0) {
		return parseInt(sizeOpt) * refSize / 100;
	}
	return sizeOpt;
}
