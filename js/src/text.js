var DefaultTextOpts = {
	enabled: true,
	id : '', // Here the id is same with class name with Dom element.
	x:0,
	y:0,
	data:'',  
	format:'', // This is a format pattern or a function
	font:'', // Font css styles
	border:'', // Border css styles or svg stroke styles
	color:'', // Color css styles or svg fill styles
	rotate:{
		degree:'',
		mode:''
	},
	align:'', // 'left', 'center', 'right', 'auto' == 'left'
	verticalAlign:'' // 'top', 'center', 'bottom', 'auto' == 'top'
};

var Text = extendClass('Text', null, Element, {
	_fRender:function(_d3Sel) {
		var opts = this.options,
		classNames = this.fClassNames(),
		textUpdate = _d3Sel.selectAll(toClassKey(classNames)).data(toArray(opts.data));
		
		if (opts.enabled === false) {
			textUpdate.remove();
			return;
		}

		textUpdate.exit().remove();
		textUpdate.enter().append('text').attr('class', classNames);
		
		textUpdate
		.each(function(d, i){
			var _this = d3.select(this), texts = d.split('\n');
			if (texts.length <= 1) {
				_this.text(function(d, i){
					return format(d, opts.format);
				});
			} else {
				for(var k in texts) {
					_this.append('tspan').text(function() {
						return format(texts[k], opts.format);
					})
					.attr('x', opts.x || 0)
					.attr('dy', (k * 1) + 'em');
				}
			}
		})
		.style(adaptFontStyle(opts.font))
		.style(adaptBorderStyle(opts.border))
		.style(adaptFillStyle(opts.color))
		.call(function(d3sel, options) {
			// adjust dy with vertical align
			var h = d3sel.bbox().height;
			var offset = (!options.verticalAlign || options.verticalAlign === 'top') ? h : (options.verticalAlign === 'center' ? h /2 : 0);
			if (typeof options.y === 'function') {
				var yFunc = options.y;
				options.y = function(){
					return yFunc.apply(this, arguments) + offset;
				};
			} else {
				options.y = (options.y || 0 ) + offset;
			}
			d3sel.call(setBounds, options);
		 }, opts)
		.style('text-anchor', text_adaptTextAnchor(opts.align))
		.call(rotate, opts.rotate);
	}
});

function text_adaptTextAnchor(align) {
	return align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start');
}


