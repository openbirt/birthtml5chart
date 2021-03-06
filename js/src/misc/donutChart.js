/**
 * A donut chart based on d3js
 * @author: Heng Li(Henry)
 */

var donutChartDefaultOptions = {
	width: 600,
	height: 600,
	duration: 250,
	series:[{
		name: null,
		background:'#ddd',
		backgroundOpacity: 1,
		innerRadius:'30%',
		outerRadius:'60%',
		colors:d3.scale.category20().range(),
		data:[30, 50, 60, 20],
		maxValue:200,
		categories:['China', 'USA', 'Japan', 'UK'],
		label: {
			enabled: true,
			format: function(context){
				return function(d) {
					return d.category + ',' + aCharts.format.formatPercent(d.percentValue);
				}
			},
			fill:'#0f0',
			font: {
				  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
				  'font-size': '24px',
				  'font-weight': 'bold',
			}
		},
		animation: {
			enabled: true,
			duration: 500,
			ease:'cubic-in-out'
		},
		sliceStyle: {
			stroke: '',
			strokeWidth: '',
			strokeOpacity: '',
			fill:'',
			fillOpacity:''
		}
	},
	{
		name: null,
		background:'#ddd',
		innerRadius:'70%',
		outerRadius:'90%',
		colors:d3.scale.category20c().range(),
		data:[70, 90, 160, 200],
		categories:['Shanghai', 'Beijin', 'Hangzhou', 'Nanjing'],
		label: {
			enabled:false,
			format: function(context){
				return function(d) {
					return d.category + ',' + aCharts.format.formatPercent(d.percentValue);
				}
			},
			fill:'#0f0',
			font: {
				  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
				  'font-size': '24px',
				  'font-weight': 'bold',
			}
		}
	}],
	categories:[],
	text: {
		enabled:true,
		background:'',
		fill: '#f00',
		font: {
		  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
		  'font-size': '24px',
		  'font-weight': 'bold',
		},
		format: function(context, data) {
			return function(_data) {
				var d = data || _data;
				return aCharts.format.formatInt(d.value * (d.currAngle - d.startAngle ) / (d.endAngle - d.startAngle));
			}
		}
	},
	animation: {
		enabled: true,
		duration: 500,
		ease:'linear'
	},
	on: {
		end:null
	}
}


function DonutChart() {
	return this.init.apply(this, arguments);
}

