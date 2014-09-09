var DefaultTextOpts = {
	data:'',  
	textAnchor:'',
	format:'', // This is a format pattern or a function
	font:'', // Font css styles
	border:'', // Border css styles or svg stroke styles
	color:'', // Color css styles or svg fill styles
	rotate:{
		degree:'',
		mode:''
	}
};

var Text = extendClass('Text', null, Element, {
	_fRender:function(_d3Sel) {
		var opts = this.options
		,textUpdate = _d3Sel.selectAll(toClassKey(this.__className)).data(toArray(opts.data));
		
		textUpdate.exit().remove();
		textUpdate.enter().append('text').attr('class', this.__className);
		
		textUpdate
		.text(function(d, i){
			return format(d, opts.format);
		})
		.call(setBounds, opts)
		.style(adaptFontStyle(opts.font))
		.style(adaptBorderStyle(opts.border))
		.style(adaptFillStyle(opts.color))
		.style(adaptCssStyle('text-anchor', opts.textAnchor))
		.call(rotate, opts.rotate);
	},
});

