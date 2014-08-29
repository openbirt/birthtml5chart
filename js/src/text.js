var DefaultTextOpts = {
	data:'',  
	format:'',
	font:'',
	color:'',
	rotate:'',
	rotateMode:''
};

var Text = extendClass('Text', null, Element, {
	_fRender:function(_d3Sel) {
		var texts = _d3Sel.selectAll(this.__classKey).data(toArray(this.options.data));
		
	},
});

function D3Data() {
	
}

Text.prototype = {
	render : function(sel) {
		this.sel = sel;
		this.redraw();
	},
	redraw: function() {
		var all = this.sel.selectAll(this.__classAttr).data([this.opts]),
		enterText = all.enter().append('svg:text');
		
		all.exit().remove();
		all.update().style()
	}
}