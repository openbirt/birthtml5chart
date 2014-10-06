var DefaultOptions = {
	global: {
		lang: {},
		format: {}
	},
	chart: {
		x:0,
		y:0,
		width:0,
		height:0

	},
	title: {

	},
	plot: {
		series: {
			default: {},
			bar: {},
			line: {} // ....
		}
	},
	series: [{

	}],
	legend: {

	},
	xAxes: [{

	}],
	yAxes: [{

	}],
	labels: [{}]

}

var Chart = extendClass('Chart', null, Element, {
	svgSel: null,
	defsSel: null,
	chartLayers: [], // Arrays of svg group as a graphic layer, chart will be rendered in it, different chart may be rendered in different layers.
	frontLayers: [], // Meaning is same with chart layer, but rendering other things in front of chart layers.
	backLayers: [], // Meaning is same with chart layer, but rendering other things in back of chart layers.
	title: null, // 
	xAxis: null,
	yAxis: null,
	plot: null,
	series: null,
	legend: null,
	_fRender: function(_d3Sel) {
		var opts = this.options,
			classNames = this.fClassNames();

			// Create svg node and init svg definitions.
			if (this.fInitSvgPart(_d3Sel)) {
				this.svgSel.attr('class', classNames);
				this.fInitDefinitionPart(this.svgSel);
			}



	},
	fRenderSvgPart: function(_d3Sel) {
		if (!this.svgSel) {
			this.svgSel = _d3Sel.append('svg');
		}
		return this.svgSel;
	},
	fInitDefinitionPart: function(_svgSel) {
		this.context.fSvgSel(_svgSel);
		this.defsSel = this.context.fDefs();
		return this.defsSel;
	},
	fRenderChartLayers: function(chartLayers, context) {
		var chartGSel = this.svgSel.append('g').attr('id', 'chartlayer0').attr('class', 'chartlayer0');
		if (chartGSel) {
			chartLayers.push(chartGSel);
		}

		// Render chart margin/border/background
		
		// Render title part
		// Render legend part
		// Render exPlot part
		// Render axes part
		// Render plot part
		// Render series part

	},
	fRenderFrontLayers: function(context) {

	},
	fRenderBacklayers: function(context) {

	}
});