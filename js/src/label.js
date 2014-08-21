/**
 * Merge options from text.
 */
var DefaultLabelOpts = {
	value : '',
	format : '',
	font : {
		name : '',
		size : '',
		color : ''
	},
	rotate : '',
	rotateMode : '',
	outline: {
		style:'',
		color:'',
		width:''
			
	},
	style : null

}
/**
 * New node file
 */
var Label = function(opts) {
	this.opts = opts;

	return this;
}

Label.prototype = {
	render: function(sel) {

	}
}
