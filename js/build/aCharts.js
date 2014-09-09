/**
 * New node file
 */
(function(){
	
;

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
;/**
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
;/**
 * A bar chart based on d3js
 * @author: Heng Li(Henry)
 */
	var barChartDefaultOptions = {
			mode: 'horizontal', // vertial or horizontal ,default is horizontal
			width:600,
			height:400,
			padding: {
				top:20,
				right:20,
				bottom:20,
				left:20
			},
			fillStyle:{
				fill: '#FFFFCC',
				fillOpacity:1,
				stroke:'black',
				strokeWidth:1,
				strokeOpacity:0.5
			},
			animation: {
				enabled: true,
				mode:'oneByOne', // 'oneByOne' or 'both'
				ease: null,
				duration: 1000
			},
			plot:{
				fill: '#FFFF99',
				fillOpacity:1,
				stroke:'red',
				strokeWidth:1,
				strokeOpacity:0.5
			},
			xAxis: {
				type:null,
				line:{
					fill:'none',
					stroke:'green',
					strokeWidth:1,
					strokeOpacity:0.5
				},
				tick:{
					number:10,
					fillStyle:{
						stroke:'green',
						strokeWidth:2,
						strokeOpacity:0.5
					}
				},
				label:{
					enabled:true,
					fillStyle:{
						fill:'',
					},
					fontStyle:{},
					format:null
				}
			},
			yAxis: {
				type:null,
				line:{
					stroke:'black',
					strokeWidth:1,
					strokeOpacity:0.5
				},
				tick:{
					number:10,
					fillStyle:{
						stroke:'black',
						strokeWidth:1,
						strokeOpacity:0.5
					}
				},
				label:{
					enabled:true,
					fillStyle:{
						fill:'',
					},
					fontStyle:{},
					format: null
				}
			},
			series:[{
				enabled:true,
				data:[100, 200, 150, 170],
				label:{
					enabled: true,
					fontStyle: {
						  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
						  'font-size': '24px',
						  'font-weight': 'bold',
					},
					animation: {
						enabled: true,
						mode:'oneByOne', // 'oneByOne' or 'both'
						ease: null,
						duration: 1000
					}
				},
				colors:d3.scale.category20().range(),
				fillStyle:{
					fill: '#CCCCCC',
					fillOpacity:1,
					stroke:'#999999',
					strokeWidth:2,
					strokeOpacity:0.5
				},
				width: '50%'
			},
			{
				enabled:true,
				data:[80, 100, 110, 90],
				label:{
					enabled: true,
					format: function(d, context){
						return d.value;
					},
					fontStyle: {
						  'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
						  'font-size': '24px',
						  'font-weight': 'bold',
					}
				},
				colors:d3.scale.category20().range(),

				width: '50%'
			}],
			categories:{
				type:null,
				data:['a', 'b', 'c', 'd']
			},
			on: {
				end: null
			}
	};

	function Bar() {
		return this.init.apply(this, arguments);
	}
	
	Bar.prototype = {
		opts:null,
		init:function(_opts) {
			this.opts = _opts;
		},
		render:function(container) {
			var i, j, opts = this.opts, context= {}, barChart, chartArea, remainedBox = {};
			
			context.barChart = this;
			context.opts = opts;
			context.remainedBox = remainedBox;
			context.isVertical = opts.mode === 'vertical';
			
			// Init width and height
			if(!opts.width) {
				opts.width = $(container).width();
			}
			if (!opts.height) {
				opts.height = $(container).height();
			}
			
			remainedBox.x = 0;
			remainedBox.y = 0;
			remainedBox.w = opts.width;
			remainedBox.h = opts.height;
			
			this.svg = d3.select(container).append('svg');
			barChart = this.svg.attr('width', opts.width)
				.attr('height', opts.height)
				.append('g').attr('class', 'chart barChart');
			
			chartArea = barChart.append('g')
			.attr('class', 'chartArea');
			if (opts.padding) {
				remainedBox.x += (opts.padding.left || 0);
				remainedBox.y += (opts.padding.top || 0);
				remainedBox.w -= ((opts.padding.left || 0) + (opts.padding.right || 0));
				remainedBox.h -= ((opts.padding.top || 0) + (opts.padding.bottom || 0));
			}
		
			// Adapt series options
			this.adaptSeries(context);
			this.adaptAxis(context);
			
			// Render yAxis
			var y = d3.scale.linear()
		    .range(context.isVertical ? [remainedBox.h, 0] : [0, remainedBox.w])
		    .domain([0, context.seriesValueExtent[1]]);

			var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient(context.isVertical ? 'left' : 'bottom')
		    .ticks(opts.yAxis.tick.number || 10);
			
			if (opts.yAxis.label.format) {
				yAxis.tickFormat(opts.yAxis.label.format);
			}
			
			var yAxisBlock = chartArea.append('g')
			.attr('class', 'yAxis')
			.attr('transform', 'translate(' + remainedBox.x + ',' + remainedBox.y + ')')
			.call(yAxis);
			yAxisBlock.selectAll('text').style(toCssStyle(opts.yAxis.label.fillStyle));
			yAxisBlock.select('path').style(toCssStyle(opts.yAxis.line));
			yAxisBlock.selectAll('line').style(toCssStyle(opts.yAxis.tick.fillStyle));
			
			var yAxisBBox = yAxisBlock.node().getBBox();
			
			// Render xAxis;
			var x = d3.scale.ordinal()
				    .rangeBands(context.isVertical ? [0, remainedBox.w] : [remainedBox.h, 0])
				    .domain(opts.categories.data);
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient(context.isVertical ? 'bottom': 'left');
			if (opts.xAxis.label.format) {
				xAxis.tickFormat(opts.xAxis.label.format);
			} 
			
			var xAxisBlock = chartArea.append('g')
			.attr('class', 'xAxis')
			.attr('transform', 'translate(0,' + (remainedBox.y + remainedBox.h) + ')')
			.call(xAxis);
			
			xAxisBlock.selectAll('text').style(toCssStyle(opts.xAxis.label.fillStyle));
			xAxisBlock.select('path').style(toCssStyle(opts.xAxis.line));
			xAxisBlock.selectAll('line').style(toCssStyle(opts.xAxis.tick.fillStyle));
			
			var xAxisBBox = xAxisBlock.node().getBBox();

			// Adjust size of y Axis according to xAxis
			
			var xTickBBox = xAxisBlock.select('.tick').node().getBBox()
				, yTickBBox = yAxisBlock.select('.tick').node().getBBox();
			if (context.isVertical) {
				x.rangeBands([0, remainedBox.w - yTickBBox.width]);
				xAxis.scale(x);
				xAxisBlock.attr('transform', 'translate(' + (remainedBox.x + yAxisBBox.width) + ', ' + (remainedBox.y + remainedBox.h - xAxisBBox.height)  + ')')
				.call(xAxis);
				
				y.range([remainedBox.h -  xTickBBox.height, 0]);
				yAxis.scale(y);
				yAxisBlock.attr('transform', 'translate(' + (remainedBox.x + yAxisBBox.width) + ',' + remainedBox.y + ')')
				.call(yAxis);
			}  else {
				y.range([0, remainedBox.w - xAxisBBox.width]);
				yAxis.scale(y);
				yAxisBlock.attr('transform', 'translate(' + (remainedBox.x + xAxisBBox.width) + ',' + (remainedBox.y + remainedBox.h - yAxisBBox.height) + ')')
				.call(yAxis);
				
				x.rangeBands([remainedBox.h -  yAxisBBox.height, 0]);
				xAxis.scale(x);
				xAxisBlock.attr('transform', 'translate(' + (remainedBox.x + xAxisBBox.width) + ', ' + remainedBox.y + ')')
				.call(xAxis);
			}
			
			if (context.isVertical) {
				context.remainedBox.x += yAxisBBox.width;
				context.remainedBox.w -= yAxisBBox.width;
				context.remainedBox.h -= xAxisBBox.height;
			} else {
				context.remainedBox.x += xAxisBBox.width;
				context.remainedBox.w -= xAxisBBox.width;
				context.remainedBox.h -= yAxisBBox.height;
			}
			
			// Render plot
			chartPlot = chartArea.append('g')
			.attr('class', 'plot')
			.style(toCssStyle(opts.plot.fillStyle))
			.attr('transform', 'translate(' + remainedBox.x + ',' + remainedBox.y + ')');
			
			// Render series
			context.transitionCount = 0;
			context.x = x;
			context.y = y;
			context.xAxis = xAxis;
			context.yAxis = yAxis;
			context.barChart = barChart;
			context.chartArea = chartArea;
			context.chartPlot = chartPlot;
			context.xAxisBlock = xAxisBlock;
			context.yAxisBlock = yAxisBlock;
			context.renderSeriesCallback = this.renderSeries;
			context._this = this;
			
			this.onRenderSeries(context);
		},
		onRenderSeries: function(context) {
			var opts = context.opts;
			if (opts.animation.mode === 'oneByOne') {
				series = opts.series[0];
				context.seriesIndex = 0;
				context.renderSeriesCallback.call(context._this, series, context);
			} else {
				for(var i = 0; i < opts.series.length; i++) {
					series = opts.series[i];
					context.seriesIndex = i;
					context.renderSeriesCallback.call(context._this, series, context);
				}
			}
		},
		renderSeries: function(series, context) {
			var x = context.x, y = context.y, remainedBox = context.remainedBox, seriesBlock, barsBlock, barBlock, labelBlock, xRangeBand = context.x.rangeBand(), xDelta;
			
			if (series.enabled === false) {
				return;
			}
			
			xDelta = adaptSize((series.width || xRangeBand), xRangeBand);
			
			seriesBlock = chartPlot.append('g').attr('class', 'series ' + context.seriesIndex);
			
			barsBlock = seriesBlock.selectAll('.bar')
			.data(series.data)
			.enter();
			
			barBlock = barsBlock.append('rect')
			.attr('class', 'bar')
			.each(function(d) {
				d3.select(this).style(toCssStyle(d.fillStyle));
			})
			.attr("x", function(d) { return context.isVertical ? x(d.category)  + (xRangeBand - xDelta) / 2: 0; })
		    .attr("width", context.isVertical ? adaptSize((series.width || xRangeBand), xRangeBand) : 0)
		    .attr("y", context.isVertical ? remainedBox.h : function(d) {return x(d.category) + (xRangeBand - xDelta) / 2; })
		    .attr("height", context.isVertical ? 0 : xDelta)
			.transition()
			.duration((series.animation.enabled!== false) ? (series.animation.duration || DEFAULT_DURATION) : DEFAULT_DURATION)
			.ease((series.animation.enabled!== false) ? (series.animation.ease || DEFAULT_EASE) : DEFAULT_EASE)
			.attr("y", context.isVertical ? function(d) { return y(d.value); } : function(d) {return x(d.category) + (xRangeBand - xDelta) / 2;})
			.attr("width", context.isVertical ? adaptSize((series.width || xRangeBand), xRangeBand) : function(d) { return y(d.value); })
			.attr("height", context.isVertical ? function(d) { return remainedBox.h - y(d.value); } : xDelta)
			.each('start', function() {context.transitionCount++;})
			.each('end', function(d, i){
				if ((i + 1) <= series.data.length 
						&& context.opts.animation.enabled !== false 
						&& context.opts.animation.mode === 'oneByOne') {
					// Render next series.
					context.seriesIndex++;
					if (context.seriesIndex < context.opts.series.length) {
						context.renderSeriesCallback.call(context._this, context.opts.series[context.seriesIndex], context);
					}
				}
				
				if( --context.transitionCount === 0 && context.opts.on && context.opts.on.end) {
					context.opts.on.end.call(context._this, context);
		        }
			});
			
			if (series.label.enabled === false) {
				return;
			}
			
			labelBlock = barsBlock.append('text')
			.attr('class', 'label')
			.text(function(d){
				return d.label.format !== false ? (d.label.format ? d.label.format.call(this, d, context) : d.value): '';})
			.each(function(d){
				var label = d3.select(this);
				label.style(toCssStyle(d.label.fillStyle))
				.style(toCssStyle(d.label.fontStyle))
				.attr('text-anchor', d.label.align)
				.attr("x", context.isVertical ? x(d.category)  + xRangeBand / 2: 0)
				.attr("y", context.isVertical ? context.remainedBox.h :  x(d.category) + xRangeBand /2)
				.transition()
				.duration((d.label.animation.enabled!== false) ? (d.label.animation.duration || DEFAULT_DURATION) : DEFAULT_DURATION)
				.ease((d.label.animation.enabled!== false) ? (d.label.animation.ease || DEFAULT_EASE) : DEFAULT_EASE)
				.attr("x", context.isVertical ? x(d.category)  + xRangeBand / 2: y(d.value))
				.attr("y", context.isVertical ? y(d.value): x(d.category) + xRangeBand /2)
				.attr('dy', context.isVertical ? '0em' : '.5em')
				.each('start', function(){
					context.transitionCount++;
				})
				.each('end', function(){
					
					if( --context.transitionCount === 0 && context.opts.on && context.opts.on.end) {
						context.opts.on.end.call(context._this, context);
			        }
				});
			});
			
		},
		adaptAxis: function(context) {
			var opts = context.opts, xAxis = opts.xAxis, yAxis = opts.yAxis;
			xAxis.line = xAxis.line || {};
			xAxis.line.fill = xAxis.line.fill || 'none';
			yAxis.line = yAxis.line || {};
			yAxis.line.fill = yAxis.line.fill || 'none';
		},
		adaptSeries: function(context) {
			var i,j, d, nd, series = context.opts.series, s, dataType, fillStyle, extent = [0, 0], categoryData = context.opts.categories.data;
			for(i = 0; i < series.length; i++) {
				s = series[i];
				
				s.label.align = s.label.align || (context.isVertical ? 'middle' : 'end');
				s.animation = $.extend({}, context.opts.animation || {}, s.animation || {});
				
				for(j = 0; j < s.data.length; j++) {
					d = s.data[j];
					dataType = typeof d;
					if (dataType !== 'object') {
						nd = {};
						nd.value = d;
					} else {
						nd = s.data[j];
					}
					nd.category = categoryData[j];
					nd.fillStyle = $.extend({}, s.fillStyle, nd.fillStyle);
					nd.fillStyle.fill = nd.fillStyle.fill || (s.colors|| d3.scale.category20().range())[ j % s.data.length];
					nd.label = $.extend({}, s.label);
					nd.label.animation = $.extend({}, s.animation, nd.label.animation);
					s.data[j] = nd; 
					
					extent = d3.extent(extent.concat(d3.extent([nd.value])));
				}
			}
			context.seriesValueExtent = extent;
		}
	}

;var aCharts = window.aCharts || {};

aCharts.format = {};
aCharts.format.formatInt = formatInt;
aCharts.format.formatPercent = formatPercent;
aCharts.TWO_PI = twoPi;
aCharts.DEFAULT_DURATION = DEFAULT_DURATION;
aCharts.DEFAULT_EASE = DEFAULT_EASE;

aCharts.util = aCharts.util || {};
aCharts.util.toCssStyle = toCssStyle;
aCharts.util.adaptSize = adaptSize;


aCharts.Bar = Bar;
aCharts.Donut = DonutChart;

window.aCharts = window.aCharts || aCharts;;/**
 * New node file
 */
})()