DonutChart.prototype = {
	svg:null,
    init:function(options) {
    	this.opts = options;
    	this.svg = null;
    	return this;
    },
    render:function(container) {
		var donutPlot, text, opts = this.opts;
		
		// Init width and height
		if(opts.width === undefined) {
			opts.width = $(container).width();
		}
		if (opts.height === undefined) {
			opts.height = $(container).height();
		}
		
		this.svg = d3.select(container).append('svg');
		donutPlot = this.svg.attr('width', opts.width)
			.attr('height', opts.height)
			.append('g').attr('class', 'chartArea').attr('transform', 'translate(' + opts.width / 2 + ',' + opts.height / 2 + ')');
		donutPlot = donutPlot.append('g').attr('class', 'donutPlot');
		
		// Create central text.
		if (opts.text && opts.text.enabled) {
			text = donutPlot.append("text")
	   	 		.attr("text-anchor", "middle")
	   	 		.attr("dy", ".35em")
	   	 		.style('fill', opts.text.fill)
	   	 		.style(opts.text.font);
		}
		
		var context = {};
		context.transitionCount = 0;
		context._this = this;
		context.opts = opts;
		context.seriesIndex = 0;
		context.donutPlot = donutPlot;
		context.text = text;
		this.onRenderSeries(context);
		return this;
    },
    onRenderSeries: function(context) {
		context.seriesCallback = this.renderSeries;
		//context.duration = 1000;
		this.renderSeries(context);
	},
	renderSeries: function(context) {
		var
		arc, 
		seriesIndex = context.seriesIndex,
		seriesOpts = context.opts.series[seriesIndex],
		donutPlot = context.donutPlot,
		donutSeries = donutPlot.append('g').attr('class', 'series donutSeries ' + (seriesOpts.name || seriesIndex)),
		total = seriesOpts.maxValue ? seriesOpts.maxValue : d3.max([this.getTotal(seriesOpts.data), (seriesOpts.maxValue || 0)]),
		lastAngle = 0, 
		min = d3.min([context.opts.width, context.opts.height]),
		data,
		i, 
		j;
		
		donutSeries.datum(seriesOpts);
		
		// Convert percent radius to absolute radius.
		if (seriesOpts.innerRadius && typeof seriesOpts.innerRadius === 'string' && seriesOpts.innerRadius.indexOf('%') >= 0) {
			seriesOpts.innerRadius = min * parseFloat(seriesOpts.innerRadius) / 200;
		}
		if (!seriesOpts.outerRadius) {
			seriesOpts.outerRadius = min / 2;	
		} else if (seriesOpts.outerRadius && typeof seriesOpts.outerRadius === 'string' && seriesOpts.outerRadius.indexOf('%') >= 0) {
			seriesOpts.outerRadius = min * parseFloat(seriesOpts.outerRadius) / 200;
		}
		seriesOpts.animation = $.extend({}, context.opts.animation || {}, seriesOpts.animation || {});
		
		// Generate each data of series.
		for(j= 0; j <seriesOpts.data.length; j++) {
			data = {};
			data.value = seriesOpts.data[j];
			data.percentValue = seriesOpts.data[j] / total;
			data.startAngle = lastAngle;
			data.endAngle = lastAngle + data.percentValue * twoPi;
			data.category = (seriesOpts.categories && seriesOpts.categories[j])  || (opts.categories && opts.categories[j]);
			data.style = $.extend({}, toCssStyle(seriesOpts.sliceStyle));
			data.style.fill = data.style.fill || (seriesOpts.colors || d3.scale.category20())[j % 20];
			lastAngle = data.endAngle;
			
			seriesOpts.data[j] = data;
		}
		
		// Render donut series background.
		arc = d3.svg.arc()
	    .startAngle(0)
	    .innerRadius(seriesOpts.innerRadius)
	    .outerRadius(seriesOpts.outerRadius);
		
		donutSeries.append("path")
	    .attr("class", "background")
	    .attr("d", arc.endAngle(twoPi));

		if (seriesOpts.background) {
			donutSeries.style('fill', seriesOpts.background);
		}
		if (seriesOpts.backgroundOpacity) {
			donutSeries.style('fill-opacity', seriesOpts.backgroundOpacity);
		}
		
		context.donutSeries = donutSeries;
		this.onRenderSlice(context);
	},
	onRenderSlice:function(context) {
		// Append and render each slice.
		context.seriesData =  context.opts.series[context.seriesIndex].data.concat([]);
		context.sliceIndex = 0;
		context.sliceCallback = this.sliceCallback;
		this.renderSlice(context);
	},
	renderSlice : function(context) {
		var 
		_this = this;
		sliceIndex = context.sliceIndex,
		seriesData = context.seriesData,
		data = context.seriesData[sliceIndex],
		seriesOpts = context.opts.series[context.seriesIndex],
		animation = seriesOpts.animation,
		donutSeries = context.donutSeries,
		text = context.text,
		arc = d3.svg.arc()
	    .startAngle(data.startAngle)
	    .endAngle(data.startAngle)
	    .innerRadius(seriesOpts.innerRadius)
	    .outerRadius(seriesOpts.outerRadius);
		
		context.arc = arc;
		donutSeries.append('path')
		.datum(data)
		.attr('class', 'slice ' + sliceIndex )
		.style(data.style)
		.attr('d', arc)
		.transition()
		.ease(animation.enabled ? (animation.ease || DEFAULT_EASE) : DEFAULT_EASE)
		.duration(animation.enabled ? (animation.duration || DEFAULT_DURATION) : 0)
		.call(this.arcTween, context)
		.each('start', function(){
			context.transitionCount++;
		})
		.each('end', function(d){
			var t;
			if (seriesOpts.label && seriesOpts.label.enabled) {
				t = donutSeries.append("text")
			  	.attr('class', 'sliceLabel ' + sliceIndex)
			  	.datum(data)
		      	.attr("dy", ".35em")
		      	.style("text-anchor", "middle")
		      	.style('fill', seriesOpts.label.fill)
	   	 	  	.style(seriesOpts.label.font)
			  	.text(seriesOpts.label.format(context))
		      	.attr('transform', 'translate(0, 0)')
		      	.transition()
		      	.ease(animation.enabled ? (animation.ease || DEFAULT_EASE) : DEFAULT_EASE)
		      	.duration(animation.enabled ? (animation.duration || DEFAULT_DURATION) : 0)
		      	.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		      	.each('start', function(){
		      		context.transitionCount++;
		      	})
		      	.each('end', function(){
		      		if( --context.transitionCount === 0 && context.opts.on && context.opts.on.end) {
						context.opts.on.end.call(context._this, context);
			        }
		      	});
			}
			
			if( --context.transitionCount === 0 && context.opts.on && context.opts.on.end) {
				context.opts.on.end.call(context._this, context);
	        }
			
			context.sliceCallback.call(_this, context);
			
		})
	},
	sliceCallback : function(context) {
		var 
		sliceIndex = context.sliceIndex,
		seriesIndex = context.seriesIndex,
		seriesOpts = context.opts.series[seriesIndex];
		
		if ((sliceIndex + 1 ) < seriesOpts.data.length) {
			context.sliceIndex++;
			this.renderSlice(context);
		} else if((context.seriesIndex + 1) < context.opts.series.length) {
			context.seriesIndex++;
			context.seriesCallback.call(this, context);
		} 
	},
	arcTween : function(transition, context) {
		var arc = context.arc, text = context.text;
		transition.attrTween('d', function(d){
			var interpolate = d3.interpolate(d.startAngle, d.endAngle);
			return function(t) {
				var angle = interpolate(t);
				if (text) {
					var t = $.extend({}, d);
					t.currAngle = angle;
					text.datum(t);
					text.text(context.opts.text.format(context, t));
				}
				arc.endAngle(angle)
				return arc();
			}
		});
	},
	getTotal : function(data) {
		var t = 0;
		for(var i =0; i < data.length; i++) {
			t += data[i];
		}
		return t;
	}
}
