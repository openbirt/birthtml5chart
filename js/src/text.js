var DefaultTextOpts = {
	value:'',
	format:'',
	font:'',
	color:'',
	rotate:'',
	rotateMode:''
};

var Text = function(opts) {
	this.opts = opts;

	return this;
}

Text.prototype = {
	render : function(sel) {
		this.sel = sel;
		this.redraw();
	},
	redraw: function() {
		var all = this.sel.selectAll('.text').data([this.opts]),
		enterText = all.enter().append('svg:text');
		
		all.exit().remove();
		all.update().style()
	}
}